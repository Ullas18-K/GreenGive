import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";

const fallbackCharities = [
  { id: "1", name: "Golf For Good Foundation" },
  { id: "2", name: "Fairway Future Trust" },
  { id: "3", name: "Green Hearts Initiative" },
  { id: "4", name: "Youth On Course UK" },
];

const Signup = () => {
  const { toast } = useToast();
  const [charities, setCharities] = useState(fallbackCharities);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    charity: "",
    plan: "monthly" as "monthly" | "yearly",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadCharities = async () => {
      const { data, error } = await supabase.from("charities").select("id, name").order("name");
      if (!error && data && data.length > 0) {
        setCharities(data.map((row) => ({ id: row.id as string, name: row.name as string })));
      }
    };

    loadCharities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.charity) {
      toast({
        title: "Select a charity",
        description: "Please choose a charity before continuing.",
        variant: "destructive",
      });
      return;
    }

    const selectedCharity = charities.find((c) => c.id === form.charity);
    if (!selectedCharity) {
      toast({
        title: "Invalid charity",
        description: "Please select a valid charity before continuing.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.name,
            charity_id: form.charity,
            plan: form.plan,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error("Signup failed. Please try again.");
      }

      const response = await apiFetch("/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: data.user.id,
          email: form.email,
          plan: form.plan,
          name: form.name,
          charityId: form.charity,
          charityName: selectedCharity.name,
          charityPercent: 10,
        }),
      });

      const { checkoutUrl } = (await response.json()) as { checkoutUrl?: string };

      if (!checkoutUrl) {
        throw new Error("Checkout session was not created.");
      }

      window.location.assign(checkoutUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Signup failed.";
      toast({
        title: "Unable to continue",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-20">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gold"
              style={{
                width: 100 + i * 80,
                height: 100 + i * 80,
                top: `${20 + i * 12}%`,
                left: `${10 + i * 15}%`,
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{ duration: 4 + i, repeat: Infinity }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center px-12">
          <h2 className="text-4xl font-bold text-primary-foreground mb-4">
            Win. Give. Play.
          </h2>
          <p className="text-primary-foreground/70 text-lg">
            Join a community of golfers making a difference with every round.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-8">
            <img
              src="/logog.webp"
              alt="GreenGive"
              className="w-8 h-8 rounded-full object-cover bg-muted ring-1 ring-border"
            />
            <span className="font-bold text-xl text-foreground">GreenGive</span>
          </Link>

          <h1 className="text-2xl font-bold text-foreground mb-1">Create your account</h1>
          <p className="text-muted-foreground mb-6">Start your journey — subscribe, play, and give back.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Smith"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="john@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            <div>
              <Label>Choose a Charity</Label>
              <Select value={form.charity} onValueChange={(v) => setForm({ ...form, charity: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a charity to support" />
                </SelectTrigger>
                <SelectContent>
                  {charities.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Subscription Plan</Label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, plan: "monthly" })}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    form.plan === "monthly"
                      ? "border-gold bg-gold/10"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <span className="text-sm font-semibold text-foreground">Monthly</span>
                  <span className="block text-lg font-bold text-foreground">£9.99</span>
                  <span className="text-xs text-muted-foreground">/month</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, plan: "yearly" })}
                  className={`p-3 rounded-lg border-2 text-left transition-all relative ${
                    form.plan === "yearly"
                      ? "border-gold bg-gold/10"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <span className="absolute -top-2 right-2 bg-coral text-coral-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Save 17%
                  </span>
                  <span className="text-sm font-semibold text-foreground">Yearly</span>
                  <span className="block text-lg font-bold text-foreground">£99.99</span>
                  <span className="text-xs text-muted-foreground">/year</span>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gold text-gold-foreground hover:bg-gold/90 font-semibold rounded-full h-11"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Redirecting to checkout..." : "Create Account & Subscribe"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-gold font-medium hover:underline">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
