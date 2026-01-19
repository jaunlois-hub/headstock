import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 md:px-12 pt-20">
      <div className="max-w-5xl w-full text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-5xl md:text-8xl font-bold mb-8 leading-tight tracking-tight"
        >
          Record Your Sound.<br />
          Define Your Legacy.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12"
        >
          Professional music production, engineering, and artist services. We are where your vision comes to life.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Button 
            asChild 
            size="lg" 
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base uppercase tracking-wider"
          >
            <a href="#services">Explore Our Services</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
