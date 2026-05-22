import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact us — ShopHub Kenya" },
      { name: "description", content: "Get in touch with the ShopHub Kenya team in Nairobi. Email, phone, and office hours." },
      { property: "og:title", content: "Contact ShopHub Kenya" },
      { property: "og:description", content: "Reach the ShopHub Kenya team — based in Nairobi, supporting customers nationwide." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sending, setSending] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Thanks! We'll get back to you within 24 hours.");
      (e.target as HTMLFormElement).reset();
    }, 600);
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Get in touch</h1>
      <p className="mt-3 text-muted-foreground">We typically respond within 24 hours.</p>

      <div className="mt-10 grid md:grid-cols-[1fr_320px] gap-8">
        <Card className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required />
              </div>
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" required />
            </div>
            <div>
              <Label htmlFor="msg">Message</Label>
              <Textarea id="msg" rows={6} required />
            </div>
            <Button type="submit" disabled={sending} className="w-full sm:w-auto">
              {sending ? "Sending..." : "Send message"}
            </Button>
          </form>
        </Card>

        <div className="space-y-3">
          {[
            { Icon: Mail, t: "Email", d: "support@shophub.co.ke" },
            { Icon: Phone, t: "Phone", d: "+254 700 000 000" },
            { Icon: MapPin, t: "Office", d: "Westlands, Nairobi" },
          ].map(({ Icon, t, d }) => (
            <Card key={t} className="p-4 flex items-start gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">{t}</p>
                <p className="text-sm text-muted-foreground">{d}</p>
              </div>
            </Card>
          ))}
          <Card className="p-4">
            <p className="font-semibold text-sm">Hours</p>
            <p className="text-sm text-muted-foreground">Mon–Sat · 8am – 6pm EAT</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
