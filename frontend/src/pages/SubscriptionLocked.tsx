import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const SubscriptionLocked = () => {
  const { user, subscription } = useAuth();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const resumeCheckout = async () => {
    if (!user?.email) {
      toast({
        title: "Missing account info",
        description: "Please log in again before retrying checkout.",
        variant: "destructive",
      });
      return;
    }

    const plan = (subscription?.plan ?? "monthly") as "monthly" | "yearly";

    setIsRedirecting(true);
    try {
      const response = await apiFetch("/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          plan,
        }),
      });

      const { checkoutUrl } = (await response.json()) as { checkoutUrl?: string };
      if (!checkoutUrl) {
        throw new Error("Checkout session was not created.");
      }

      window.location.assign(checkoutUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to resume checkout.";
      toast({ title: "Try again", description: message, variant: "destructive" });
    } finally {
      setIsRedirecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg">
          <h1 className="text-3xl font-bold text-foreground">Finish your subscription</h1>
          <p className="text-muted-foreground mt-3">
            Your account is ready, but subscription is required to access the dashboard.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              className="bg-gold text-gold-foreground hover:bg-gold/90"
              onClick={resumeCheckout}
              disabled={isRedirecting}
            >
              {isRedirecting ? "Redirecting..." : "Complete checkout"}
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Back to home</Link>
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default SubscriptionLocked;
