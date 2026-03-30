import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Trophy, Heart, TrendingUp, Upload, Plus } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

interface Score {
  id: string;
  value: number;
  date: string;
}

const Dashboard = () => {
  const { toast } = useToast();
  const [scores, setScores] = useState<Score[]>([
    { id: "1", value: 38, date: "2026-03-28" },
    { id: "2", value: 32, date: "2026-03-21" },
    { id: "3", value: 41, date: "2026-03-14" },
  ]);
  const [newScore, setNewScore] = useState("");
  const [newDate, setNewDate] = useState("");
  const [charityPercent, setCharityPercent] = useState([10]);

  const addScore = () => {
    const val = parseInt(newScore);
    if (isNaN(val) || val < 1 || val > 45) {
      toast({ title: "Invalid score", description: "Enter a Stableford score between 1 and 45.", variant: "destructive" });
      return;
    }
    if (!newDate) {
      toast({ title: "Date required", description: "Please select a date for your score.", variant: "destructive" });
      return;
    }
    const updated = [{ id: Date.now().toString(), value: val, date: newDate }, ...scores]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    setScores(updated);
    setNewScore("");
    setNewDate("");
    toast({ title: "Score added!", description: `Stableford score of ${val} recorded.` });
  };

  const card = "bg-card rounded-xl border border-border p-5";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-foreground mb-6"
        >
          Your Dashboard
        </motion.h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Subscription Status */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={card}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-foreground">Subscription</h2>
              <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/15">Active</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Monthly Plan — £9.99/mo</p>
            <p className="text-sm text-muted-foreground mt-1">Renews: April 30, 2026</p>
          </motion.div>

          {/* Draw Participation */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={card}>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-gold" />
              <h2 className="font-semibold text-foreground">Draw Participation</h2>
            </div>
            <p className="text-sm text-muted-foreground">Draws entered: <span className="font-semibold text-foreground">3</span></p>
            <p className="text-sm text-muted-foreground mt-1">Next draw: <span className="font-semibold text-foreground">April 1, 2026</span></p>
            <div className="flex gap-1.5 mt-3">
              {scores.slice(0, 5).map((s) => (
                <div key={s.id} className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {s.value}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Winnings */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={card}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-gold" />
              <h2 className="font-semibold text-foreground">Winnings</h2>
            </div>
            <p className="text-2xl font-bold text-foreground">£0.00</p>
            <p className="text-sm text-muted-foreground mt-1">No prizes won yet — keep playing!</p>
            <Button variant="outline" size="sm" className="mt-3 gap-1.5" disabled>
              <Upload className="w-3 h-3" /> Claim Prize
            </Button>
          </motion.div>

          {/* Score Entry */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`${card} md:col-span-2 lg:col-span-2`}>
            <h2 className="font-semibold text-foreground mb-3">Enter Score</h2>
            <div className="flex flex-wrap gap-3 items-end mb-4">
              <div className="flex-1 min-w-[120px]">
                <Label htmlFor="score" className="text-xs">Stableford Score (1–45)</Label>
                <Input
                  id="score"
                  type="number"
                  min={1}
                  max={45}
                  value={newScore}
                  onChange={(e) => setNewScore(e.target.value)}
                  placeholder="38"
                />
              </div>
              <div className="flex-1 min-w-[140px]">
                <Label htmlFor="date" className="text-xs">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
              <Button onClick={addScore} className="bg-gold text-gold-foreground hover:bg-gold/90 gap-1.5">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Last 5 Scores</p>
              {scores.length === 0 ? (
                <p className="text-sm text-muted-foreground">No scores yet.</p>
              ) : (
                scores.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center">
                        {s.value}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {new Date(s.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Charity Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className={card}>
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-coral" />
              <h2 className="font-semibold text-foreground">Your Charity</h2>
            </div>
            <p className="text-sm font-medium text-foreground">Golf For Good Foundation</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">Supporting youth golf programs across the UK</p>

            <Label className="text-xs">Contribution: {charityPercent[0]}%</Label>
            <Slider
              value={charityPercent}
              onValueChange={setCharityPercent}
              min={10}
              max={50}
              step={5}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              £{((9.99 * charityPercent[0]) / 100).toFixed(2)}/mo goes to your charity
            </p>
            <Button variant="outline" size="sm" className="mt-3 text-xs">
              Change Charity
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
