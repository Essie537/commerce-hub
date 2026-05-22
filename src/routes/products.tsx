import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard, type Product } from "@/components/ProductCard";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, SlidersHorizontal, PackageSearch } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Search = { category?: string; q?: string };

export const Route = createFileRoute("/products")({
  component: ProductsPage,
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: typeof s.category === "string" ? s.category : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
  }),
});

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

function ProductsPage() {
  const { category, q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [products, setProducts] = useState<(Product & { category_id: string | null })[]>([]);
  const [cats, setCats] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [sort, setSort] = useState("new");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [priceCap, setPriceCap] = useState(100000);
  const [search, setSearch] = useState(q ?? "");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.from("categories").select("id,name,slug").then(({ data }) => setCats(data ?? []));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate({ search: { category, q: search || undefined } });
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setIsLoading(true);
    supabase
      .from("products")
      .select("id,name,price,image_url,stock_quantity,category_id")
      .eq("is_active", true)
      .then(({ data }) => {
        const list = (data ?? []) as (Product & { category_id: string | null })[];
        setProducts(list);
        const max = Math.max(1000, ...list.map((p) => Number(p.price)));
        setMaxPrice(max);
        setPriceCap(max);
        setIsLoading(false);
      });
  }, []);

  const catId = useMemo(() => cats.find((c) => c.slug === category)?.id, [cats, category]);

  const visible = useMemo(() => {
    let list = products;
    if (catId) list = list.filter((p) => p.category_id === catId);
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
    list = list.filter((p) => Number(p.price) <= priceCap);
    if (sort === "price-asc") list = [...list].sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "price-desc") list = [...list].sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === "new") list = [...list]; // Assuming they come in new-first from DB
    return list;
  }, [products, catId, q, priceCap, sort]);

  return (
    <div className="bg-background pb-24">
      {/* Header Section */}
      <div className="bg-muted/30 border-b pt-32 pb-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
              {category ? cats.find(c => c.slug === category)?.name : "Marketplace"}
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Discover premium products from verified sellers across the country.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12">
        <div className="grid lg:grid-cols-[280px_1fr] gap-12">
          {/* Sidebar */}
          <aside className="space-y-10 lg:sticky lg:top-32 lg:h-fit">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Search className="h-4 w-4 text-primary" />
                <h3 className="font-bold uppercase tracking-widest text-xs">Search</h3>
              </div>
              <div className="relative">
                <Input
                  placeholder="Find something..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-2xl pl-10 h-12 border-muted focus-visible:ring-primary/20"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-6">
                <Filter className="h-4 w-4 text-primary" />
                <h3 className="font-bold uppercase tracking-widest text-xs">Categories</h3>
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => navigate({ search: {} })}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${!category ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted"}`}
                >
                  All Products
                  {!category && <SlidersHorizontal className="h-3 w-3 opacity-60" />}
                </button>
                {cats.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => navigate({ search: { category: c.slug } })}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${category === c.slug ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted"}`}
                  >
                    {c.name}
                    {category === c.slug && <SlidersHorizontal className="h-3 w-3 opacity-60" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <h3 className="font-bold uppercase tracking-widest text-xs">Price Range</h3>
              </div>
              <div className="px-2">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Max Price</p>
                    <p className="text-xl font-black">KSh {priceCap.toLocaleString()}</p>
                  </div>
                </div>
                <Slider 
                  min={0} 
                  max={maxPrice} 
                  step={100} 
                  value={[priceCap]} 
                  onValueChange={(v) => setPriceCap(v[0])} 
                  className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
                />
              </div>
            </div>
          </aside>

          {/* Grid */}
          <section>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 bg-card/50 backdrop-blur border p-4 rounded-3xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <PackageSearch className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Showing</p>
                  <p className="text-sm font-black">{visible.length} Products Found</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-full sm:w-[200px] h-11 rounded-xl border-muted">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-muted">
                    <SelectItem value="new">Newest First</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="aspect-[4/5] w-full rounded-[2rem]" />
                      <div className="space-y-2 px-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-6 w-3/4" />
                        <div className="flex justify-between items-center pt-2">
                          <Skeleton className="h-8 w-1/3" />
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : visible.length === 0 ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-32 text-center"
                >
                  <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-6">
                    <PackageSearch className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">No results found</h3>
                  <p className="text-muted-foreground max-w-sm">
                    We couldn't find any products matching your current filters. Try adjusting them.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-8 rounded-full px-8"
                    onClick={() => {
                      setSearch("");
                      setPriceCap(maxPrice);
                      navigate({ search: {} });
                    }}
                  >
                    Clear All Filters
                  </Button>
                </motion.div>
              ) : (
                <motion.div 
                  key="grid"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {visible.map((p) => (
                    <motion.div key={p.id} variants={fadeIn} layout>
                      <ProductCard product={p} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </div>
    </div>
  );
}
