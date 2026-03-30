import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Heart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const mockCharities = [
  { id: "1", name: "Golf For Good Foundation", description: "Supporting youth golf programs and grassroots development across the UK.", image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&h=400&fit=crop", cause: "Youth Development", contributions: 12450, goal: 20000 },
  { id: "2", name: "Fairway Future Trust", description: "Building accessible golf facilities in underserved communities.", image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&h=400&fit=crop", cause: "Community", contributions: 8300, goal: 15000 },
  { id: "3", name: "Green Hearts Initiative", description: "Environmental conservation through sustainable golf course management.", image: "https://images.unsplash.com/photo-1500076656116-558758c991c1?w=600&h=400&fit=crop", cause: "Environment", contributions: 15200, goal: 25000 },
  { id: "4", name: "Youth On Course UK", description: "Making golf affordable for young people with subsidised green fees.", image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop", cause: "Youth Development", contributions: 22100, goal: 30000 },
  { id: "5", name: "Veterans Fairway Project", description: "Using golf as therapy and community for military veterans.", image: "https://images.unsplash.com/photo-1559734840-f9509ee5677f?w=600&h=400&fit=crop", cause: "Veterans", contributions: 6700, goal: 12000 },
  { id: "6", name: "Golf & Mental Health Alliance", description: "Promoting mental wellbeing through outdoor sport and social connection.", image: "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?w=600&h=400&fit=crop", cause: "Mental Health", contributions: 9800, goal: 18000 },
];

const causeTypes = ["All", "Youth Development", "Community", "Environment", "Veterans", "Mental Health"];

const Charities = () => {
  const [search, setSearch] = useState("");
  const [cause, setCause] = useState("All");

  const filtered = mockCharities.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchCause = cause === "All" || c.cause === cause;
    return matchSearch && matchCause;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground mb-2">Charity Directory</h1>
          <p className="text-muted-foreground mb-6">Discover the causes your subscription supports.</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search charities..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {causeTypes.map((c) => (
              <button
                key={c}
                onClick={() => setCause(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  cause === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((charity, i) => (
            <motion.div
              key={charity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/charities/${charity.id}`} className="block group">
                <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-40 overflow-hidden">
                    <img
                      src={charity.image}
                      alt={charity.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground group-hover:text-gold transition-colors">{charity.name}</h3>
                      <Badge variant="outline" className="text-[10px] border-coral/30 text-coral shrink-0 ml-2">{charity.cause}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{charity.description}</p>
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-coral" /> £{charity.contributions.toLocaleString()}</span>
                        <span>Goal: £{charity.goal.toLocaleString()}</span>
                      </div>
                      <Progress value={(charity.contributions / charity.goal) * 100} className="h-1.5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Charities;
