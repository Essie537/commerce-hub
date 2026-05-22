import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Smartphone,
  ShieldCheck,
  Truck,
  Headphones,
  Sparkles,
  TrendingUp,
  Star,
  CheckCircle2,
} from "lucide-react";
import { ProductCard, type Product } from "@/components/ProductCard";
import { motion } from "framer-motion";

export const Route = createFileRoute("/")({ component: Home });

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [cats, setCats] = useState<{ id: string; name: string; slug: string }[]>([]);

  useEffect(() => {
    supabase
      .from("products")
      .select("id,name,price,image_url,stock_quantity")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => setFeatured((data ?? []) as Product[]));
    supabase
      .from("categories")
      .select("id,name,slug")
      .then(({ data }) => setCats(data ?? []));
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* Promo bar */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-primary text-primary-foreground text-[10px] md:text-xs font-medium"
      >
        <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            <span>Free delivery in Nairobi on orders above KSh 2,500</span>
          </div>
          <div className="hidden md:block h-3 w-px bg-primary-foreground/20" />
          <div className="flex items-center gap-1.5">
            <Smartphone className="h-3 w-3" />
            <span>Pay safely with M-Pesa STK Push</span>
          </div>
        </div>
      </motion.div>

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center pt-20 pb-16 lg:pt-32 lg:pb-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 -z-10 bg-background" />
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-[radial-gradient(circle_at_70%_30%,var(--color-primary)_0%,transparent_70%)] opacity-[0.07]" />
        <div className="absolute -bottom-24 -left-24 -z-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-2xl"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary ring-1 ring-primary/20 mb-6">
              <TrendingUp className="h-3.5 w-3.5" /> 
              <span>KENYA'S #1 MODERN MARKETPLACE</span>
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
              Shop Smarter.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Pay Faster.
              </span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-lg">
              Thousands of premium products from trusted local sellers, 
              delivered countrywide with the safety of M-Pesa.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-wrap gap-4 mb-12">
              <Link to="/products">
                <Button size="xl" className="rounded-full px-8 font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105">
                  Start Shopping <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/profile">
                <Button size="xl" variant="outline" className="rounded-full px-8 font-bold hover:bg-muted/50 transition-all">
                  Sell with Us
                </Button>
              </Link>
            </motion.div>
            
            <motion.div variants={fadeIn} className="flex items-center gap-8 border-t pt-8">
              <div className="space-y-1">
                <p className="text-3xl font-bold">10k+</p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Products</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="space-y-1">
                <p className="text-3xl font-bold">500+</p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Sellers</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="space-y-1 text-primary">
                <div className="flex items-center gap-1 text-3xl font-bold">
                  4.9 <Star className="h-5 w-5 fill-current" />
                </div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Rating</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 grid grid-cols-2 gap-6 p-4">
              {[
                { Icon: Smartphone, label: "M-Pesa STK", color: "bg-green-500/10 text-green-600" },
                { Icon: Truck, label: "Fast Delivery", color: "bg-blue-500/10 text-blue-600" },
                { Icon: ShieldCheck, label: "Secure Shop", color: "bg-purple-500/10 text-purple-600" },
                { Icon: Headphones, label: "24/7 Support", color: "bg-orange-500/10 text-orange-600" },
              ].map((feature, i) => (
                <motion.div
                  key={feature.label}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="bg-card p-8 rounded-3xl shadow-2xl shadow-foreground/5 border flex flex-col items-center text-center gap-4 group transition-all"
                >
                  <div className={`p-4 rounded-2xl ${feature.color} group-hover:scale-110 transition-transform`}>
                    <feature.Icon className="h-8 w-8" />
                  </div>
                  <p className="font-bold text-lg">{feature.label}</p>
                </motion.div>
              ))}
            </div>
            {/* Decorative element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-3xl -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Shop by Category</h2>
              <p className="text-muted-foreground text-lg">Curated collections for every Kenyan home</p>
            </div>
            <Link to="/products">
              <Button variant="ghost" className="font-bold hover:text-primary group text-lg">
                Explore all Categories <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6"
          >
            {cats.map((c, i) => (
              <motion.div key={c.id} variants={fadeIn}>
                <Link
                  to="/products"
                  search={{ category: c.slug }}
                  className="group block relative aspect-square overflow-hidden rounded-3xl bg-card border hover:border-primary hover:shadow-xl hover:shadow-primary/10 transition-all text-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="h-full flex flex-col items-center justify-center p-6">
                    <div className="mb-4 p-3 rounded-2xl bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <span className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">
                      {c.name}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">New Arrivals</h2>
              <p className="text-muted-foreground text-lg">Fresh listings from our verified sellers</p>
            </div>
            <Link to="/products">
              <Button size="lg" className="rounded-full font-bold">View Gallery</Button>
            </Link>
          </div>
          
          {featured.length === 0 ? (
            <div className="rounded-[40px] border-2 border-dashed bg-muted/20 py-24 text-center">
              <div className="max-w-xs mx-auto">
                <p className="text-xl font-bold mb-2">Market is heating up!</p>
                <p className="text-muted-foreground text-sm">Our sellers are currently restocking. Check back in a few minutes.</p>
              </div>
            </div>
          ) : (
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
            >
              {featured.map((p) => (
                <motion.div key={p.id} variants={fadeIn}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 border-y bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">Verified Sellers</h3>
                <p className="text-sm text-muted-foreground">Every seller goes through a multi-step verification process to ensure quality.</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">Secure Payments</h3>
                <p className="text-sm text-muted-foreground">Integrated with M-Pesa STK push. You only pay when you're ready.</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">Buyer Protection</h3>
                <p className="text-sm text-muted-foreground">Not happy? We guarantee a full refund if items don't match descriptions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seller CTA */}
      <section className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[50px] p-12 md:p-24 text-primary-foreground text-center"
          style={{ background: "var(--gradient-warm)", boxShadow: "0 40px 100px -20px color-mix(in oklab, var(--primary) 40%, transparent)" }}
        >
          {/* Abstract blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-2xl -ml-20 -mb-20" />
          
          <div className="relative max-w-3xl mx-auto space-y-8">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur font-bold text-xs tracking-widest uppercase">
              Join the Hub
            </span>
            <h3 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Scale your business across Kenya.
            </h3>
            <p className="text-xl md:text-2xl text-primary-foreground/90 font-medium">
              Join 500+ sellers who are reaching thousands of buyers in all 47 counties. 
              Zero setup fees. Pay only when you sell.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link to="/profile">
                <Button size="xl" variant="secondary" className="rounded-full px-12 font-bold shadow-2xl hover:scale-105 transition-transform">
                  Register as Seller <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/help">
                <Button size="xl" variant="ghost" className="rounded-full px-8 font-bold text-primary-foreground hover:bg-white/10 border-white/20 border">
                  Learn how it works
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
