import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Minus, Plus, Package, ArrowRight, ShieldCheck, Truck, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/cart")({ component: CartPage });

type CartRow = {
  id: string; quantity: number;
  products: { id: string; name: string; price: number; image_url: string | null; stock_quantity: number };
};

function CartPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("cart_items")
      .select("id,quantity,products(id,name,price,image_url,stock_quantity)")
      .eq("buyer_id", user.id);
    setItems((data ?? []) as unknown as CartRow[]);
    setInitialLoading(false);
  };

  useEffect(() => { if (user) load(); }, [user]);

  if (loading) return (
    <div className="container mx-auto px-4 py-32">
      <Skeleton className="h-12 w-48 mb-12 rounded-2xl" />
      <div className="grid lg:grid-cols-[1fr_380px] gap-12">
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-3xl" />
          <Skeleton className="h-32 w-full rounded-3xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center text-center">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Your cart is waiting</h1>
        <p className="text-muted-foreground max-w-sm mb-8">Sign in to see the items you've added and proceed to checkout.</p>
        <Link to="/login"><Button size="xl" className="rounded-full px-12 font-bold shadow-xl shadow-primary/20">Sign in to your account</Button></Link>
      </div>
    );
  }

  const updateQty = async (id: string, q: number) => {
    setBusy(true);
    if (q <= 0) await supabase.from("cart_items").delete().eq("id", id);
    else await supabase.from("cart_items").update({ quantity: q }).eq("id", id);
    await load(); setBusy(false);
  };
  const remove = async (id: string) => {
    setBusy(true);
    await supabase.from("cart_items").delete().eq("id", id);
    await load(); setBusy(false);
    toast.success("Item removed from cart");
  };

  const total = items.reduce((s, i) => s + i.quantity * Number(i.products.price), 0);

  return (
    <div className="bg-background min-h-screen pb-24 pt-32">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Your Bag</h1>
          <div className="h-8 min-w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
            {items.length}
          </div>
        </div>

        {initialLoading ? (
          <div className="grid lg:grid-cols-[1fr_380px] gap-12">
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-3xl" />
              <Skeleton className="h-32 w-full rounded-3xl" />
            </div>
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        ) : items.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-8">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Your bag is empty</h2>
            <p className="text-muted-foreground max-w-sm mb-10 text-lg">
              Looks like you haven't added anything yet. Explore our marketplace to find great deals.
            </p>
            <Link to="/products">
              <Button size="xl" className="rounded-full px-12 font-bold shadow-xl shadow-primary/20">
                Continue Shopping
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {items.map((it) => (
                  <motion.div
                    key={it.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <Card className="p-4 md:p-6 flex flex-col md:flex-row gap-6 items-center border-none shadow-sm hover:shadow-xl hover:shadow-foreground/5 transition-all rounded-[2rem]">
                      <div className="h-32 w-32 rounded-3xl bg-muted flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                        {it.products.image_url ? (
                          <img src={it.products.image_url} alt={it.products.name} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-10 w-10 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 text-center md:text-left min-w-0 space-y-2">
                        <Link to="/products/$id" params={{ id: it.products.id }}>
                          <h3 className="font-black text-xl hover:text-primary transition-colors line-clamp-1">{it.products.name}</h3>
                        </Link>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Verified Listing</p>
                        <p className="text-2xl font-black text-foreground">
                          <span className="text-xs font-medium mr-1 text-muted-foreground">KSh</span>
                          {Number(it.products.price).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-row md:flex-col items-center gap-4">
                        <div className="flex items-center bg-muted/50 border rounded-2xl p-1 shadow-inner">
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" disabled={busy} onClick={() => updateQty(it.id, it.quantity - 1)}>
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-10 text-center font-black">{it.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" disabled={busy || it.quantity >= it.products.stock_quantity} onClick={() => updateQty(it.id, it.quantity + 1)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full" onClick={() => remove(it.id)}>
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:sticky lg:top-32"
            >
              <Card className="p-8 border-none bg-card shadow-2xl shadow-foreground/5 rounded-[3rem] space-y-8">
                <h2 className="text-2xl font-black tracking-tight">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-muted-foreground font-medium">
                    <span>Subtotal</span>
                    <span>KSh {total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground font-medium">
                    <span>Estimated Shipping</span>
                    <span className="text-primary font-bold">Calculated at checkout</span>
                  </div>
                  <div className="h-px bg-border my-6" />
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Amount</p>
                      <p className="text-4xl font-black">
                        <span className="text-sm font-medium mr-1 text-muted-foreground">KSh</span>
                        {total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <Button className="w-full h-16 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform" onClick={() => navigate({ to: "/checkout" })}>
                    Go to Checkout <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  
                  <div className="p-4 rounded-2xl bg-primary/5 space-y-3">
                    <div className="flex items-center gap-3 text-xs">
                      <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                      <p className="font-bold">M-Pesa Verified Secure Checkout</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <Truck className="h-4 w-4 text-primary shrink-0" />
                      <p className="font-bold">Fast Countrywide Delivery</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
