import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Heart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiFetch } from "@/lib/api";

type CharityCard = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  causeType: string | null;
  totalContributions: number;
  goalAmount: number | null;
};

const causeTypes = ["All", "Youth Development", "Community", "Environment", "Veterans", "Mental Health"];

const Charities = () => {
  const [charities, setCharities] = useState<CharityCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [cause, setCause] = useState("All");

  useEffect(() => {
    let active = true;
    const handle = setTimeout(() => {
      const loadCharities = async () => {
        try {
          setLoading(true);
          setError(null);
          const params = new URLSearchParams();
          if (search.trim()) params.set("search", search.trim());
          if (cause && cause !== "All") params.set("cause", cause);
          const query = params.toString();
          const response = await apiFetch(`/charities${query ? `?${query}` : ""}`);
          const body = (await response.json()) as { charities?: CharityCard[] };
          if (active) {
            setCharities(body.charities ?? []);
          }
        } catch (err) {
          if (active) {
            const message = err instanceof Error ? err.message : "Unable to load charities.";
            setError(message);
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

      loadCharities();
    }, 250);

    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [search, cause]);

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

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading charities...</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {charities.map((charity, i) => (
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
                      src={charity.imageUrl || "https://images.unsplash.com/photo-1500076656116-558758c991c1?w=600&h=400&fit=crop"}
                      alt={charity.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground group-hover:text-gold transition-colors">{charity.name}</h3>
                      {charity.causeType && (
                        <Badge variant="outline" className="text-[10px] border-coral/30 text-coral shrink-0 ml-2">{charity.causeType}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{charity.description}</p>
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-coral" /> £{charity.totalContributions.toLocaleString()}</span>
                        <span>Goal: £{(charity.goalAmount ?? 0).toLocaleString()}</span>
                      </div>
                      <Progress value={charity.goalAmount ? (charity.totalContributions / charity.goalAmount) * 100 : 0} className="h-1.5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Charities;
