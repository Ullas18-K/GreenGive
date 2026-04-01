import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  "Monthly prize draw entry",
  "Score tracking dashboard",
  "Choose & support your charity",
  "Winner verification & payout",
  "Charity golf day invitations",
];

const PricingSection = () => {
  const [yearly, setYearly] = useState(false);
  const { user, subscriptionActive } = useAuth();

  if (subscriptionActive) {
    return (
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="text-sm font-semibold text-gold uppercase tracking-wider">Pricing</span>
            <h2 className="mt-3 text-3xl md:text-5xl font-bold text-foreground">You're Already Subscribed</h2>
            <p className="mt-4 text-muted-foreground">
              Thanks for supporting the community. Your membership is active.
            </p>
            <Button asChild className="mt-6 bg-gold text-gold-foreground hover:bg-gold/90 rounded-full px-8">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sm font-semibold text-gold uppercase tracking-wider">Pricing</span>
          <h2 className="mt-3 text-3xl md:text-5xl font-bold text-foreground">Simple, Transparent Plans</h2>
        </motion.div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={`text-sm font-medium ${!yearly ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
          <button
            onClick={() => setYearly(!yearly)}
            className={`relative w-14 h-7 rounded-full transition-colors ${yearly ? "bg-gold" : "bg-border"}`}
          >
            <motion.div
              layout
              className="absolute top-1 w-5 h-5 rounded-full bg-background shadow-sm"
              style={{ left: yearly ? "calc(100% - 24px)" : "4px" }}
            />
          </button>
          <span className={`text-sm font-medium ${yearly ? "text-foreground" : "text-muted-foreground"}`}>
            Yearly
          </span>
          {yearly && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs font-bold bg-coral text-coral-foreground px-2 py-0.5 rounded-full"
            >
              Save 17%
            </motion.span>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-md mx-auto"
        >
          <div className="rounded-3xl border-2 border-gold/30 bg-card p-8 shadow-lg shadow-gold/5 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gold text-gold-foreground text-xs font-bold px-4 py-1 rounded-bl-xl flex items-center gap-1">
              <Sparkles size={12} /> Most Popular
            </div>

            <div className="mt-4 mb-6">
              <div className="text-5xl font-extrabold text-foreground">
                {yearly ? "£99.99" : "£9.99"}
              </div>
              <div className="text-muted-foreground text-sm mt-1">
                {yearly ? "per year" : "per month"}
              </div>
              {yearly && (
                <div className="text-xs text-coral font-medium mt-1">
                  That's just £8.33/month
                </div>
              )}
            </div>

            <ul className="space-y-3 text-left mb-8">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-foreground">
                  <Check size={16} className="text-gold flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              asChild
              size="lg"
              className="w-full bg-gold text-gold-foreground hover:bg-gold/90 rounded-full font-semibold text-base shadow-md shadow-gold/20"
            >
              <Link to={user ? "/subscription-locked" : "/signup"}>Get Started</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
