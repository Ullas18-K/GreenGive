import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const HeroSection = () => {
  const { user, subscriptionActive } = useAuth();

  return (
    <section className="group relative min-h-screen flex items-center justify-center overflow-hidden bg-primary">
      {/* Animated gradient orbs */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold/10 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-coral/10 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, 15, 0], y: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-primary-foreground/5 blur-3xl"
      />

      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold/15 text-gold text-sm font-medium mb-6 border border-gold/20">
            A new kind of golf community
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-primary-foreground leading-tight tracking-tight"
        >
          Win. Give. Play.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-6 text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto leading-relaxed"
        >
          Subscribe, enter your golf scores, and compete in monthly prize draws — 
          while a portion of every subscription goes directly to the charities you choose.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {subscriptionActive ? (
            <Button
              asChild
              size="lg"
              className="bg-gold text-gold-foreground hover:bg-gold/90 rounded-full px-8 text-base font-semibold shadow-lg shadow-gold/20"
            >
              <Link to="/dashboard">
                Go to Dashboard <ArrowRight className="ml-1" size={18} />
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              size="lg"
              className="bg-gold text-gold-foreground hover:bg-gold/90 rounded-full px-8 text-base font-semibold shadow-lg shadow-gold/20"
            >
              <Link to={user ? "/subscription-locked" : "/signup"}>
                Subscribe Now <ArrowRight className="ml-1" size={18} />
              </Link>
            </Button>
          )}
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-8 text-base border-primary-foreground/30 text-primary-foreground bg-transparent hover:bg-primary-foreground/10"
          >
            <a href="#how-it-works">Learn More</a>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-16 flex items-center justify-center gap-8 text-primary-foreground/50 text-sm"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-gold">£12K+</div>
            <div>Donated</div>
          </div>
          <div className="w-px h-10 bg-primary-foreground/15" />
          <div className="text-center">
            <div className="text-2xl font-bold text-coral">500+</div>
            <div>Members</div>
          </div>
          <div className="w-px h-10 bg-primary-foreground/15" />
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-foreground">15</div>
            <div>Charities</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
