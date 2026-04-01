import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, role, signOut, subscriptionActive } = useAuth();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md border-b border-primary/20"
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/logog.webp"
            alt="GreenGive"
            className="w-9 h-9 rounded-full object-cover bg-primary/80 ring-1 ring-primary-foreground/15"
          />
          <span className="text-primary-foreground font-bold text-xl tracking-tight">
            GreenGive
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/charities" className="text-primary-foreground/80 hover:text-primary-foreground text-sm font-medium transition-colors">
            Charities
          </Link>
          <Link to="/draws" className="text-primary-foreground/80 hover:text-primary-foreground text-sm font-medium transition-colors">
            Draws
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-primary-foreground/80 hover:text-primary-foreground text-sm font-medium transition-colors">
                Dashboard
              </Link>
              {role === "admin" && (
                <Link to="/admin" className="text-primary-foreground/80 hover:text-primary-foreground text-sm font-medium transition-colors">
                  Admin
                </Link>
              )}
              {!subscriptionActive && (
                <Button asChild className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold rounded-full px-6">
                  <Link to="/subscription-locked">Complete Subscription</Link>
                </Button>
              )}
              <Button
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground bg-transparent hover:text-primary-foreground hover:bg-primary-foreground/10"
                onClick={signOut}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-primary-foreground/80 hover:text-primary-foreground text-sm font-medium transition-colors">
                Log In
              </Link>
              <Button asChild className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold rounded-full px-6">
                <Link to="/signup">Subscribe Now</Link>
              </Button>
            </>
          )}
        </nav>

        <button
          className="md:hidden text-primary-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden bg-primary border-t border-primary/20"
        >
          <div className="flex flex-col gap-3 p-4">
            <Link to="/charities" className="text-primary-foreground/80 py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>
              Charities
            </Link>
            <Link to="/draws" className="text-primary-foreground/80 py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>
              Draws
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-primary-foreground/80 py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
                {role === "admin" && (
                  <Link to="/admin" className="text-primary-foreground/80 py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>
                    Admin
                  </Link>
                )}
                {!subscriptionActive && (
                  <Button asChild className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold rounded-full">
                    <Link to="/subscription-locked" onClick={() => setMobileOpen(false)}>Complete Subscription</Link>
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="border-primary-foreground/30 text-primary-foreground bg-transparent hover:text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={() => {
                    signOut();
                    setMobileOpen(false);
                  }}
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-primary-foreground/80 py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>
                  Log In
                </Link>
                <Button asChild className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold rounded-full mt-2">
                  <Link to="/signup" onClick={() => setMobileOpen(false)}>Subscribe Now</Link>
                </Button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;
