import { motion } from "framer-motion";

const tiers = [
  { matches: 5, label: "Jackpot", pct: "40%", color: "bg-gold text-gold-foreground", desc: "Match all 5 — rolls over if unclaimed!" },
  { matches: 4, label: "Second Tier", pct: "35%", color: "bg-primary text-primary-foreground", desc: "Split equally among 4-match winners" },
  { matches: 3, label: "Third Tier", pct: "25%", color: "bg-coral text-coral-foreground", desc: "Split equally among 3-match winners" },
];

const sampleNumbers = [7, 18, 23, 34, 42];

const DrawExplainer = () => {
  return (
    <section className="py-24 bg-primary">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-gold uppercase tracking-wider">Monthly Draw</span>
          <h2 className="mt-3 text-3xl md:text-5xl font-bold text-primary-foreground">The Prize Draw</h2>
          <p className="mt-4 text-primary-foreground/60 max-w-xl mx-auto">
            Your 5 most recent scores are your numbers. Each month we draw 5 — match them to win.
          </p>
        </motion.div>

        {/* Sample lottery balls */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex justify-center gap-3 md:gap-5 mb-16"
        >
          {sampleNumbers.map((num, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-gold text-gold-foreground flex items-center justify-center text-xl md:text-2xl font-bold shadow-lg shadow-gold/30"
            >
              {num}
            </motion.div>
          ))}
        </motion.div>

        {/* Tiers */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.matches}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              whileHover={{ scale: 1.03 }}
              className="rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10 p-6 text-center backdrop-blur-sm"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${tier.color} text-lg font-bold mb-4`}>
                {tier.matches}
              </div>
              <h3 className="text-lg font-bold text-primary-foreground">{tier.label}</h3>
              <div className="text-3xl font-extrabold text-gold mt-2">{tier.pct}</div>
              <p className="text-primary-foreground/50 text-sm mt-3">{tier.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DrawExplainer;
