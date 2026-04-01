import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Trophy, Heart, TrendingUp, Upload, Plus } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";

const fallbackCharities = [
  { id: "1", name: "Golf For Good Foundation" },
  { id: "2", name: "Fairway Future Trust" },
  { id: "3", name: "Green Hearts Initiative" },
  { id: "4", name: "Youth On Course UK" },
];

interface Score {
  id: string;
  value: number;
  date: string;
}

interface Winner {
  id: string;
  matchType: string;
  prizeAmount: number;
  proofUrl: string | null;
  verified: boolean;
  paid: boolean;
  createdAt: string;
}

const Dashboard = () => {
  const { toast } = useToast();
  const { user, subscription, subscriptionActive, refreshProfile } = useAuth();
  const [charities, setCharities] = useState(fallbackCharities);
  const [scores, setScores] = useState<Score[]>([]);
  const [scoresLoading, setScoresLoading] = useState(true);
  const [drawsEntered, setDrawsEntered] = useState(0);
  const [nextDrawDate, setNextDrawDate] = useState<string | null>(null);
  const [winningsTotal, setWinningsTotal] = useState(0);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [proofFiles, setProofFiles] = useState<Record<string, File | null>>({});
  const [proofUploading, setProofUploading] = useState<Record<string, boolean>>({});
  const [newScore, setNewScore] = useState("");
  const [newDate, setNewDate] = useState("");
  const [charityPercent, setCharityPercent] = useState([10]);
  const [charitySelection, setCharitySelection] = useState("");
  const [isChangingCharity, setIsChangingCharity] = useState(false);

  const charityName = subscription?.charity_name ?? null;
  const charityPercentValue = Number.isFinite(subscription?.charity_percent)
    ? Number(subscription?.charity_percent)
    : 10;

  useEffect(() => {
    setCharityPercent([charityPercentValue]);
  }, [charityPercentValue]);

  useEffect(() => {
    if (subscription?.charity_id) {
      setCharitySelection(subscription.charity_id);
    }
  }, [subscription?.charity_id]);

  useEffect(() => {
    let active = true;

    const loadCharities = async () => {
      try {
        const response = await apiFetch("/charities");
        const body = (await response.json()) as { charities?: { id: string; name: string }[] };
        if (active && body.charities && body.charities.length > 0) {
          setCharities(body.charities.map((row) => ({ id: row.id, name: row.name })));
        }
      } catch (err) {
        if (active) {
          setCharities(fallbackCharities);
        }
      }
    };

    loadCharities();

    return () => {
      active = false;
    };
  }, []);

  const subscriptionAmount = useMemo(() => {
    const amount = subscription?.amount;
    if (amount === null || amount === undefined) return null;
    const parsed = typeof amount === "string" ? Number.parseFloat(amount) : amount;
    return Number.isFinite(parsed) ? parsed : null;
  }, [subscription?.amount]);

  const subscriptionLabel = useMemo(() => {
    const plan = subscription?.plan ?? "monthly";
    const planName = plan === "yearly" ? "Yearly" : "Monthly";
    const amount = subscriptionAmount ?? (plan === "yearly" ? 99.99 : 9.99);
    const suffix = plan === "yearly" ? "/yr" : "/mo";
    return `${planName} Plan — £${amount.toFixed(2)}${suffix}`;
  }, [subscription?.plan, subscriptionAmount]);

  const renewalLabel = useMemo(() => {
    if (!subscription?.renewal_date) return "TBD";
    const date = new Date(subscription.renewal_date);
    return Number.isNaN(date.getTime())
      ? "TBD"
      : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }, [subscription?.renewal_date]);

  const charityChangeInfo = useMemo(() => {
    if (!subscription?.charity_changed_at) {
      return { canChange: true, nextChangeLabel: null };
    }
    const last = new Date(subscription.charity_changed_at);
    if (Number.isNaN(last.getTime())) {
      return { canChange: true, nextChangeLabel: null };
    }
    const nextAllowed = new Date(last.getTime() + 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const canChange = now >= nextAllowed;
    const nextChangeLabel = nextAllowed.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return { canChange, nextChangeLabel };
  }, [subscription?.charity_changed_at]);

  const nextDrawLabel = useMemo(() => {
    if (!nextDrawDate) return "TBD";
    const date = new Date(nextDrawDate);
    return Number.isNaN(date.getTime())
      ? "TBD"
      : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }, [nextDrawDate]);

  const loadDashboardSummary = async (userId: string) => {
    const response = await apiFetch("/dashboard/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    const body = (await response.json()) as {
      scores?: { id: string; scoreValue: number; scoreDate: string }[];
      drawsEntered?: number;
      nextDrawDate?: string | null;
      winningsTotal?: number;
      winners?: Winner[];
    };

    setScores(
      (body.scores ?? []).map((row) => ({
        id: row.id,
        value: row.scoreValue,
        date: row.scoreDate,
      }))
    );
    setDrawsEntered(body.drawsEntered ?? 0);
    setNextDrawDate(body.nextDrawDate ?? null);
    setWinningsTotal(Number.isFinite(body.winningsTotal) ? body.winningsTotal : 0);
    setWinners(body.winners ?? []);
  };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const loadDashboard = async () => {
      setScoresLoading(true);
      try {
        await loadDashboardSummary(user.id);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load dashboard.";
        toast({ title: "Unable to load dashboard", description: message, variant: "destructive" });
      } finally {
        setScoresLoading(false);
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

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
    if (!user) {
      toast({ title: "Login required", description: "Please log in to record scores.", variant: "destructive" });
      return;
    }

    const saveScore = async () => {
      try {
        const response = await apiFetch("/scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            scoreValue: val,
            scoreDate: newDate,
          }),
        });

        if (!response.ok) {
          const body = (await response.json()) as { error?: string };
          toast({ title: "Unable to save score", description: body.error ?? "Unknown error", variant: "destructive" });
          return;
        }

        const body = (await response.json()) as { latestScores?: { id: string; scoreValue: number; scoreDate: string }[] };
        if (body.latestScores) {
          setScores(
            body.latestScores.map((row) => ({
              id: row.id,
              value: row.scoreValue,
              date: row.scoreDate,
            }))
          );
        } else {
          await loadDashboardSummary(user.id);
        }

        setNewScore("");
        setNewDate("");
        toast({ title: "Score added!", description: `Stableford score of ${val} recorded.` });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to save score.";
        toast({ title: "Unable to save score", description: message, variant: "destructive" });
      }
    };

    saveScore();
  };

  const submitProof = async (winnerId: string) => {
    if (!user) {
      toast({ title: "Login required", description: "Please log in to submit proof.", variant: "destructive" });
      return;
    }

    const file = proofFiles[winnerId];
    if (!file) {
      toast({ title: "Proof required", description: "Please upload a proof photo.", variant: "destructive" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Only image files are allowed.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max size is 5MB.", variant: "destructive" });
      return;
    }

    setProofUploading((prev) => ({ ...prev, [winnerId]: true }));

    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const objectPath = `winners/${user.id}/${winnerId}-${Date.now()}-${safeName}`;

      const upload = await supabase.storage.from("winner_proofs").upload(objectPath, file, {
        upsert: false,
        contentType: file.type,
      });

      if (upload.error) {
        toast({ title: "Upload failed", description: upload.error.message, variant: "destructive" });
        return;
      }

      const publicUrl = supabase.storage.from("winner_proofs").getPublicUrl(objectPath).data.publicUrl;

      const response = await apiFetch(`/winners/${winnerId}/proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, proofUrl: publicUrl }),
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        toast({ title: "Proof failed", description: body.error ?? "Unable to submit proof.", variant: "destructive" });
        return;
      }

      await loadDashboardSummary(user.id);
      setProofFiles((prev) => ({ ...prev, [winnerId]: null }));
      toast({ title: "Proof submitted", description: "We will review your verification." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit proof.";
      toast({ title: "Proof failed", description: message, variant: "destructive" });
    } finally {
      setProofUploading((prev) => ({ ...prev, [winnerId]: false }));
    }
  };

  const updateCharity = async () => {
    if (!user) {
      toast({ title: "Login required", description: "Please log in to change charity.", variant: "destructive" });
      return;
    }

    const selected = charities.find((c) => c.id === charitySelection);
    if (!selected) {
      toast({ title: "Select a charity", description: "Choose a charity before saving.", variant: "destructive" });
      return;
    }

    setIsChangingCharity(true);
    try {
      const response = await apiFetch("/billing/charity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          charityId: selected.id,
          charityName: selected.name,
          charityPercent: charityPercent[0],
        }),
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string; nextChangeAt?: string };
        const message = body?.error ?? "Unable to update charity.";
        const nextChange = body?.nextChangeAt
          ? new Date(body.nextChangeAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
          : null;
        toast({
          title: "Update blocked",
          description: nextChange ? `${message} Next change on ${nextChange}.` : message,
          variant: "destructive",
        });
        return;
      }

      await refreshProfile();
      toast({ title: "Charity updated", description: "Your monthly charity selection has been saved." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to update charity.";
      toast({ title: "Update failed", description: message, variant: "destructive" });
    } finally {
      setIsChangingCharity(false);
    }
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
              <Badge
                className={
                  subscription?.status === "active"
                    ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/15"
                    : "bg-amber-500/15 text-amber-600 border-amber-500/30 hover:bg-amber-500/15"
                }
              >
                {subscription?.status === "active" ? "Active" : "Pending"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{subscriptionLabel}</p>
            <p className="text-sm text-muted-foreground mt-1">Renews: {renewalLabel}</p>
          </motion.div>

          {/* Draw Participation */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={card}>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-gold" />
              <h2 className="font-semibold text-foreground">Draw Participation</h2>
            </div>
            <p className="text-sm text-muted-foreground">Draws entered: <span className="font-semibold text-foreground">{drawsEntered}</span></p>
            <p className="text-sm text-muted-foreground mt-1">Next draw: <span className="font-semibold text-foreground">{nextDrawLabel}</span></p>
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
            <p className="text-2xl font-bold text-foreground">£{winningsTotal.toFixed(2)}</p>
            {winners.length === 0 ? (
              <p className="text-sm text-muted-foreground mt-1">No prizes won yet — keep playing!</p>
            ) : (
              <div className="mt-3 space-y-3">
                {winners.map((winner) => (
                  <div key={winner.id} className="rounded-lg border border-border/60 bg-muted/40 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{winner.matchType}-match</p>
                        <p className="text-xs text-muted-foreground">{new Date(winner.createdAt).toLocaleDateString("en-GB")}</p>
                      </div>
                      <p className="text-sm font-semibold text-gold">£{winner.prizeAmount.toFixed(2)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                      <Badge variant={winner.verified ? "default" : "outline"} className={winner.verified ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" : ""}>
                        {winner.verified ? "Verified" : "Pending verification"}
                      </Badge>
                      <Badge variant={winner.paid ? "default" : "outline"} className={winner.paid ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" : ""}>
                        {winner.paid ? "Paid" : "Unpaid"}
                      </Badge>
                    </div>
                    <div className="mt-3 space-y-2">
                      <Label className="text-xs">Proof photo</Label>
                      {winner.proofUrl && (
                        <a
                          className="text-xs text-primary underline"
                          href={winner.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View current proof
                        </a>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setProofFiles((prev) => ({
                            ...prev,
                            [winner.id]: e.target.files?.[0] ?? null,
                          }))
                        }
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => submitProof(winner.id)}
                        disabled={Boolean(proofUploading[winner.id])}
                      >
                        <Upload className="w-3 h-3" />
                        {proofUploading[winner.id] ? "Uploading..." : "Upload proof"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              {scoresLoading ? (
                <p className="text-sm text-muted-foreground">Loading scores...</p>
              ) : scores.length === 0 ? (
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
            {charityName ? (
              <>
                <p className="text-sm font-medium text-foreground">{charityName}</p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">Thank you for supporting this cause.</p>

                <Label className="text-xs">Contribution: {charityPercent[0]}%</Label>
                <Slider
                  value={charityPercent}
                  onValueChange={setCharityPercent}
                  min={10}
                  max={50}
                  step={5}
                  className="mt-2"
                  disabled
                />
                <p className="text-xs text-muted-foreground mt-2">
                  £{(((subscriptionAmount ?? 9.99) * charityPercent[0]) / 100).toFixed(2)}/mo goes to your charity
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-foreground">No charity selected</p>
                <p className="text-xs text-muted-foreground mt-1">Choose a charity to see your impact here.</p>
              </>
            )}

            {subscriptionActive && (
              <div className="mt-5 space-y-3">
                <div>
                  <Label className="text-xs">Change charity (once per month)</Label>
                  <Select value={charitySelection} onValueChange={setCharitySelection}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a charity" />
                    </SelectTrigger>
                    <SelectContent>
                      {charities.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Contribution rate: {charityPercent[0]}%</Label>
                  <Slider
                    value={charityPercent}
                    onValueChange={setCharityPercent}
                    min={10}
                    max={50}
                    step={5}
                    className="mt-2"
                  />
                </div>
                {!charityChangeInfo.canChange && charityChangeInfo.nextChangeLabel && (
                  <p className="text-xs text-muted-foreground">
                    You can change again on {charityChangeInfo.nextChangeLabel}.
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={updateCharity}
                  disabled={!charityChangeInfo.canChange || isChangingCharity}
                >
                  {isChangingCharity ? "Saving..." : "Save Charity"}
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
