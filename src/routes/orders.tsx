import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/orders")({ component: OrdersPage });

type Order = {
  id: string; total_amount: number; status: string; payment_status: string;
  created_at: string; mpesa_receipt: string | null;
  order_items: { product_name: string; quantity: number; unit_price: number }[];
};

function OrdersPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("id,total_amount,status,payment_status,created_at,mpesa_receipt,order_items(product_name,quantity,unit_price)")
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data ?? []) as unknown as Order[]));
  }, [user]);

  if (loading) return null;
  if (!user) return <div className="container mx-auto py-16 text-center"><Link to="/login"><Button>Sign in</Button></Link></div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold">My orders</h1>
      {orders.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">No orders yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <Card key={o.id} className="p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-sm text-muted-foreground">Order #{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{o.status}</Badge>
                  <Badge variant={o.payment_status === "paid" ? "default" : "secondary"}>{o.payment_status}</Badge>
                </div>
              </div>
              <ul className="mt-3 text-sm space-y-1">
                {o.order_items.map((i, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>{i.product_name} × {i.quantity}</span>
                    <span>KSh {(i.quantity * Number(i.unit_price)).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between font-bold border-t pt-2 mt-3">
                <span>Total</span>
                <span>KSh {Number(o.total_amount).toLocaleString()}</span>
              </div>
              {o.mpesa_receipt && (
                <p className="text-xs text-muted-foreground mt-2">M-Pesa receipt: {o.mpesa_receipt}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
