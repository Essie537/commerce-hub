import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase-browser";
import { useAuth, hasRole } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Trash2, Plus, Package, TrendingUp, DollarSign, ShoppingBag, Eye, MoreHorizontal, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/seller")({ component: SellerDashboard });

type Product = { id: string; name: string; description: string | null; price: number; stock_quantity: number; image_url: string | null; category_id: string | null; is_active: boolean };
type Category = { id: string; name: string };
type OrderItem = { id: string; product_name: string; quantity: number; unit_price: number; orders: { id: string; status: string; created_at: string; payment_status: string; shipping_address: string; shipping_phone: string } };

function SellerDashboard() {
  const { user, roles, loading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [sales, setSales] = useState<(OrderItem & { orders: { shipping_address: string; shipping_phone: string } })[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "", category_id: "", image_url: "" });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [chartRange, setChartRange] = useState<7 | 30>(7);

  const load = async () => {
    if (!user) return;
    const [{ data: p }, { data: c }, { data: s }] = await Promise.all([
      supabase.from("products").select("*").eq("seller_id", user.id).order("created_at", { ascending: false }),
      supabase.from("categories").select("id,name").order("name"),
      supabase.from("order_items").select("id,product_name,quantity,unit_price,orders(id,status,created_at,payment_status,shipping_address,shipping_phone)").eq("seller_id", user.id).order("id", { ascending: false }),
    ]);
    setProducts((p ?? []) as Product[]);
    setCats((c ?? []) as Category[]);
    setSales((s ?? []) as unknown as (OrderItem & { orders: { shipping_address: string; shipping_phone: string } })[]);
  };

  const toggleStatus = async (id: string, current: boolean) => {
    const { error } = await supabase.from("products").update({ is_active: !current }).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };
  useEffect(() => { if (user) load(); }, [user]);

  if (loading) return null;
  if (!user) return <div className="container mx-auto py-32 text-center"><Link to="/login"><Button size="xl" className="rounded-full">Sign in to your account</Button></Link></div>;
  if (!hasRole(roles, "seller") && !hasRole(roles, "admin"))
    return <div className="container mx-auto py-32 text-center text-muted-foreground">Seller access required. Sign up as a seller to list products.</div>;

  const openNew = () => { setEditing(null); setForm({ name: "", description: "", price: "", stock: "", category_id: "", image_url: "" }); setFile(null); setOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description ?? "", price: String(p.price), stock: String(p.stock_quantity), category_id: p.category_id ?? "", image_url: p.image_url ?? "" });
    setFile(null); setOpen(true);
  };

  const save = async () => {
    if (!form.name || !form.price) return toast.error("Name and price are required");
    setSaving(true);
    let image_url = form.image_url || null;
    if (file) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(path, file);
      if (upErr) { setSaving(false); return toast.error(upErr.message); }
      image_url = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
    }
    const payload = {
      name: form.name, description: form.description || null,
      price: Number(form.price), stock_quantity: parseInt(form.stock || "0", 10),
      category_id: form.category_id || null, image_url, seller_id: user.id,
    };
    const { error } = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Product updated" : "Product added successfully");
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  const totalRevenue = sales.filter(s => s.orders.payment_status === "paid").reduce((sum, s) => sum + s.quantity * Number(s.unit_price), 0);

  const chartData = useMemo(() => {
    const range = chartRange;
    const days = [...Array(range)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();

    return days.map(date => ({
      date: new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      revenue: sales
        .filter(s => s.orders.created_at.startsWith(date) && s.orders.payment_status === "paid")
        .reduce((sum, s) => sum + s.quantity * Number(s.unit_price), 0)
    }));
  }, [sales, chartRange]);

  return (
    <div className="bg-background min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-4">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Seller Console</h1>
            <p className="text-muted-foreground mt-2 font-medium">Manage your products, track sales, and grow your business.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} size="xl" className="rounded-2xl font-bold shadow-xl shadow-primary/20">
                <Plus className="h-5 w-5 mr-2" /> Add New Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl rounded-[3rem] p-8">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black tracking-tight">{editing ? "Edit Product" : "Launch New Product"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Product Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-2xl h-12 border-muted" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Full Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-2xl min-h-[100px] border-muted" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Price (KSh)</Label>
                    <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="rounded-2xl h-12 border-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Inventory Count</Label>
                    <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="rounded-2xl h-12 border-muted" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Category Assignment</Label>
                  <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                    <SelectTrigger className="rounded-2xl h-12 border-muted"><SelectValue placeholder="Select a Category" /></SelectTrigger>
                    <SelectContent className="rounded-xl">{cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Product Imagery</Label>
                  <div className="flex items-center gap-4">
                    <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="rounded-2xl h-12 border-muted pt-2.5" />
                    {form.image_url && !file && <img src={form.image_url} alt="" className="h-12 w-12 rounded-xl object-cover shadow-sm border" />}
                  </div>
                </div>
                <Button onClick={save} disabled={saving} size="xl" className="w-full rounded-2xl font-bold mt-4 shadow-xl shadow-primary/20">
                  {saving ? "Deploying..." : (editing ? "Save Changes" : "List Product Now")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard label="Total Revenue" value={`KSh ${totalRevenue.toLocaleString()}`} icon={DollarSign} trend="+12.5% vs last month" />
          <StatCard label="Active Products" value={products.length} icon={Package} trend={`${products.filter(p => p.is_active).length} online`} />
          <StatCard label="Total Sales" value={sales.length} icon={ShoppingBag} trend={`${sales.filter(s => s.orders.payment_status === "paid").length} paid`} />
          <StatCard label="Views (24h)" value="1,284" icon={Eye} trend="+84 today" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <Card className="lg:col-span-2 p-8 border-none bg-card shadow-2xl shadow-foreground/5 rounded-[3rem]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Revenue Trends</h3>
                <p className="text-sm text-muted-foreground">Performance for the last {chartRange} days</p>
              </div>
              <div className="flex gap-1 bg-muted/50 p-1 rounded-xl">
                <Button 
                  variant={chartRange === 7 ? "secondary" : "ghost"} 
                  size="sm" 
                  className="rounded-lg h-8 text-[10px] font-bold px-4"
                  onClick={() => setChartRange(7)}
                >
                  7D
                </Button>
                <Button 
                  variant={chartRange === 30 ? "secondary" : "ghost"} 
                  size="sm" 
                  className="rounded-lg h-8 text-[10px] font-bold px-4"
                  onClick={() => setChartRange(30)}
                >
                  30D
                </Button>
              </div>
            </div>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} dy={10} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)", fontSize: "12px", fontWeight: 700 }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-8 border-none bg-card shadow-2xl shadow-foreground/5 rounded-[3rem] flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight">Quick Actions</h3>
              <p className="text-sm text-muted-foreground">Common management tasks</p>
            </div>
            <div className="space-y-3 mt-8">
              <QuickActionButton icon={TrendingUp} label="View Market Insights" />
              <QuickActionButton icon={ShoppingBag} label="Process Pending Orders" />
              <QuickActionButton icon={Package} label="Update Inventory Stock" />
              <QuickActionButton icon={DollarSign} label="Request Payout" />
            </div>
            <div className="mt-8 pt-8 border-t">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Seller Support</p>
              <Button variant="outline" className="w-full rounded-2xl font-bold h-12">Contact Account Manager</Button>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <TabsList className="bg-muted/50 p-1.5 rounded-[2rem] h-14 border border-border/50 backdrop-blur-sm">
              <TabsTrigger value="products" className="rounded-full px-8 h-full font-bold data-[state=active]:bg-background data-[state=active]:shadow-lg">Products</TabsTrigger>
              <TabsTrigger value="sales" className="rounded-full px-8 h-full font-bold data-[state=active]:bg-background data-[state=active]:shadow-lg">Sales & Fulfillment</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="products">
            <AnimatePresence mode="popLayout">
              {products.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32 bg-card rounded-[3rem] border-none shadow-sm">
                  <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6"><Package className="h-10 w-10 text-muted-foreground" /></div>
                  <h3 className="text-2xl font-bold mb-2">No products listed yet</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto mb-8">Ready to start selling? Add your first product to the hub marketplace.</p>
                  <Button onClick={openNew} size="lg" className="rounded-full px-8 font-bold">List Your First Product</Button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((p) => (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} layout>
                      <Card className="p-6 border-none bg-card shadow-lg shadow-foreground/5 rounded-[2.5rem] group hover:shadow-2xl transition-all">
                        <div className="relative aspect-square rounded-[2rem] bg-muted overflow-hidden mb-6">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-500" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center"><Package className="h-12 w-12 text-muted-foreground" /></div>
                          )}
                          <div className="absolute top-4 right-4">
                            <Button 
                              size="icon" 
                              variant="secondary" 
                              className={`rounded-full shadow-lg ${p.is_active ? "text-green-600" : "text-muted-foreground"}`}
                              onClick={() => toggleStatus(p.id, p.is_active)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-lg line-clamp-1">{p.name}</h4>
                            <Badge className={p.is_active ? "bg-green-500/10 text-green-700 border-none" : "bg-muted text-muted-foreground border-none"}>
                              {p.is_active ? "Active" : "Hidden"}
                            </Badge>
                          </div>
                          <p className="text-xl font-black">
                            <span className="text-xs font-medium mr-1 text-muted-foreground uppercase">KSh</span>
                            {Number(p.price).toLocaleString()}
                          </p>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest pt-2 flex items-center gap-2">
                            Stock Level: <span className={p.stock_quantity < 5 ? "text-destructive" : "text-primary"}>{p.stock_quantity} units</span>
                          </p>
                        </div>
                        <div className="mt-6 flex gap-2">
                          <Button variant="secondary" size="sm" className="flex-1 rounded-xl font-bold" onClick={() => openEdit(p)}><Pencil className="h-3 w-3 mr-2" /> Edit</Button>
                          <Button variant="ghost" size="icon" className="rounded-xl text-destructive hover:bg-destructive/10" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="sales">
            <div className="space-y-6">
              {sales.length === 0 ? (
                <div className="text-center py-32 bg-card rounded-[3rem] border-none shadow-sm">
                  <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6"><ShoppingBag className="h-10 w-10 text-muted-foreground" /></div>
                  <h3 className="text-2xl font-bold">No sales recorded yet</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto mt-2">When customers purchase your items, they will appear here for processing.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sales.map((s) => (
                    <motion.div key={s.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                      <Card className="p-8 border-none bg-card shadow-lg shadow-foreground/5 rounded-[3rem] flex flex-col md:flex-row gap-8 items-start md:items-center justify-between hover:shadow-2xl transition-all">
                        <div className="flex items-center gap-6">
                          <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                            <ShoppingBag className="h-8 w-8" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h4 className="text-2xl font-black">{s.product_name}</h4>
                              <Badge className="bg-primary/10 text-primary border-none font-bold">× {s.quantity}</Badge>
                            </div>
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Order #{s.orders.id.slice(0, 8)} · {new Date(s.orders.created_at).toLocaleDateString()}</p>
                            <div className="flex items-center gap-2 pt-1">
                              <Badge className={s.orders.payment_status === "paid" ? "bg-green-500/10 text-green-700 border-none" : "bg-orange-500/10 text-orange-700 border-none"}>
                                {s.orders.payment_status === "paid" ? "Paid via M-Pesa" : "Payment Pending"}
                              </Badge>
                              <Badge className="bg-muted text-muted-foreground border-none capitalize">{s.orders.status}</Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col md:items-end gap-2 pr-8 border-l md:pl-8">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Customer Fulfillment</p>
                          <p className="text-sm font-bold max-w-[240px] md:text-right">{s.orders.shipping_address}</p>
                          <p className="text-lg font-black text-primary">{s.orders.shipping_phone}</p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Net Earnings</p>
                            <p className="text-3xl font-black">
                              <span className="text-sm font-medium mr-1 text-muted-foreground">KSh</span>
                              {(s.quantity * Number(s.unit_price)).toLocaleString()}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" className="rounded-full"><MoreHorizontal className="h-5 w-5" /></Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend }: { label: string; value: string | number; icon: any; trend: string }) {
  return (
    <Card className="p-8 border-none bg-card shadow-2xl shadow-foreground/5 rounded-[2.5rem] group hover:bg-primary transition-all duration-500">
      <div className="flex justify-between items-start mb-6">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-white/20 group-hover:text-white transition-colors">
          <Icon className="h-6 w-6" />
        </div>
        <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-white/60 transition-colors" />
      </div>
      <p className="text-sm font-bold text-muted-foreground group-hover:text-white/80 transition-colors uppercase tracking-widest">{label}</p>
      <p className="text-3xl font-black mt-1 group-hover:text-white transition-colors">{value}</p>
      <p className="text-[10px] font-bold text-primary group-hover:text-white/90 mt-3 flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-current" /> {trend}
      </p>
    </Card>
  );
}

function QuickActionButton({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <button className="w-full flex items-center justify-between p-4 rounded-2xl border bg-muted/30 hover:bg-muted transition-all group">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="font-bold text-sm">{label}</span>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-all" />
    </button>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${className}`}>
      {children}
    </span>
  );
}
