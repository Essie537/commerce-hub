import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { useAuth, hasRole } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "My profile — ShopHub" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, roles, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name,phone")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setFullName(data?.full_name ?? "");
        setPhone(data?.phone ?? "");
      });
  }, [user]);

  if (loading) return null;
  if (!user) {
    return (
      <div className="container mx-auto py-16 text-center">
        <p className="text-muted-foreground">Sign in to view your profile.</p>
        <Link to="/login"><Button className="mt-4">Sign in</Button></Link>
      </div>
    );
  }

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName || null, phone: phone || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold">My profile</h1>

      <Card className="mt-6 p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <UserIcon className="h-7 w-7 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">{user.email}</p>
            <div className="flex gap-1 mt-1 flex-wrap">
              {roles.length === 0 ? (
                <Badge variant="secondary">buyer</Badge>
              ) : (
                roles.map((r) => <Badge key={r} variant="secondary">{r}</Badge>)
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Wanjiku" />
          </div>
          <div>
            <Label htmlFor="phone">M-Pesa phone (2547XXXXXXXX)</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="254712345678" />
          </div>
          <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
        </div>
      </Card>

      <Card className="mt-4 p-6 space-y-3">
        <h2 className="font-semibold">Shortcuts</h2>
        <div className="flex flex-wrap gap-2">
          <Link to="/orders"><Button variant="outline" size="sm">My orders</Button></Link>
          <Link to="/cart"><Button variant="outline" size="sm">My cart</Button></Link>
          {hasRole(roles, "seller") && <Link to="/seller"><Button variant="outline" size="sm">Seller dashboard</Button></Link>}
          {hasRole(roles, "admin") && <Link to="/admin"><Button variant="outline" size="sm">Admin</Button></Link>}
        </div>
      </Card>

      {!hasRole(roles, "seller") && (
        <Card className="mt-4 p-6 bg-accent/10 border-accent/20">
          <h2 className="font-semibold text-accent-foreground">Start selling</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Want to reach thousands of Kenyan buyers? Apply to become a seller today.
          </p>
          <Button
            className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={async () => {
              const { error } = await supabase.from("user_roles").insert({ user_id: user.id, role: "seller" });
              if (error && !error.message.includes("duplicate")) return toast.error(error.message);
              toast.success("Welcome! You are now a seller.");
              window.location.reload();
            }}
          >
            Join as a seller
          </Button>
        </Card>
      )}

      <div className="mt-6 text-center">
        <Button variant="ghost" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
