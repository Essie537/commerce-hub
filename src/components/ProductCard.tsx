import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Package, ShoppingCart, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";

export type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  stock_quantity: number;
};

export function ProductCard({ product }: { product: Product }) {
  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link to="/products/$id" params={{ id: product.id }}>
        <Card className="overflow-hidden border-none bg-card shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all group relative rounded-[2rem]">
          <div className="aspect-[4/5] bg-muted flex items-center justify-center overflow-hidden relative">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
              />
            ) : (
              <Package className="h-12 w-12 text-muted-foreground" />
            )}
            
            {/* Hover Actions Overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
              <Button size="icon" variant="secondary" className="rounded-full shadow-lg scale-90 group-hover:scale-100 transition-transform delay-75">
                <Eye className="h-4 w-4" />
              </Button>
              <Button size="icon" className="rounded-full shadow-lg scale-90 group-hover:scale-100 transition-transform delay-100">
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>

            {isOutOfStock && (
              <div className="absolute top-4 left-4">
                <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  Sold Out
                </span>
              </div>
            )}
            
            {!isOutOfStock && product.stock_quantity < 5 && (
              <div className="absolute top-4 left-4">
                <span className="bg-accent text-accent-foreground text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  Low Stock
                </span>
              </div>
            )}
          </div>
          
          <div className="p-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 opacity-60">Verified Seller</p>
            <h3 className="font-bold text-lg line-clamp-1 mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
            <div className="flex items-center justify-between mt-4">
              <p className="text-xl font-black text-foreground">
                <span className="text-xs font-medium mr-1 text-muted-foreground uppercase tracking-tighter">KSh</span>
                {Number(product.price).toLocaleString()}
              </p>
              <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="h-8 w-8 rounded-full border flex items-center justify-center text-muted-foreground group-hover:border-primary group-hover:text-primary transition-colors"
              >
                <Plus className="h-4 w-4" />
              </motion.div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
