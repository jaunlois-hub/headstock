import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 md:px-12 pt-20">
      <div className="max-w-5xl w-full text-center animate-fade-in">
        <h1 className="text-5xl md:text-8xl font-bold mb-8 leading-tight tracking-tight">
          Record Your Sound.<br />
          Define Your Legacy.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
          Professional music production, engineering, and artist services. We are where your vision comes to life.
        </p>
        <Button 
          asChild 
          size="lg" 
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base uppercase tracking-wider"
        >
          <a href="#services">Explore Our Services</a>
        </Button>
      </div>
    </section>
  );
};

export default Hero;
