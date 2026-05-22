import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase-browser";
import { useAuth, hasRole } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Download, 
  Trash2, 
  Users, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  ArrowUpRight, 
  Settings, 
  Search,
  CheckCircle2,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/admin")({ component: AdminDashboard });

type ProfileRow = { id: string; full_name: string | null; phone: string | null; created_at: string };
type RoleRow = { user_id: string; role: string };
type ProductRow = { id: string; name: string; price: number; seller_id: string; is_active: boolean; created_at: string };
type OrderRow = { id: string; total_amount: number; status: string; payment_status: string; created_at: string; buyer_id: string };

function AdminDashboard() {
  const { user, roles, loading } = useAuth();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [userRoles, setUserRoles] = useState<RoleRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [cats, setCats] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [newCat, setNewCat] = useState("");

  const load = async () => {
    const [{ data: p }, { data: r }, { data: pr }, { data: o }, { data: c }] = await Promise.all([
      supabase.from("profiles").select("id,full_name,phone,created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id,role"),
      supabase.from("products").select("id,name,price,seller_id,is_active,created_at").order("created_at", { ascending: false }),
      supabase.from("orders").select("id,total_amount,status,payment_status,created_at,buyer_id").order("created_at", { ascending: false }),
      supabase.from("categories").select("id,name,slug").order("name"),
    ]);
    setProfiles((p ?? []) as ProfileRow[]);
    setUserRoles((r ?? []) as RoleRow[]);
    setProducts((pr ?? []) as ProductRow[]);
    setOrders((o ?? []) as OrderRow[]);
    setCats(c ?? []);
  };

  const addCategory = async () => {
    if (!newCat) return;
    const slug = newCat.toLowerCase().replace(/\s+/g, "-");
    const { error } = await supabase.from("categories").insert({ name: newCat, slug });
    if (error) return toast.error(error.message);
    setNewCat("");
    load();
    toast.success("Category added successfully");
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete category? Products in this category will become uncategorized.")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };
  useEffect(() => { if (hasRole(roles, "admin")) load(); }, [roles]);

  if (loading) return null;
  if (!user) return <div className="container mx-auto py-32 text-center"><Link to="/login"><Button size="xl" className="rounded-full">Sign in to your account</Button></Link></div>;
  if (!hasRole(roles, "admin"))
    return (
      <div className="container mx-auto py-32 text-center text-muted-foreground flex flex-col items-center gap-4">
        <LockIcon className="h-16 w-16 opacity-20" />
        <h2 className="text-2xl font-bold text-foreground">Admin Access Required</h2>
        <p className="max-w-xs">You don't have the necessary permissions to view the command center.</p>
        <Link to="/"><Button variant="outline" className="rounded-full px-8 mt-4">Back to Marketplace</Button></Link>
      </div>
    );

  const rolesOf = (uid: string) => userRoles.filter((r) => r.user_id === uid).map((r) => r.role);

  const totalRevenue = orders.filter((o) => o.payment_status === "paid").reduce((s, o) => s + Number(o.total_amount), 0);
  const totalOrders = orders.length;
  const paidOrders = orders.filter((o) => o.payment_status === "paid").length;

  const csvDownload = (rows: object[], filename: string) => {
    if (rows.length === 0) return toast.error("Nothing to export");
    const keys = Object.keys(rows[0]);
    const csv = [keys.join(","), ...rows.map((r) => keys.map((k) => JSON.stringify((r as Record<string, unknown>)[k] ?? "")).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const setRole = async (uid: string, role: "admin" | "seller" | "buyer") => {
    const { error } = await supabase.from("user_roles").insert({ user_id: uid, role });
    if (error && !error.message.includes("duplicate")) return toast.error(error.message);
    toast.success(`Role ${role} assigned`); load();
  };

  const removeRole = async (uid: string, role: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", role as "admin" | "seller" | "buyer");
    if (error) return toast.error(error.message);
    load();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const updateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Order status updated");
    load();
  };

  return (
    <div className="bg-background min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-4">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Command Center</h1>
            <p className="text-muted-foreground mt-2 font-medium">Global platform overview and system management.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-2xl font-bold h-12 px-6"><Settings className="h-4 w-4 mr-2" /> System Logs</Button>
            <Button className="rounded-2xl font-bold h-12 px-6 shadow-xl shadow-primary/20">Global Reports</Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <AdminStatCard label="Total Revenue" value={`KSh ${totalRevenue.toLocaleString()}`} icon={DollarSign} trend="+18.2%" />
          <AdminStatCard label="Platform Users" value={profiles.length} icon={Users} trend="+124 this week" />
          <AdminStatCard label="Listed Products" value={products.length} icon={Package} trend="+12 today" />
          <AdminStatCard label="Processed Orders" value={totalOrders} icon={ShoppingBag} sub={`${paidOrders} paid`} />
        </div>

        <Tabs defaultValue="users" className="space-y-8">
          <TabsList className="bg-muted/50 p-1.5 rounded-[2rem] h-14 border border-border/50 backdrop-blur-sm">
            <TabsTrigger value="users" className="rounded-full px-8 h-full font-bold">Users</TabsTrigger>
            <TabsTrigger value="categories" className="rounded-full px-8 h-full font-bold">Categories</TabsTrigger>
            <TabsTrigger value="products" className="rounded-full px-8 h-full font-bold">Products</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-full px-8 h-full font-bold">Orders</TabsTrigger>
            <TabsTrigger value="reports" className="rounded-full px-8 h-full font-bold text-primary">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="border-none bg-card shadow-2xl shadow-foreground/5 rounded-[3rem] overflow-hidden">
              <div className="p-8 border-b flex items-center justify-between">
                <h3 className="text-xl font-bold tracking-tight">User Management</h3>
                <div className="relative w-64">
                  <Input placeholder="Search users..." className="rounded-2xl pl-10 border-muted" />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="p-6 text-left font-bold uppercase tracking-widest text-[10px] text-muted-foreground">User Profile</th>
                      <th className="p-6 text-left font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Contact</th>
                      <th className="p-6 text-left font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Permissions</th>
                      <th className="p-6 text-left font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Joined</th>
                      <th className="p-6 text-right font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Management</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((p) => (
                      <tr key={p.id} className="border-t hover:bg-muted/20 transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                              {p.full_name?.charAt(0).toUpperCase() ?? "U"}
                            </div>
                            <span className="font-bold">{p.full_name ?? "Anonymous User"}</span>
                          </div>
                        </td>
                        <td className="p-6 font-medium text-muted-foreground">{p.phone ?? "No phone"}</td>
                        <td className="p-6">
                          <div className="flex flex-wrap gap-1.5">
                            {rolesOf(p.id).map((r) => (
                              <Badge key={r} variant="secondary" className="rounded-full bg-primary/5 text-primary border-none font-bold px-3 py-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => removeRole(p.id, r as string)} title="Click to remove">
                                {r}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-6 text-muted-foreground font-medium">{new Date(p.created_at).toLocaleDateString()}</td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-2">
                            {(["buyer","seller","admin"] as const).filter(r => !rolesOf(p.id).includes(r)).map(r => (
                              <Button key={r} size="sm" variant="ghost" className="rounded-full font-bold text-[10px] uppercase border" onClick={() => setRole(p.id, r)}>+ {r}</Button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card className="p-10 border-none bg-card shadow-2xl shadow-foreground/5 rounded-[3rem]">
              <div className="max-w-xl">
                <h3 className="text-2xl font-black tracking-tight mb-2">Category Taxonomy</h3>
                <p className="text-muted-foreground mb-8 font-medium">Define and organize product segments across the marketplace.</p>
                <div className="flex gap-3 mb-12">
                  <Input placeholder="New Category Name (e.g. Premium Electronics)" value={newCat} onChange={(e) => setNewCat(e.target.value)} className="rounded-2xl h-14 border-muted text-lg font-medium px-6" />
                  <Button onClick={addCategory} size="xl" className="rounded-2xl font-bold px-8 shadow-xl shadow-primary/20"><Plus className="h-5 w-5 mr-2" /> Add</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {cats.map((c) => (
                  <motion.div key={c.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-between p-5 rounded-3xl border bg-muted/30 group hover:border-primary transition-all">
                    <span className="font-bold">{c.name}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteCategory(c.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="border-none bg-card shadow-2xl shadow-foreground/5 rounded-[3rem] overflow-hidden">
              <div className="p-8 border-b flex items-center justify-between">
                <h3 className="text-xl font-bold tracking-tight">Catalog Management</h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{products.length} Items Total</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="p-6 text-left font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Product</th>
                      <th className="p-6 text-left font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Valuation</th>
                      <th className="p-6 text-left font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Market Status</th>
                      <th className="p-6 text-left font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Listed Date</th>
                      <th className="p-6 text-right font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-t hover:bg-muted/20 transition-colors">
                        <td className="p-6 font-bold">{p.name}</td>
                        <td className="p-6 font-black">KSh {Number(p.price).toLocaleString()}</td>
                        <td className="p-6">
                          <Badge className={p.is_active ? "bg-green-500/10 text-green-700 border-none font-bold" : "bg-muted text-muted-foreground border-none font-bold"}>
                            {p.is_active ? "Live" : "Hidden"}
                          </Badge>
                        </td>
                        <td className="p-6 text-muted-foreground font-medium">{new Date(p.created_at).toLocaleDateString()}</td>
                        <td className="p-6 text-right">
                          <Button variant="ghost" size="icon" className="rounded-full text-destructive hover:bg-destructive/10" onClick={() => deleteProduct(p.id)}><Trash2 className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="border-none bg-card shadow-2xl shadow-foreground/5 rounded-[3rem] overflow-hidden">
              <div className="p-8 border-b flex items-center justify-between">
                <h3 className="text-xl font-bold tracking-tight">Order Fulfillment</h3>
                <Badge className="bg-primary/10 text-primary border-none font-bold px-4">Global Queue</Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="p-6 text-left font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Order Ref</th>
                      <th className="p-6 text-left font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Transaction</th>
                      <th className="p-6 text-left font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Logistics Status</th>
                      <th className="p-6 text-left font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Payment</th>
                      <th className="p-6 text-left font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Timeline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-t hover:bg-muted/20 transition-colors">
                        <td className="p-6 font-mono font-bold text-xs">#{o.id.slice(0,8)}</td>
                        <td className="p-6 font-black text-lg">KSh {Number(o.total_amount).toLocaleString()}</td>
                        <td className="p-6">
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                            className="bg-muted/50 text-xs font-black border-none rounded-xl px-4 py-2 focus:ring-2 ring-primary/20 outline-none cursor-pointer uppercase tracking-tighter"
                          >
                            {["pending","processing","shipped","delivered","cancelled"].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-6">
                          <Badge className={o.payment_status === "paid" ? "bg-green-500/10 text-green-700 border-none font-bold" : "bg-orange-500/10 text-orange-700 border-none font-bold"}>
                            {o.payment_status}
                          </Badge>
                        </td>
                        <td className="p-6 text-muted-foreground font-medium">{new Date(o.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <div className="grid md:grid-cols-3 gap-6">
              <ReportCard title="Financial Settlement" desc="Export all transaction logs for financial audit." onClick={() => csvDownload(orders, "revenue_report.csv")} />
              <ReportCard title="Inventory Audit" desc="Complete snapshot of listed and inactive items." onClick={() => csvDownload(products, "inventory_audit.csv")} />
              <ReportCard title="Marketplace Growth" desc="Detailed registered user and seller metrics." onClick={() => csvDownload(profiles, "growth_metrics.csv")} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AdminStatCard({ label, value, icon: Icon, trend, sub }: { label: string; value: string | number; icon: any; trend?: string; sub?: string }) {
  return (
    <Card className="p-8 border-none bg-card shadow-2xl shadow-foreground/5 rounded-[2.5rem] group hover:bg-primary transition-all duration-500">
      <div className="flex justify-between items-start mb-6">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 group-hover:bg-white/20 flex items-center justify-center text-primary group-hover:text-white transition-colors">
          <Icon className="h-6 w-6" />
        </div>
        <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-white/60 transition-colors" />
      </div>
      <p className="text-sm font-bold text-muted-foreground group-hover:text-white/80 uppercase tracking-widest transition-colors">{label}</p>
      <p className="text-3xl font-black mt-1 group-hover:text-white transition-colors">{value}</p>
      {trend && <p className="text-[10px] font-bold text-primary group-hover:text-white/90 mt-3 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-current" /> {trend}</p>}
      {sub && <p className="text-xs font-medium text-muted-foreground group-hover:text-white/60 mt-1 transition-colors">{sub}</p>}
    </Card>
  );
}

function ReportCard({ title, desc, onClick }: { title: string; desc: string; onClick: () => void }) {
  return (
    <Card className="p-8 border-none bg-card shadow-2xl shadow-foreground/5 rounded-[2.5rem] flex flex-col justify-between group hover:shadow-primary/10 transition-all">
      <div className="space-y-3">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Download className="h-6 w-6" />
        </div>
        <h4 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </div>
      <Button variant="outline" className="mt-8 rounded-2xl font-bold h-12 border-muted w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all" onClick={onClick}>Generate CSV</Button>
    </Card>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
