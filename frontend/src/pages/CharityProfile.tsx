import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, CalendarDays, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiFetch } from "@/lib/api";

type CharityEvent = { title: string; date: string; location: string };

type CharityProfile = {
  id: string;
  name: string;
  description: string | null;
  fullDescription: string | null;
  imageUrl: string | null;
  causeType: string | null;
  totalContributions: number;
  goalAmount: number | null;
  upcomingEvents: CharityEvent[];
};

const CharityProfile = () => {
  const { id } = useParams();
  const [charity, setCharity] = useState<CharityProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadCharity = async () => {
      if (!id) {
        setError("Missing charity id.");
        setLoading(false);
        return;
      }

      try {
        const response = await apiFetch(`/charities/${id}`);
        const body = (await response.json()) as { charity?: CharityProfile };
        if (active) {
          setCharity(body.charity ?? null);
        }
      } catch (err) {
        if (active) {
          const message = err instanceof Error ? err.message : "Unable to load charity.";
          setError(message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadCharity();

    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="h-64 md:h-80 relative overflow-hidden">
          <img
            src={charity?.imageUrl || "https://images.unsplash.com/photo-1500076656116-558758c991c1?w=1200&h=500&fit=crop"}
            alt={charity?.name || "Charity"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        </div>

        <div className="container mx-auto px-4 -mt-16 relative z-10 pb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/charities" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Charities
            </Link>

            {loading ? (
              <p className="text-sm text-muted-foreground">Loading charity...</p>
            ) : error || !charity ? (
              <p className="text-sm text-destructive">{error || "Charity not found."}</p>
            ) : (
              <>
                <div className="flex flex-wrap items-start gap-3 mb-4">
                  <h1 className="text-3xl font-bold text-foreground">{charity.name}</h1>
                  {charity.causeType && (
                    <Badge className="bg-coral/15 text-coral border-coral/30 hover:bg-coral/15">{charity.causeType}</Badge>
                  )}
                </div>

                <p className="text-muted-foreground max-w-2xl mb-6 leading-relaxed">
                  {charity.fullDescription || charity.description}
                </p>

                <div className="grid md:grid-cols-3 gap-5 mb-8">
                  <div className="bg-card rounded-xl border border-border p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-coral" />
                      <span className="text-sm font-medium text-foreground">Total Contributions</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">£{charity.totalContributions.toLocaleString()}</p>
                    <Progress value={charity.goalAmount ? (charity.totalContributions / charity.goalAmount) * 100 : 0} className="h-1.5 mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">Goal: £{(charity.goalAmount ?? 0).toLocaleString()}</p>
                  </div>

                  <div className="bg-card rounded-xl border border-border p-5 md:col-span-2">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-gold" /> Upcoming Events
                    </h3>
                    {charity.upcomingEvents.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No upcoming events.</p>
                    ) : (
                      <div className="space-y-3">
                        {charity.upcomingEvents.map((ev, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <div className="w-10 h-10 rounded-lg bg-gold/15 flex items-center justify-center shrink-0">
                              <CalendarDays className="w-4 h-4 text-gold" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{ev.title}</p>
                              <p className="text-xs text-muted-foreground">{ev.date}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" /> {ev.location}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Button className="bg-coral text-coral-foreground hover:bg-coral/90 rounded-full px-8 font-semibold">
                  Donate Independently
                </Button>
              </>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CharityProfile;
