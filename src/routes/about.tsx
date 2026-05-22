import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Users, Truck, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — ShopHub Kenya" },
      { name: "description", content: "ShopHub is Kenya's modern marketplace connecting buyers and sellers nationwide." },
      { property: "og:title", content: "About ShopHub Kenya" },
      { property: "og:description", content: "Kenya's modern marketplace — built for buyers and sellers from Nairobi to Mombasa." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight">About ShopHub</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        ShopHub is Kenya's modern marketplace — a place for buyers to discover quality products and
        for sellers, large and small, to reach customers across all 47 counties.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mt-10">
        {[
          { Icon: Globe, t: "Built for Kenya", d: "Prices in KSh, M-Pesa checkout, delivery countrywide." },
          { Icon: Users, t: "500+ sellers", d: "From individual artisans to established Nairobi brands." },
          { Icon: Truck, t: "Fast delivery", d: "Same-day in Nairobi, 2–4 days countrywide via partner couriers." },
          { Icon: ShieldCheck, t: "Buyer protection", d: "Refund guarantee on every order, every time." },
        ].map(({ Icon, t, d }) => (
          <Card key={t} className="p-6">
            <Icon className="h-8 w-8 text-primary" />
            <h3 className="mt-3 font-semibold">{t}</h3>
            <p className="text-sm text-muted-foreground mt-1">{d}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-10 p-8" style={{ background: "var(--gradient-primary)" }}>
        <h2 className="text-2xl font-bold text-primary-foreground">Our mission</h2>
        <p className="mt-2 text-primary-foreground/90 max-w-2xl">
          Make e-commerce simple, safe, and inclusive for every Kenyan — whether you're shopping
          from a phone in Kisumu or selling handcrafted goods from Lamu.
        </p>
        <Link to="/products" className="inline-block mt-6">
          <Button variant="secondary">Start shopping</Button>
        </Link>
      </Card>
    </div>
  );
}
