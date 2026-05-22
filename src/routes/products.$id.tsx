import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { 
  Package, 
  Minus, 
  Plus, 
  ShoppingCart, 
  ShieldCheck, 
  Truck, 
  ArrowLeft, 
  Share2,
  Heart,
  Store,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/products/$id")({ component: ProductDetail });

type Product = {
  id: string; name: string; description: string | null; price: number;
  image_url: string | null; stock_quantity: number; seller_id: string;
};

function ProductDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase.from("products").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      setProduct(data as Product | null);
      setLoading(false);
    });
  }, [id]);

  const addToCart = async () => {
    if (!user) { navigate({ to: "/login" }); return; }
    if (!product) return;
    setAdding(true);
    const { data: existing } = await supabase
      .from("cart_items").select("id,quantity")
      .eq("buyer_id", user.id).eq("product_id", product.id).maybeSingle();
    const { error } = existing
      ? await supabase.from("cart_items").update({ quantity: existing.quantity + qty }).eq("id", existing.id)
      : await supabase.from("cart_items").insert({ buyer_id: user.id, product_id: product.id, quantity: qty });
    setAdding(false);
    if (error) return toast.error(error.message);
    toast.success("Added to cart", {
      description: `${qty}x ${product.name} successfully added.`,
      action: { label: "View Cart", onClick: () => navigate({ to: "/cart" }) }
    });
  };

  if (loading) return (
    <div className="container mx-auto px-4 py-32">
      <div className="grid md:grid-cols-2 gap-16">
        <Skeleton className="aspect-square rounded-[3rem]" />
        <div className="space-y-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-10 w-1/3" />
          <div className="space-y-2 pt-8">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="container mx-auto px-4 py-32 text-center">
      <div className="bg-muted h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Package className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
      <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist or was removed.</p>
      <Link to="/products"><Button className="rounded-full px-8">Back to Shop</Button></Link>
    </div>
  );

  const out = product.stock_quantity <= 0;
  
  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Breadcrumb / Top Bar */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/products" })} className="rounded-full group">
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" /> Back to Marketplace
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full"><Share2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="rounded-full text-destructive"><Heart className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:sticky lg:top-32"
          >
            <Card className="aspect-square overflow-hidden border-none bg-muted rounded-[3rem] shadow-2xl shadow-foreground/5 relative group">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                  <Package className="h-20 w-20" />
                  <p className="font-medium">No image available</p>
                </div>
              )}
              {out && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                  <Badge variant="destructive" className="text-lg px-6 py-2 rounded-full uppercase tracking-widest font-black shadow-2xl">Sold Out</Badge>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col h-full"
          >
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold">Premium Quality</Badge>
                  {!out && product.stock_quantity < 5 && <Badge variant="destructive" className="font-bold">Low Stock: Only {product.stock_quantity} left</Badge>}
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">{product.name}</h1>
                
                <div className="flex items-center gap-4 py-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sold By</p>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-sm underline cursor-pointer">Verified Seller Hub</p>
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary fill-primary/10" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">List Price</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl md:text-5xl font-black text-foreground">
                    <span className="text-lg font-medium mr-1 text-muted-foreground uppercase">KSh</span>
                    {Number(product.price).toLocaleString()}
                  </p>
                  <p className="text-muted-foreground line-through text-sm">KSh {(Number(product.price) * 1.15).toLocaleString()}</p>
                </div>
                <p className="text-xs font-medium text-primary">Price includes VAT where applicable</p>
              </div>

              <div className="p-6 rounded-[2rem] bg-muted/30 border space-y-4">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <div className="text-sm">
                    <p className="font-bold">Countrywide Delivery</p>
                    <p className="text-muted-foreground">Arrives within 2-4 business days</p>
                  </div>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <div className="text-sm">
                    <p className="font-bold">ShopHub Protection</p>
                    <p className="text-muted-foreground">100% money-back guarantee for description mismatches</p>
                  </div>
                </div>
              </div>

              {!out && (
                <div className="space-y-6 pt-4">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col gap-2">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Quantity</p>
                      <div className="flex items-center bg-card border rounded-2xl p-1 shadow-sm">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4" /></Button>
                        <span className="w-12 text-center font-black text-lg">{qty}</span>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => setQty(Math.min(product.stock_quantity, qty + 1))}><Plus className="h-4 w-4" /></Button>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest invisible">Action</p>
                      <Button size="xl" onClick={addToCart} disabled={adding} className="w-full rounded-[1.25rem] font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                        {adding ? "Processing..." : (
                          <span className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" /> Add to Cart
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="lg" className="rounded-2xl font-bold">Buy Now</Button>
                    <Button variant="outline" size="lg" className="rounded-2xl font-bold">Check Availability</Button>
                  </div>
                </div>
              )}

              <div className="pt-8 space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 underline underline-offset-4 decoration-primary/30 decoration-4">
                  Product Description
                </h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-lg">
                  {product.description || "No description provided for this premium item."}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
