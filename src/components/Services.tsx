import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Music, Radio, Video, Palette, FileText, Lightbulb } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const services = [
  {
    title: "Recordings",
    description: "From demo tracks to full-length albums, our studio provides a world-class environment for capturing your sound with pristine clarity.",
    icon: Music,
  },
  {
    title: "Radio Plugging",
    description: "We connect your music with radio stations and tastemakers to get your tracks the airplay they deserve.",
    icon: Radio,
  },
  {
    title: "Music Videos",
    description: "Our team creates stunning visuals that complement your music and captivate your audience.",
    icon: Video,
  },
  {
    title: "Artist Designs",
    description: "From album art to promotional materials, we design a cohesive visual identity that stands out.",
    icon: Palette,
  },
  {
    title: "Publications",
    description: "We assist in publishing your work, ensuring it reaches major digital stores globally.",
    icon: FileText,
  },
  {
    title: "Professional Guidance",
    description: "We act as your professional partner, providing career guidance and industry insights to help you navigate your journey.",
    icon: Lightbulb,
  },
];

const Services = () => {
  return (
    <section id="services" className="px-6 md:px-12 py-24 md:py-32">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="text-4xl md:text-6xl font-bold mb-16 tracking-tight text-center">Our Services</h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
              >
                <Card
                  className="bg-card border-border p-8 hover:border-primary transition-all duration-300 group h-full"
                >
                  <div className="mb-6 text-foreground group-hover:scale-110 transition-transform duration-300">
                    <Icon size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground uppercase tracking-wide">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
