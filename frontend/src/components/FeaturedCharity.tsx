import { motion } from "framer-motion";
import { Heart, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const FeaturedCharity = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sm font-semibold text-coral uppercase tracking-wider">Making a Difference</span>
          <h2 className="mt-3 text-3xl md:text-5xl font-bold text-foreground">Featured Charity</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto rounded-3xl overflow-hidden border border-border bg-card shadow-sm"
        >
          <div className="md:flex">
            <div className="md:w-2/5 bg-coral/10 flex items-center justify-center p-12">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-coral/20 flex items-center justify-center mx-auto mb-4">
                  <Heart className="text-coral" size={36} />
                </div>
                <h3 className="text-xl font-bold text-foreground">Hope for Youth</h3>
                <span className="text-xs font-medium text-coral bg-coral/10 px-3 py-1 rounded-full mt-2 inline-block">
                  Youth Development
                </span>
              </div>
            </div>
            <div className="md:w-3/5 p-8 md:p-10">
              <p className="text-muted-foreground leading-relaxed mb-6">
                Hope for Youth provides golf-based mentoring programmes for underprivileged young people. 
                Through structured coaching and community events, they help develop discipline, 
                confidence, and life skills both on and off the course.
              </p>

              <div className="flex items-center gap-6 mb-6">
                <div>
                  <div className="text-2xl font-bold text-coral">£3,240</div>
                  <div className="text-xs text-muted-foreground">Raised via GreenGive</div>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar size={16} className="text-gold" />
                  <span>Charity Golf Day — 15 Apr 2026</span>
                </div>
              </div>

              <Button
                asChild
                className="bg-coral text-coral-foreground hover:bg-coral/90 rounded-full px-6"
              >
                <Link to="/charities">View All Charities</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedCharity;
