import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  return (
    <section 
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center px-6 md:px-12 pt-20 relative overflow-hidden"
    >
      {/* Parallax Background Elements */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        style={{ y: backgroundY }}
      >
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent rounded-full blur-2xl" />
        
        {/* Decorative lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </motion.div>

      {/* Floating music notes - parallax at different speeds */}
      <motion.div 
        className="absolute top-20 left-10 text-6xl opacity-5 select-none"
        style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "200%"]) }}
      >
        ♪
      </motion.div>
      <motion.div 
        className="absolute top-40 right-20 text-8xl opacity-5 select-none"
        style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "150%"]) }}
      >
        ♫
      </motion.div>
      <motion.div 
        className="absolute bottom-40 left-20 text-7xl opacity-5 select-none"
        style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]) }}
      >
        ♬
      </motion.div>
      <motion.div 
        className="absolute bottom-20 right-10 text-5xl opacity-5 select-none"
        style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "250%"]) }}
      >
        ♩
      </motion.div>

      {/* Main Content with parallax */}
      <motion.div 
        className="max-w-5xl w-full text-center relative z-10"
        style={{ y: textY, opacity, scale }}
      >
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
      </motion.div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        style={{ opacity }}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
          <motion.div 
            className="w-1.5 h-1.5 bg-primary rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
