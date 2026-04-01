import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const AccessDenied = () => (
  <div className="min-h-screen bg-background flex items-center justify-center px-6">
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
      <h1 className="text-3xl font-bold text-foreground">Access denied</h1>
      <p className="text-muted-foreground mt-3">
        You do not have permission to view this page.
      </p>
      <Button asChild className="mt-6 bg-gold text-gold-foreground hover:bg-gold/90">
        <Link to="/">Return home</Link>
      </Button>
    </motion.div>
  </div>
);

export default AccessDenied;
