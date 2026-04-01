import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users, Shuffle, Heart, Trophy, BarChart3, Play, Check, X } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { buildApiUrl } from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";

type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  plan: string | null;
  status: string | null;
  charity: string | null;
  scores: number[];
};

type AdminCharity = {
  id: string;
  name: string;
  description: string | null;
  fullDescription: string | null;
  imageUrl: string | null;
  causeType: string | null;
  totalContributions: number;
  goalAmount: number | null;
  upcomingEvents: unknown[];
};

type AdminDraw = {
  id: string;
  drawDate: string;
  drawNumbers: number[];
  drawType: string;
  jackpotAmount: number;
  published: boolean;
};

type SimulationResult = {
  drawId: string;
  entryCount: number;
  numbers: number[];
  tiers: { five: number; four: number; three: number };
  prizes: { five: number; four: number; three: number };
};

type AdminWinner = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  matchType: string;
  prizeAmount: number;
  proofUrl: string | null;
  verified: boolean;
  paid: boolean;
  createdAt: string;
};

const Admin = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [charities, setCharities] = useState<AdminCharity[]>([]);
  const [draws, setDraws] = useState<AdminDraw[]>([]);
  const [winners, setWinners] = useState<AdminWinner[]>([]);
  const [drawType, setDrawType] = useState<"random" | "algorithmic">("random");
  const [simResults, setSimResults] = useState<SimulationResult | null>(null);
  const [charityForm, setCharityForm] = useState({
    name: "",
    causeType: "",
    description: "",
    fullDescription: "",
    imageUrl: "",
    goalAmount: "",
  });
  const [editingCharityId, setEditingCharityId] = useState<string | null>(null);
  const [drawForm, setDrawForm] = useState({
    drawDate: "",
    drawNumbers: "",
    jackpotAmount: "",
    published: false,
  });

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
        maximumFractionDigits: 2,
      }),
    []
  );

  const adminFetch = async (path: string, init?: RequestInit) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      throw new Error("Admin session is missing.");
    }

    const response = await fetch(buildApiUrl(path), {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Admin API error (${response.status})`);
    }

    return response;
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, charitiesRes, drawsRes, winnersRes] = await Promise.all([
        adminFetch("/admin/users").then((res) => res.json()),
        adminFetch("/admin/charities").then((res) => res.json()),
        adminFetch("/admin/draws").then((res) => res.json()),
        adminFetch("/admin/winners").then((res) => res.json()),
      ]);

      setUsers(usersRes.users ?? []);
      setCharities(charitiesRes.charities ?? []);
      setDraws(drawsRes.draws ?? []);
      setWinners(winnersRes.winners ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load admin data.";
      toast({ title: "Admin load failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const runSimulation = async (draw: AdminDraw | null) => {
    if (!draw) {
      toast({ title: "No draw available", description: "Create a draw before running simulation.", variant: "destructive" });
      return;
    }

    try {
      const response = await adminFetch(`/admin/draws/${draw.id}/simulate`, { method: "POST" });
      const body = (await response.json()) as { simulation?: { entryCount: number; tiers: SimulationResult["tiers"]; prizes: SimulationResult["prizes"]; drawNumbers: number[] } };
      const simulation = body.simulation;
      if (simulation) {
        setSimResults({
          drawId: draw.id,
          entryCount: simulation.entryCount,
          tiers: simulation.tiers,
          prizes: simulation.prizes,
          numbers: simulation.drawNumbers,
        });
      }
      toast({ title: "Simulation complete", description: "Results generated from live scores." });
      await loadAdminData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Simulation failed.";
      toast({ title: "Simulation error", description: message, variant: "destructive" });
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
      canceled: "bg-destructive/15 text-destructive border-destructive/30",
      past_due: "bg-destructive/15 text-destructive border-destructive/30",
    };
    const key = status?.toLowerCase?.() ?? "";
    return <Badge className={`${styles[key] || ""} hover:bg-transparent`}>{status || "Unknown"}</Badge>;
  };

  const resetCharityForm = () => {
    setCharityForm({ name: "", causeType: "", description: "", fullDescription: "", imageUrl: "", goalAmount: "" });
    setEditingCharityId(null);
  };

  const saveCharity = async () => {
    if (!charityForm.name.trim()) {
      toast({ title: "Missing name", description: "Charity name is required.", variant: "destructive" });
      return;
    }

    const payload = {
      name: charityForm.name.trim(),
      causeType: charityForm.causeType.trim() || null,
      description: charityForm.description.trim() || null,
      fullDescription: charityForm.fullDescription.trim() || null,
      imageUrl: charityForm.imageUrl.trim() || null,
      goalAmount: charityForm.goalAmount ? Number.parseFloat(charityForm.goalAmount) : null,
    };

    try {
      if (editingCharityId) {
        await adminFetch(`/admin/charities/${editingCharityId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast({ title: "Charity updated", description: "Changes saved." });
      } else {
        await adminFetch("/admin/charities", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast({ title: "Charity created", description: "New charity added." });
      }
      resetCharityForm();
      await loadAdminData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save charity.";
      toast({ title: "Charity error", description: message, variant: "destructive" });
    }
  };

  const editCharity = (charity: AdminCharity) => {
    setEditingCharityId(charity.id);
    setCharityForm({
      name: charity.name ?? "",
      causeType: charity.causeType ?? "",
      description: charity.description ?? "",
      fullDescription: charity.fullDescription ?? "",
      imageUrl: charity.imageUrl ?? "",
      goalAmount: charity.goalAmount ? String(charity.goalAmount) : "",
    });
  };

  const deleteCharity = async (charityId: string) => {
    const confirmDelete = window.confirm("Delete this charity? This cannot be undone.");
    if (!confirmDelete) return;
    try {
      await adminFetch(`/admin/charities/${charityId}`, { method: "DELETE" });
      toast({ title: "Charity deleted" });
      await loadAdminData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete charity.";
      toast({ title: "Charity error", description: message, variant: "destructive" });
    }
  };

  const parseDrawNumbers = (value: string) =>
    value
      .split(",")
      .map((entry) => Number.parseInt(entry.trim(), 10))
      .filter((num) => Number.isFinite(num));

  const saveDraw = async () => {
    const numbers = parseDrawNumbers(drawForm.drawNumbers);
    if (!drawForm.drawDate || numbers.length !== 5) {
      toast({ title: "Invalid draw", description: "Provide a date and exactly five numbers.", variant: "destructive" });
      return;
    }

    const jackpotAmount = Number.parseFloat(drawForm.jackpotAmount);
    if (!Number.isFinite(jackpotAmount)) {
      toast({ title: "Invalid jackpot", description: "Provide a jackpot amount.", variant: "destructive" });
      return;
    }

    try {
      await adminFetch("/admin/draws", {
        method: "POST",
        body: JSON.stringify({
          drawDate: new Date(drawForm.drawDate).toISOString(),
          drawNumbers: numbers,
          drawType,
          jackpotAmount,
          published: drawForm.published,
        }),
      });
      toast({ title: "Draw created" });
      setDrawForm({ drawDate: "", drawNumbers: "", jackpotAmount: "", published: false });
      await loadAdminData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create draw.";
      toast({ title: "Draw error", description: message, variant: "destructive" });
    }
  };

  const toggleDrawPublished = async (draw: AdminDraw, published: boolean) => {
    try {
      await adminFetch(`/admin/draws/${draw.id}`, {
        method: "PATCH",
        body: JSON.stringify({ published }),
      });
      setDraws((prev) => prev.map((item) => (item.id === draw.id ? { ...item, published } : item)));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update draw.";
      toast({ title: "Draw error", description: message, variant: "destructive" });
    }
  };

  const updateWinnerStatus = async (winner: AdminWinner, updates: Partial<Pick<AdminWinner, "verified" | "paid">>) => {
    try {
      await adminFetch(`/admin/winners/${winner.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          verified: updates.verified ?? winner.verified,
          paid: updates.paid ?? winner.paid,
        }),
      });
      setWinners((prev) =>
        prev.map((item) => (item.id === winner.id ? { ...item, ...updates } : item))
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update winner.";
      toast({ title: "Winner update failed", description: message, variant: "destructive" });
    }
  };

  const analytics = useMemo(() => {
    const activeSubscribers = users.filter((user) => (user.status ?? "").toLowerCase() === "active").length;
    const prizePool = draws.reduce((sum, draw) => sum + (draw.jackpotAmount || 0), 0);
    const charityTotal = charities.reduce((sum, charity) => sum + (charity.totalContributions || 0), 0);
    return {
      activeSubscribers,
      prizePool,
      charityTotal,
      totalDraws: draws.length,
    };
  }, [users, draws, charities]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-foreground mb-6">
          Admin Panel
        </motion.h1>

        <Tabs defaultValue="users" className="space-y-5">
          <TabsList className="bg-muted/50 flex-wrap h-auto">
            <TabsTrigger value="users" className="gap-1.5"><Users className="w-3.5 h-3.5" /> Users</TabsTrigger>
            <TabsTrigger value="draws" className="gap-1.5"><Shuffle className="w-3.5 h-3.5" /> Draws</TabsTrigger>
            <TabsTrigger value="charities" className="gap-1.5"><Heart className="w-3.5 h-3.5" /> Charities</TabsTrigger>
            <TabsTrigger value="winners" className="gap-1.5"><Trophy className="w-3.5 h-3.5" /> Winners</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> Analytics</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {loading && (
                <div className="p-4 text-sm text-muted-foreground">Loading users...</div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Charity</TableHead>
                    <TableHead>Scores</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name ?? "Member"}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email ?? "-"}</TableCell>
                      <TableCell>{u.plan ?? "-"}</TableCell>
                      <TableCell>{statusBadge(u.status ?? "")}</TableCell>
                      <TableCell>{u.charity ?? "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {u.scores.map((s, i) => (
                            <span key={i} className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center">{s}</span>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Draw Management Tab */}
          <TabsContent value="draws" className="space-y-5">
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="font-semibold text-foreground mb-4">Draw Configuration</h2>
              <div className="flex items-center gap-4 mb-4">
                <Label>Draw Type:</Label>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${drawType === "random" ? "text-foreground font-medium" : "text-muted-foreground"}`}>Random</span>
                  <Switch checked={drawType === "algorithmic"} onCheckedChange={(v) => setDrawType(v ? "algorithmic" : "random")} />
                  <span className={`text-sm ${drawType === "algorithmic" ? "text-foreground font-medium" : "text-muted-foreground"}`}>Algorithmic</span>
                </div>
              </div>
              {drawType === "algorithmic" && (
                <p className="text-xs text-muted-foreground mb-4">Algorithmic mode weights toward least frequent numbers across all active user scores.</p>
              )}
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mb-4">
                <div>
                  <Label className="text-xs">Draw date</Label>
                  <Input type="date" value={drawForm.drawDate} onChange={(e) => setDrawForm((prev) => ({ ...prev, drawDate: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Numbers (comma separated)</Label>
                  <Input value={drawForm.drawNumbers} onChange={(e) => setDrawForm((prev) => ({ ...prev, drawNumbers: e.target.value }))} placeholder="4, 12, 19, 27, 33" />
                </div>
                <div>
                  <Label className="text-xs">Jackpot amount</Label>
                  <Input value={drawForm.jackpotAmount} onChange={(e) => setDrawForm((prev) => ({ ...prev, jackpotAmount: e.target.value }))} placeholder="1250" />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch checked={drawForm.published} onCheckedChange={(v) => setDrawForm((prev) => ({ ...prev, published: v }))} />
                  <span className="text-sm text-muted-foreground">Publish immediately</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => runSimulation(draws[0] ?? null)} variant="outline" className="gap-1.5">
                  <Play className="w-3.5 h-3.5" /> Run Simulation
                </Button>
                <Button onClick={saveDraw} className="bg-gold text-gold-foreground hover:bg-gold/90 gap-1.5">
                  Create Draw
                </Button>
              </div>
            </div>

            {simResults && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-semibold text-foreground mb-3">Simulation Preview</h3>
                <p className="text-xs text-muted-foreground mb-4">Entries included: {simResults.entryCount}</p>
                <div className="flex gap-2 mb-4">
                  {simResults.numbers.map((n, i) => (
                    <div key={i} className="w-11 h-11 rounded-full bg-gold text-gold-foreground font-bold text-sm flex items-center justify-center shadow">{n}</div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">5-Match</p>
                    <p className="text-lg font-bold text-foreground">{simResults.tiers.five}</p>
                    <p className="text-xs text-muted-foreground">{currencyFormatter.format(simResults.prizes.five)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">4-Match</p>
                    <p className="text-lg font-bold text-foreground">{simResults.tiers.four}</p>
                    <p className="text-xs text-muted-foreground">{currencyFormatter.format(simResults.prizes.four)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">3-Match</p>
                    <p className="text-lg font-bold text-foreground">{simResults.tiers.three}</p>
                    <p className="text-xs text-muted-foreground">{currencyFormatter.format(simResults.prizes.three)}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {loading && (
                <div className="p-4 text-sm text-muted-foreground">Loading draws...</div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Numbers</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Jackpot</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {draws.map((draw) => (
                    <TableRow key={draw.id}>
                      <TableCell>{new Date(draw.drawDate).toLocaleDateString("en-GB")}</TableCell>
                      <TableCell>{draw.drawNumbers.join(", ")}</TableCell>
                      <TableCell className="capitalize">{draw.drawType}</TableCell>
                      <TableCell>{currencyFormatter.format(draw.jackpotAmount)}</TableCell>
                      <TableCell>
                        <Switch checked={draw.published} onCheckedChange={(value) => toggleDrawPublished(draw, value)} />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => runSimulation(draw)}>
                          Simulate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Charities Tab */}
          <TabsContent value="charities">
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground">Manage Charities</h2>
                <div className="flex gap-2">
                  {editingCharityId && (
                    <Button size="sm" variant="outline" onClick={resetCharityForm}>Cancel Edit</Button>
                  )}
                  <Button size="sm" className="bg-gold text-gold-foreground hover:bg-gold/90" onClick={saveCharity}>
                    {editingCharityId ? "Save Charity" : "Add Charity"}
                  </Button>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mb-5">
                <div>
                  <Label className="text-xs">Name</Label>
                  <Input value={charityForm.name} onChange={(e) => setCharityForm((prev) => ({ ...prev, name: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Cause</Label>
                  <Input value={charityForm.causeType} onChange={(e) => setCharityForm((prev) => ({ ...prev, causeType: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Goal amount</Label>
                  <Input value={charityForm.goalAmount} onChange={(e) => setCharityForm((prev) => ({ ...prev, goalAmount: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs">Short description</Label>
                  <Input value={charityForm.description} onChange={(e) => setCharityForm((prev) => ({ ...prev, description: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Image URL</Label>
                  <Input value={charityForm.imageUrl} onChange={(e) => setCharityForm((prev) => ({ ...prev, imageUrl: e.target.value }))} />
                </div>
                <div className="md:col-span-3">
                  <Label className="text-xs">Full description</Label>
                  <Input value={charityForm.fullDescription} onChange={(e) => setCharityForm((prev) => ({ ...prev, fullDescription: e.target.value }))} />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Cause</TableHead>
                    <TableHead>Contributions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {charities.map((charity) => (
                    <TableRow key={charity.id}>
                      <TableCell className="font-medium">{charity.name}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{charity.causeType ?? "-"}</Badge></TableCell>
                      <TableCell>{currencyFormatter.format(charity.totalContributions)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => editCharity(charity)}>Edit</Button>
                        <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => deleteCharity(charity.id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Winners Tab */}
          <TabsContent value="winners">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {loading && (
                <div className="p-4 text-sm text-muted-foreground">Loading winners...</div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Winner</TableHead>
                    <TableHead>Match</TableHead>
                    <TableHead>Prize</TableHead>
                    <TableHead>Proof</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {winners.map((winner) => (
                    <TableRow key={winner.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{winner.userName ?? "Member"}</span>
                          <span className="text-xs text-muted-foreground">{winner.userEmail ?? winner.userId}</span>
                        </div>
                      </TableCell>
                      <TableCell>{winner.matchType}-match</TableCell>
                      <TableCell className="font-medium text-gold">{currencyFormatter.format(winner.prizeAmount)}</TableCell>
                      <TableCell>
                        {winner.proofUrl ? (
                          <a
                            href={winner.proofUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-emerald-600 underline"
                          >
                            View proof
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell>{winner.verified ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-muted-foreground" />}</TableCell>
                      <TableCell>{winner.paid ? <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-transparent">Paid</Badge> : <Badge variant="outline">Pending</Badge>}</TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => updateWinnerStatus(winner, { verified: !winner.verified, paid: winner.verified ? winner.paid : false })}
                        >
                          {winner.verified ? "Unverify" : "Verify"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => updateWinnerStatus(winner, { paid: !winner.paid })}
                          disabled={!winner.verified}
                        >
                          {winner.paid ? "Mark Unpaid" : "Mark Paid"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Active Subscribers", value: analytics.activeSubscribers.toString(), icon: Users, color: "text-primary" },
                { label: "Prize Pool", value: currencyFormatter.format(analytics.prizePool), icon: Trophy, color: "text-gold" },
                { label: "Charity Contributions", value: currencyFormatter.format(analytics.charityTotal), icon: Heart, color: "text-coral" },
                { label: "Total Draws", value: analytics.totalDraws.toString(), icon: Shuffle, color: "text-primary" },
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl border border-border p-5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
