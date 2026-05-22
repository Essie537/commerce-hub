import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & FAQ — ShopHub Kenya" },
      { name: "description", content: "Answers to common questions about M-Pesa payments, delivery, returns, and selling on ShopHub Kenya." },
      { property: "og:title", content: "Help Centre — ShopHub Kenya" },
      { property: "og:description", content: "M-Pesa payments, countrywide delivery, returns, and seller onboarding — all explained." },
    ],
  }),
  component: HelpPage,
});

const faqs = [
  {
    q: "How does M-Pesa payment work?",
    a: "At checkout, enter your Safaricom number in the format 2547XXXXXXXX. You'll receive an STK push on your phone — enter your M-Pesa PIN to complete payment. You'll get a confirmation SMS with the receipt number.",
  },
  {
    q: "Where do you deliver?",
    a: "We deliver to all 47 counties through partner couriers (G4S, Wells Fargo, Pickup Mtaani). Nairobi orders typically arrive same-day or next-day; countrywide orders take 2–4 business days.",
  },
  {
    q: "What is the return policy?",
    a: "You have 7 days from delivery to request a return for unused items in original packaging. Contact support@shophub.co.ke and we'll arrange pickup.",
  },
  {
    q: "How do I become a seller?",
    a: "Sign up and select 'Seller' as your role. You'll get access to the seller dashboard where you can list products, manage stock, and track sales. Listing is free — we only take a small commission on completed orders.",
  },
  {
    q: "Is my payment information safe?",
    a: "Yes. We never see or store your M-Pesa PIN. All transactions are processed by Safaricom's secure Daraja API. Card details, when used, are handled by PCI-compliant payment processors.",
  },
  {
    q: "How do I track my order?",
    a: "Visit 'My Orders' in your account to see the latest status. You'll also receive email and SMS updates at each stage: confirmed, shipped, and delivered.",
  },
];

function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Help & FAQ</h1>
      <p className="mt-3 text-muted-foreground">
        Quick answers to common questions. Still stuck?{" "}
        <Link to="/contact" className="text-primary hover:underline">Contact us</Link>.
      </p>

      <Card className="mt-8 p-2">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="px-4">
              <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </div>
  );
}
