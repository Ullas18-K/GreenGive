import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Shuffle, Heart, Trophy, BarChart3, Play, Upload, Check, X } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const mockUsers = [
  { id: "1", name: "Sarah Johnson", email: "sarah@email.com", plan: "Monthly", status: "Active", charity: "Golf For Good", scores: [38, 32, 41, 29, 35] },
  { id: "2", name: "James Wilson", email: "james@email.com", plan: "Yearly", status: "Active", charity: "Green Hearts", scores: [42, 37, 33] },
  { id: "3", name: "Emma Davis", email: "emma@email.com", plan: "Monthly", status: "Lapsed", charity: "Youth On Course", scores: [28, 44, 31, 39, 36] },
  { id: "4", name: "Tom Brown", email: "tom@email.com", plan: "Yearly", status: "Active", charity: "Fairway Future", scores: [40, 35] },
];

const mockWinners = [
  { id: "1", name: "Sarah Johnson", matchType: "4", prize: "£210", verified: false, paid: false, proof: null },
  { id: "2", name: "Tom Brown", matchType: "3", prize: "£37.50", verified: true, paid: false, proof: "screenshot.png" },
  { id: "3", name: "James Wilson", matchType: "3", prize: "£37.50", verified: true, paid: true, proof: "proof.jpg" },
];

const Admin = () => {
  const { toast } = useToast();
  const [drawType, setDrawType] = useState<"random" | "algorithmic">("random");
  const [simResults, setSimResults] = useState<null | { five: number; four: number; three: number; numbers: number[] }>(null);

  const runSimulation = () => {
    const numbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 45) + 1);
    setSimResults({ five: 0, four: 2, three: 7, numbers });
    toast({ title: "Simulation complete", description: "Results preview generated — not published." });
  };

  const publishResults = () => {
    toast({ title: "Results published!", description: "Draw results are now live." });
    setSimResults(null);
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Active: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
      Lapsed: "bg-destructive/15 text-destructive border-destructive/30",
    };
    return <Badge className={`${styles[status] || ""} hover:bg-transparent`}>{status}</Badge>;
  };

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
                  {mockUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>{u.plan}</TableCell>
                      <TableCell>{statusBadge(u.status)}</TableCell>
                      <TableCell>{u.charity}</TableCell>
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
              <div className="flex gap-3">
                <Button onClick={runSimulation} variant="outline" className="gap-1.5">
                  <Play className="w-3.5 h-3.5" /> Run Simulation
                </Button>
                <Button onClick={publishResults} className="bg-gold text-gold-foreground hover:bg-gold/90 gap-1.5" disabled={!simResults}>
                  Publish Results
                </Button>
              </div>
            </div>

            {simResults && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-semibold text-foreground mb-3">Simulation Preview</h3>
                <div className="flex gap-2 mb-4">
                  {simResults.numbers.map((n, i) => (
                    <div key={i} className="w-11 h-11 rounded-full bg-gold text-gold-foreground font-bold text-sm flex items-center justify-center shadow">{n}</div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">5-Match</p>
                    <p className="text-lg font-bold text-foreground">{simResults.five}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">4-Match</p>
                    <p className="text-lg font-bold text-foreground">{simResults.four}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">3-Match</p>
                    <p className="text-lg font-bold text-foreground">{simResults.three}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </TabsContent>

          {/* Charities Tab */}
          <TabsContent value="charities">
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground">Manage Charities</h2>
                <Button size="sm" className="bg-gold text-gold-foreground hover:bg-gold/90">Add Charity</Button>
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
                  {[
                    { name: "Golf For Good Foundation", cause: "Youth Development", contributions: "£12,450" },
                    { name: "Fairway Future Trust", cause: "Community", contributions: "£8,300" },
                    { name: "Green Hearts Initiative", cause: "Environment", contributions: "£15,200" },
                  ].map((c, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{c.cause}</Badge></TableCell>
                      <TableCell>{c.contributions}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-xs">Edit</Button>
                        <Button variant="ghost" size="sm" className="text-xs text-destructive">Delete</Button>
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
                  {mockWinners.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell className="font-medium">{w.name}</TableCell>
                      <TableCell>{w.matchType}-match</TableCell>
                      <TableCell className="font-medium text-gold">{w.prize}</TableCell>
                      <TableCell>{w.proof ? <span className="text-xs text-emerald-600">{w.proof}</span> : <span className="text-xs text-muted-foreground">None</span>}</TableCell>
                      <TableCell>{w.verified ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-muted-foreground" />}</TableCell>
                      <TableCell>{w.paid ? <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-transparent">Paid</Badge> : <Badge variant="outline">Pending</Badge>}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {!w.verified && <Button size="sm" variant="outline" className="text-xs h-7">Approve</Button>}
                          {!w.paid && w.verified && <Button size="sm" className="text-xs h-7 bg-gold text-gold-foreground hover:bg-gold/90">Mark Paid</Button>}
                        </div>
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
                { label: "Active Subscribers", value: "247", icon: Users, color: "text-primary" },
                { label: "Prize Pool", value: "£1,235", icon: Trophy, color: "text-gold" },
                { label: "Charity Contributions", value: "£74,200", icon: Heart, color: "text-coral" },
                { label: "Total Draws", value: "12", icon: Shuffle, color: "text-primary" },
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
