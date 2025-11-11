import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="px-4 md:px-12 py-16 md:py-32 relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-30"
        style={{ background: 'var(--gradient-hero)' }}
      />
      <div className="max-w-4xl relative z-10 animate-fade-in">
        <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
          Your sound.
          <span className="block text-primary">Our passion.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-4">
          South Africa's independent music label dedicated to elevating emerging artists. From production to distribution, radio plugging to visual content—we provide everything you need to make your mark in the music industry.
        </p>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mb-8">
          Fair deals. Real support. Global reach.
        </p>
        <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg hover:shadow-xl transition-all">
          <a href="#submit">Submit your demo</a>
        </Button>
      </div>
    </section>
  );
};

export default Hero;
