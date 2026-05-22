import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Truck, 
  Smartphone, 
  ArrowLeft, 
  CheckCircle2, 
  CreditCard,
  Lock,
  Package
} from "lucide-react";

export const Route = createFileRoute("/checkout")({ component: CheckoutPage });

type CartRow = { id: string; quantity: number; products: { id: string; name: string; price: number; seller_id: string; stock_quantity: number; image_url: string | null } };

function CheckoutPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartRow[]>([]);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("cart_items")
      .select("id,quantity,products(id,name,price,seller_id,stock_quantity,image_url)")
      .eq("buyer_id", user.id)
      .then(({ data }) => setItems((data ?? []) as unknown as CartRow[]));
  }, [user]);

  if (loading) return null;
  if (!user) {
    return (
      <div className="container mx-auto py-32 text-center">
        <Link to="/login"><Button size="xl" className="rounded-full px-12 font-bold">Sign in to checkout</Button></Link>
      </div>
    );
  }

  const total = items.reduce((s, i) => s + i.quantity * Number(i.products.price), 0);

  const placeOrder = async () => {
    if (!phone.match(/^254\d{9}$/)) return toast.error("Phone must be in format 2547XXXXXXXX");
    if (!address.trim()) return toast.error("Shipping address required");
    if (items.length === 0) return toast.error("Cart is empty");
    setPlacing(true);

    // 1. Create order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        buyer_id: user.id,
        total_amount: total,
        shipping_address: address,
        shipping_phone: phone,
      })
      .select().single();
    if (orderErr || !order) { setPlacing(false); return toast.error(orderErr?.message ?? "Order failed"); }

    // 2. Items
    const { error: itemsErr } = await supabase.from("order_items").insert(
      items.map((i) => ({
        order_id: order.id,
        product_id: i.products.id,
        seller_id: i.products.seller_id,
        product_name: i.products.name,
        quantity: i.quantity,
        unit_price: i.products.price,
      }))
    );
    if (itemsErr) { setPlacing(false); return toast.error(itemsErr.message); }

    // 3. Decrement stock
    for (const i of items) {
      await supabase
        .from("products")
        .update({ stock_quantity: Math.max(0, i.products.stock_quantity - i.quantity) })
        .eq("id", i.products.id);
    }

    // 4. Trigger M-Pesa STK push
    try {
      const { data, error } = await supabase.functions.invoke("mpesa-stk-push", {
        body: { order_id: order.id, phone, amount: Math.ceil(total) },
      });
      if (error) throw error;
      if (data?.ok) {
        toast.success("Payment Request Sent", {
          description: "Please check your phone for the M-Pesa PIN prompt."
        });
      } else {
        toast.info("Order Placed", {
          description: "M-Pesa push failed, but your order is saved. Admin will contact you."
        });
      }
    } catch (e) {
      console.warn("M-Pesa not configured:", e);
      toast.info("Order Placed", {
        description: "Your order has been recorded. Payment will be coordinated manually."
      });
    }

    // 5. Clear cart
    await supabase.from("cart_items").delete().eq("buyer_id", user.id);
    setPlacing(false);
    navigate({ to: "/orders" });
  };

  return (
    <div className="bg-background min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-4 mb-12">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/cart" })} className="rounded-full">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-8 border-none bg-card shadow-2xl shadow-foreground/5 rounded-[3rem] space-y-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Truck className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">Shipping Information</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="addr" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Delivery Address</Label>
                    <Textarea 
                      id="addr" 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)} 
                      placeholder="Street name, Apartment, City, County" 
                      className="rounded-2xl min-h-[120px] border-muted focus-visible:ring-primary/20 p-4 text-lg"
                    />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="p-8 border-none bg-card shadow-2xl shadow-foreground/5 rounded-[3rem] space-y-8">
                <div className="flex items-center gap-3 justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">Payment Method</h2>
                  </div>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-none font-bold">M-Pesa Verified</Badge>
                </div>
                
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl border-2 border-primary bg-primary/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-2 rounded-xl shadow-sm">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/512px-M-PESA_LOGO-01.svg.png" alt="M-Pesa" className="h-8 w-auto object-contain" />
                      </div>
                      <div>
                        <p className="font-bold">M-Pesa STK Push</p>
                        <p className="text-xs text-muted-foreground">Direct PIN prompt on your phone</p>
                      </div>
                    </div>
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ph" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">M-Pesa Phone Number</Label>
                    <Input 
                      id="ph" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="254712345678" 
                      className="rounded-2xl h-14 border-muted focus-visible:ring-primary/20 px-4 text-lg font-bold tracking-widest"
                    />
                    <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1.5 ml-1">
                      <Lock className="h-3 w-3" /> Encrypted and secure payment processing
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          <aside className="lg:sticky lg:top-32 space-y-6">
            <Card className="p-8 border-none bg-card shadow-2xl shadow-foreground/5 rounded-[3rem] space-y-8">
              <h2 className="text-2xl font-black tracking-tight">Summary</h2>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((i) => (
                  <div key={i.id} className="flex gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-muted overflow-hidden shrink-0">
                      {i.products.image_url ? (
                        <img src={i.products.image_url} alt={i.products.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center"><Package className="h-6 w-6 text-muted-foreground" /></div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm line-clamp-1">{i.products.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {i.quantity}</p>
                      <p className="font-black text-sm mt-1">KSh {(i.quantity * Number(i.products.price)).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t pt-6">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total to Pay</p>
                    <p className="text-4xl font-black">
                      <span className="text-sm font-medium mr-1 text-muted-foreground">KSh</span>
                      {total.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <Button className="w-full h-16 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform" disabled={placing} onClick={placeOrder}>
                  {placing ? (
                    <span className="flex items-center gap-2">
                      <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Pay with M-Pesa <CreditCard className="ml-2 h-5 w-5" />
                    </span>
                  )}
                </Button>
                
                <div className="flex items-center justify-center gap-4 py-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">100% Secure Payment</p>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, variant, className }: { children: React.ReactNode, variant?: string, className?: string }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-black ${className}`}>
      {children}
    </span>
  );
}
