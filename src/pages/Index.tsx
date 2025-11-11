import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import GuitarTuner from "@/components/GuitarTuner";
import Submit from "@/components/Submit";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Services />
        <GuitarTuner />
        <Submit />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
