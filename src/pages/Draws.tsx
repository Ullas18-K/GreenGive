import { motion } from "framer-motion";
import { Trophy, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";

const mockDraws = [
  {
    id: "1", date: "March 2026", numbers: [7, 19, 23, 35, 42], jackpotRolled: true, jackpot: 2400,
    tiers: { five: 0, four: 2, three: 8 },
    prizes: { four: "£210 each", three: "£37.50 each" },
  },
  {
    id: "2", date: "February 2026", numbers: [3, 14, 28, 31, 44], jackpotRolled: false, jackpot: 1200,
    tiers: { five: 1, four: 3, three: 12 },
    prizes: { five: "£480", four: "£140 each", three: "£25 each" },
  },
  {
    id: "3", date: "January 2026", numbers: [11, 18, 22, 37, 40], jackpotRolled: true, jackpot: 1200,
    tiers: { five: 0, four: 1, three: 5 },
    prizes: { four: "£420", three: "£60 each" },
  },
];

const LotteryBall = ({ number }: { number: number }) => (
  <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shadow-md">
    {number}
  </div>
);

const Draws = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground mb-2">Draw Results</h1>
          <p className="text-muted-foreground mb-8">Monthly prize draw results — see if your scores matched!</p>
        </motion.div>

        {/* Jackpot Banner */}
        {mockDraws[0]?.jackpotRolled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gold/10 border border-gold/30 rounded-xl p-4 mb-8 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-gold shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Jackpot Rolled Over!</p>
              <p className="text-sm text-muted-foreground">
                No 5-match winner this month. Current jackpot: <span className="font-bold text-gold">£{mockDraws[0].jackpot.toLocaleString()}</span>
              </p>
            </div>
          </motion.div>
        )}

        <div className="space-y-5">
          {mockDraws.map((draw, i) => (
            <motion.div
              key={draw.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-xl border border-border p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-gold" />
                  <h2 className="font-semibold text-foreground">{draw.date}</h2>
                </div>
                {draw.jackpotRolled ? (
                  <Badge variant="outline" className="border-gold/30 text-gold">Jackpot Rolled Over</Badge>
                ) : (
                  <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/15">Jackpot Won!</Badge>
                )}
              </div>

              <div className="flex gap-2 mb-5">
                {draw.numbers.map((n, j) => (
                  <LotteryBall key={j} number={n} />
                ))}
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-0.5">5 Matches (40%)</p>
                  <p className="text-sm font-semibold text-foreground">
                    {draw.tiers.five} winner{draw.tiers.five !== 1 ? "s" : ""}
                  </p>
                  {draw.prizes.five && <p className="text-xs text-gold font-medium">{draw.prizes.five}</p>}
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-0.5">4 Matches (35%)</p>
                  <p className="text-sm font-semibold text-foreground">
                    {draw.tiers.four} winner{draw.tiers.four !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-gold font-medium">{draw.prizes.four}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-0.5">3 Matches (25%)</p>
                  <p className="text-sm font-semibold text-foreground">
                    {draw.tiers.three} winner{draw.tiers.three !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-gold font-medium">{draw.prizes.three}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Draws;
