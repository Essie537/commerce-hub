import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase-browser";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "framer-motion";
import { 
  Smartphone, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  User, 
  Mail, 
  Phone, 
  Lock,
  ShoppingBag,
  Store
} from "lucide-react";

export const Route = createFileRoute("/signup")({ component: SignupPage });

function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName, phone, role },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Registration Successful", { 
      description: "Please check your email to confirm your account." 
    });
    navigate({ to: "/login" });
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
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-primary text-primary-foreground order-last lg:order-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,var(--color-accent)_0%,transparent_60%)] opacity-20" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        
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
            The platform for <br />Kenya's growth.
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <p className="font-bold text-lg">Instant account setup for buyers & sellers</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Store className="h-5 w-5" />
              </div>
              <p className="font-bold text-lg">Powerful dashboard to scale your business</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <p className="font-bold text-lg">Integrated logistics and secure M-Pesa</p>
            </div>
          </div>
        </motion.div>

        <div className="relative z-10 pt-12 border-t border-white/10">
          <p className="text-sm font-bold uppercase tracking-widest opacity-60 mb-6 text-white text-center">Join thousands of verified vendors</p>
          <div className="grid grid-cols-3 gap-4 opacity-80">
            <div className="bg-white/10 h-16 rounded-2xl flex items-center justify-center font-black">NIKE</div>
            <div className="bg-white/10 h-16 rounded-2xl flex items-center justify-center font-black tracking-widest">APPLE</div>
            <div className="bg-white/10 h-16 rounded-2xl flex items-center justify-center font-black">SONY</div>
          </div>
        </div>
      </div>

      {/* Right Side: Signup Form */}
      <div className="flex flex-col justify-center items-center p-6 md:p-12 lg:p-16 relative">
        <Link to="/" className="absolute top-8 right-8 lg:hidden flex items-center gap-2 font-black text-xl tracking-tighter">
          Commerce Hub
        </Link>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-4xl font-black tracking-tight mb-3">Get started</h1>
            <p className="text-muted-foreground font-medium text-lg">Join the premier marketplace in Kenya</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
              <div className="relative">
                <Input 
                  id="name" 
                  placeholder="Jane Wanjiku"
                  required 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  className="rounded-2xl h-12 pl-10 border-muted focus-visible:ring-primary/20"
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
                <div className="relative">
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="jane@hub.co"
                    required 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="rounded-2xl h-12 pl-10 border-muted focus-visible:ring-primary/20"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">M-Pesa Phone</Label>
                <div className="relative">
                  <Input 
                    id="phone" 
                    placeholder="254712345678"
                    required 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className="rounded-2xl h-12 pl-10 border-muted focus-visible:ring-primary/20"
                  />
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" title="Password must be at least 6 characters" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Secure Password</Label>
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

            <div className="space-y-3 pt-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Account Role</Label>
              <RadioGroup value={role} onValueChange={(v) => setRole(v as "buyer" | "seller")} className="grid grid-cols-2 gap-4">
                <label className={`flex items-center gap-3 border rounded-2xl p-4 cursor-pointer transition-all ${role === "buyer" ? "bg-primary/5 border-primary shadow-inner" : "hover:bg-muted border-muted"}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${role === "buyer" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">Shopper</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Buy Goods</p>
                  </div>
                  <RadioGroupItem value="buyer" className="sr-only" />
                </label>
                <label className={`flex items-center gap-3 border rounded-2xl p-4 cursor-pointer transition-all ${role === "seller" ? "bg-primary/5 border-primary shadow-inner" : "hover:bg-muted border-muted"}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${role === "seller" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <Store className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">Merchant</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Sell Goods</p>
                  </div>
                  <RadioGroupItem value="seller" className="sr-only" />
                </label>
              </RadioGroup>
            </div>

            <Button type="submit" size="xl" className="w-full rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all active:scale-[0.98] mt-4" disabled={loading}>
              {loading ? "Creating Identity..." : "Join the Community"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" size="xl" className="w-full rounded-2xl font-bold h-12 border-muted hover:bg-muted/50 transition-all flex items-center justify-center gap-3" onClick={onGoogle}>
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <p className="mt-8 text-center text-muted-foreground font-medium">
            Already registered? <Link to="/login" className="text-primary font-black hover:underline ml-1">Sign in here</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
