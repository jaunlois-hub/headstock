import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="px-4 md:px-12 py-16 md:py-24">
      <div className="max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          South-African indie label & creative hub
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
          We release your music worldwide, plug it to radio, shoot your videos and design your visuals—giving every artist a fair shot.
        </p>
        <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
          <a href="#submit">Submit your demo</a>
        </Button>
      </div>
    </section>
  );
};

export default Hero;
