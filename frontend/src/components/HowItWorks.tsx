import { motion } from "framer-motion";
import { CreditCard, Target, Trophy } from "lucide-react";

const steps = [
  {
    icon: CreditCard,
    title: "Subscribe",
    description: "Choose a monthly or yearly plan. Pick a charity you want to support with every payment.",
    accent: "bg-gold/15 text-gold",
  },
  {
    icon: Target,
    title: "Enter Scores",
    description: "Log your latest Stableford scores. Your last 5 rounds automatically become your draw entry.",
    accent: "bg-primary/10 text-primary",
  },
  {
    icon: Trophy,
    title: "Win & Give",
    description: "Each month, 5 numbers are drawn. Match yours to win — and know your subscription is making a difference.",
    accent: "bg-coral/15 text-coral",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-gold uppercase tracking-wider">Simple & Impactful</span>
          <h2 className="mt-3 text-3xl md:text-5xl font-bold text-foreground">How It Works</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -6 }}
              className="relative rounded-2xl border border-border bg-card p-8 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gold text-gold-foreground flex items-center justify-center text-sm font-bold">
                {i + 1}
              </div>
              <div className={`w-14 h-14 rounded-xl ${step.accent} flex items-center justify-center mx-auto mt-2 mb-5`}>
                <step.icon size={26} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
