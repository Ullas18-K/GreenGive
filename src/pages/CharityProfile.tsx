import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, CalendarDays, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const charitiesData: Record<string, {
  name: string; description: string; image: string; cause: string;
  contributions: number; goal: number; fullDescription: string;
  events: { title: string; date: string; location: string }[];
}> = {
  "1": {
    name: "Golf For Good Foundation", cause: "Youth Development",
    image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200&h=500&fit=crop",
    description: "Supporting youth golf programs and grassroots development across the UK.",
    fullDescription: "The Golf For Good Foundation is dedicated to making golf accessible to young people from all backgrounds. Through subsidised coaching, equipment grants, and partnerships with local clubs, we're building the next generation of golfers while teaching life skills like discipline, sportsmanship, and perseverance. Since 2019, we've supported over 3,000 young players.",
    contributions: 12450, goal: 20000,
    events: [
      { title: "Summer Youth Golf Day", date: "June 15, 2026", location: "Royal St George's, Kent" },
      { title: "Charity Pro-Am", date: "August 8, 2026", location: "Wentworth Club, Surrey" },
    ],
  },
  "2": {
    name: "Fairway Future Trust", cause: "Community",
    image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200&h=500&fit=crop",
    description: "Building accessible golf facilities in underserved communities.",
    fullDescription: "Fairway Future Trust works to break down barriers to golf by funding the construction of public-access golf facilities in areas where the sport has traditionally been inaccessible. We believe everyone deserves a fairway.",
    contributions: 8300, goal: 15000,
    events: [
      { title: "Community Open Day", date: "July 20, 2026", location: "Manchester Community Links" },
    ],
  },
};

const CharityProfile = () => {
  const { id } = useParams();
  const charity = charitiesData[id || "1"] || charitiesData["1"];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="h-64 md:h-80 relative overflow-hidden">
          <img src={charity.image} alt={charity.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        </div>

        <div className="container mx-auto px-4 -mt-16 relative z-10 pb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/charities" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Charities
            </Link>

            <div className="flex flex-wrap items-start gap-3 mb-4">
              <h1 className="text-3xl font-bold text-foreground">{charity.name}</h1>
              <Badge className="bg-coral/15 text-coral border-coral/30 hover:bg-coral/15">{charity.cause}</Badge>
            </div>

            <p className="text-muted-foreground max-w-2xl mb-6 leading-relaxed">{charity.fullDescription}</p>

            <div className="grid md:grid-cols-3 gap-5 mb-8">
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-coral" />
                  <span className="text-sm font-medium text-foreground">Total Contributions</span>
                </div>
                <p className="text-2xl font-bold text-foreground">£{charity.contributions.toLocaleString()}</p>
                <Progress value={(charity.contributions / charity.goal) * 100} className="h-1.5 mt-2" />
                <p className="text-xs text-muted-foreground mt-1">Goal: £{charity.goal.toLocaleString()}</p>
              </div>

              <div className="bg-card rounded-xl border border-border p-5 md:col-span-2">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gold" /> Upcoming Events
                </h3>
                {charity.events.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No upcoming events.</p>
                ) : (
                  <div className="space-y-3">
                    {charity.events.map((ev, i) => (
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
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CharityProfile;
