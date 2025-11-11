import { Card } from "@/components/ui/card";
import { Music, Radio, Video, Palette, Globe, FileText } from "lucide-react";

const services = [
  {
    title: "Productions",
    description: "Professional studio recording, mixing, and mastering to bring your vision to life with pristine sound quality.",
    icon: Music,
  },
  {
    title: "Publications",
    description: "Copyright management, royalty collection, and publishing administration to protect and monetize your work.",
    icon: FileText,
  },
  {
    title: "Digital Distribution",
    description: "Get your music on Spotify, Apple Music, Deezer, and all major streaming platforms worldwide.",
    icon: Globe,
  },
  {
    title: "Radio Plugging",
    description: "Strategic radio promotion across South African stations to maximize your airplay and reach new audiences.",
    icon: Radio,
  },
  {
    title: "Music Videos",
    description: "Creative direction, filming, and post-production for music videos that capture your artistic identity.",
    icon: Video,
  },
  {
    title: "Artist Designs",
    description: "Album artwork, promotional materials, logos, and visual branding that make you stand out.",
    icon: Palette,
  },
];

const Services = () => {
  return (
    <section id="services" className="px-4 md:px-12 py-16 md:py-24">
      <h2 className="text-3xl md:text-5xl font-bold mb-4">What we do</h2>
      <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
        Full-service music solutions tailored for independent artists who are serious about their craft.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <Card
              key={service.title}
              className="bg-card border-border p-6 md:p-8 hover:translate-y-[-4px] hover:border-primary/50 transition-all duration-300 cursor-default group"
              style={{ 
                animationDelay: `${index * 100}ms`,
                background: 'var(--gradient-card)',
              }}
            >
              <div className="mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
                <Icon size={32} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 text-foreground">
                {service.title}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default Services;
