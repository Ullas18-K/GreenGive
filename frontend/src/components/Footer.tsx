import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Footer = () => {
  const { user, role, subscriptionActive } = useAuth();

  return (
    <footer className="bg-primary py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img
              src="/logog.webp"
              alt="GreenGive"
              className="w-7 h-7 rounded-full object-cover bg-primary/80 ring-1 ring-primary-foreground/20"
            />
            <span className="text-primary-foreground font-bold text-lg">GreenGive</span>
          </div>

          <nav className="flex items-center gap-6 text-sm text-primary-foreground/60">
            <Link to="/charities" className="hover:text-primary-foreground transition-colors">Charities</Link>
            <Link to="/draws" className="hover:text-primary-foreground transition-colors">Draws</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="hover:text-primary-foreground transition-colors">Dashboard</Link>
                {role === "admin" && (
                  <Link to="/admin" className="hover:text-primary-foreground transition-colors">Admin</Link>
                )}
                {!subscriptionActive && (
                  <Link to="/subscription-locked" className="hover:text-primary-foreground transition-colors">Complete Subscription</Link>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-primary-foreground transition-colors">Log In</Link>
                <Link to="/signup" className="hover:text-primary-foreground transition-colors">Subscribe Now</Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-1 text-sm text-primary-foreground/40">
            Made with <Heart size={14} className="text-coral" /> for a better game
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
