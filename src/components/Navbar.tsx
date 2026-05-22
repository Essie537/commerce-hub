import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingCart, Store, LayoutDashboard, LogOut, User, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, hasRole } from "@/lib/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { user, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!user) {
      setCartCount(0);
      return;
    }
    const load = async () => {
      const { data } = await supabase.from("cart_items").select("quantity").eq("buyer_id", user.id);
      setCartCount((data ?? []).reduce((s, r) => s + r.quantity, 0));
    };
    load();
    const ch = supabase
      .channel("cart-nav")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cart_items", filter: `buyer_id=eq.${user.id}` },
        load
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  return (
    <header 
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? "bg-background/80 backdrop-blur-md border-b py-2" 
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="bg-primary rounded-lg p-1">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline-block">Commerce<span className="text-primary">Hub</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/" className="hover:text-primary transition-colors relative group">
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </Link>
          <Link to="/products" className="hover:text-primary transition-colors relative group">
            Products
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </Link>
          {user && hasRole(roles, "seller") && (
            <Link to="/seller" className="hover:text-primary transition-colors relative group">
              Seller Dashboard
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </Link>
          )}
          {user && hasRole(roles, "admin") && (
            <Link to="/admin" className="hover:text-primary transition-colors relative group">
              Admin
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate({ to: "/products" })}>
            <Search className="h-5 w-5" />
          </Button>
          
          <Link to="/cart" className="relative group">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-lg shadow-primary/20 ring-2 ring-background"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <div className="h-6 w-px bg-border mx-2 hidden sm:block" />

          {user ? (
            <div className="flex items-center gap-1">
              <Link to="/profile">
                <Button variant="ghost" size="icon" className="rounded-full ring-primary/20 hover:ring-2 transition-all">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button size="sm" className="rounded-full px-5 font-semibold shadow-lg shadow-primary/20">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium py-2 border-b">Home</Link>
              <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium py-2 border-b">Products</Link>
              {user && hasRole(roles, "seller") && (
                <Link to="/seller" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium py-2 border-b">Seller Dashboard</Link>
              )}
              {user && hasRole(roles, "admin") && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium py-2 border-b">Admin</Link>
              )}
              {user ? (
                <>
                  <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium py-2 border-b">My Orders</Link>
                  <Button 
                    variant="outline" 
                    className="mt-4 w-full justify-start text-destructive hover:text-destructive"
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await signOut();
                      navigate({ to: "/" });
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Sign out
                  </Button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full mt-4">Sign in</Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
