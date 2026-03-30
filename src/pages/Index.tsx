import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import DrawExplainer from "@/components/DrawExplainer";
import FeaturedCharity from "@/components/FeaturedCharity";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <HowItWorks />
      <DrawExplainer />
      <FeaturedCharity />
      <PricingSection />
      <Footer />
    </div>
  );
};

export default Index;
