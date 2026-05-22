import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase-browser";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles, Smartphone, Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!", { description: "Successfully signed into your account." });
    navigate({ to: "/" });
  };

  const onGoogle = async () => {
    const { lovable } = await import("@/integrations/lovable");
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) return toast.error(result.error.message);
    if (result.redirected) return;
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background pt-16">
      {/* Left Side: Marketing/Visual */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-accent)_0%,transparent_60%)] opacity-20" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <Link to="/" className="flex items-center gap-2 font-black text-2xl tracking-tighter mb-24">
            <div className="bg-white rounded-lg p-1">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
            Commerce Hub
          </Link>

          <h2 className="text-5xl font-black tracking-tight leading-tight mb-8">
            The heart of <br />Kenyan Commerce.
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <p className="font-bold text-lg">Verified Sellers across all 47 counties</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <p className="font-bold text-lg">Secure M-Pesa STK payment processing</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="font-bold text-lg">Premium support 24/7 in Nairobi</p>
            </div>
          </div>
        </motion.div>

        <div className="relative z-10 pt-12 border-t border-white/10 flex justify-between items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest opacity-60 mb-2 text-white">Join 10k+ Shoppers</p>
            <div className="flex -space-x-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 w-10 rounded-full border-2 border-primary bg-muted overflow-hidden">
                  <img src={`https://i.pravatar.cc/150?u=${i + 20}`} alt="user" />
                </div>
              ))}
              <div className="h-10 w-10 rounded-full border-2 border-primary bg-accent flex items-center justify-center font-bold text-xs">+99</div>
            </div>
          </div>
          <p className="text-xs font-medium text-white/60">© 2026 Commerce Hub Kenya</p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex flex-col justify-center items-center p-6 md:p-12 lg:p-24 relative">
        <Link to="/" className="absolute top-8 left-8 lg:hidden flex items-center gap-2 font-black text-xl tracking-tighter">
          Commerce Hub
        </Link>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm"
        >
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl font-black tracking-tight mb-3">Welcome back</h1>
            <p className="text-muted-foreground font-medium text-lg">Sign in to continue your journey</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
              <div className="relative">
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="jane@example.com"
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="rounded-2xl h-12 pl-10 border-muted focus-visible:ring-primary/20"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <Label htmlFor="password" title="Password must be at least 6 characters" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Password</Label>
                <Link to="/help" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">Forgot?</Link>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="rounded-2xl h-12 pl-10 border-muted focus-visible:ring-primary/20"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <Button type="submit" size="xl" className="w-full rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all active:scale-[0.98]" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
                  Authenticating...
                </span>
              ) : "Sign into Account"}
            </Button>
          </form>

          <div className="my-8 flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or continue with <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" size="xl" className="w-full rounded-2xl font-bold h-12 border-muted hover:bg-muted/50 transition-all flex items-center justify-center gap-3" onClick={onGoogle}>
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </Button>

          <p className="mt-10 text-center text-muted-foreground font-medium">
            New to the Hub? <Link to="/signup" className="text-primary font-black hover:underline ml-1">Create Account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
