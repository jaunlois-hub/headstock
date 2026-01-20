import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

import hoodieBlack from "@/assets/merch/hoodie-black.png";
import hoodiePink from "@/assets/merch/hoodie-pink.png";
import hoodieBurgundyHst from "@/assets/merch/hoodie-burgundy-hst.png";
import hoodieLilac from "@/assets/merch/hoodie-lilac.png";
import mugs from "@/assets/merch/mugs.png";
import caps from "@/assets/merch/caps.png";
import hoodieBurgundyLarge from "@/assets/merch/hoodie-burgundy-large.png";
import hoodieWhiteArt from "@/assets/merch/hoodie-white-art.png";
import hoodieBlackArt from "@/assets/merch/hoodie-black-art.png";
import gearVideo from "@/assets/merch/headstock-gear.mp4";

const products = [
  { id: 1, name: "Classic Black Hoodie", price: "R650", image: hoodieBlack, category: "Hoodies" },
  { id: 2, name: "Dusty Rose Hoodie", price: "R650", image: hoodiePink, category: "Hoodies" },
  { id: 3, name: "Burgundy HST Hoodie", price: "R650", image: hoodieBurgundyHst, category: "Hoodies" },
  { id: 4, name: "Lilac Edition Hoodie", price: "R650", image: hoodieLilac, category: "Hoodies" },
  { id: 5, name: "Signature Mugs Set", price: "R180", image: mugs, category: "Accessories" },
  { id: 6, name: "Headstock Caps Collection", price: "R250", image: caps, category: "Accessories" },
  { id: 7, name: "Burgundy Large Print", price: "R680", image: hoodieBurgundyLarge, category: "Hoodies" },
  { id: 8, name: "White Art Edition", price: "R720", image: hoodieWhiteArt, category: "Limited Edition" },
  { id: 9, name: "Black Art Edition", price: "R720", image: hoodieBlackArt, category: "Limited Edition" },
];

const Merchandise = () => {
  return (
    <section id="merch" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Headstock <span className="text-primary">Gear</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Wear your passion. Premium merchandise designed for musicians and music lovers.
            </p>
          </div>
        </ScrollReveal>

        {/* Featured Video */}
        <ScrollReveal>
          <div className="mb-16 max-w-4xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <video
                src={gearVideo}
                autoPlay
                loop
                muted
                playsInline
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-2xl font-bold text-white mb-2">New Collection</h3>
                <p className="text-white/80">Explore our latest drops</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <ScrollReveal key={product.id} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -8 }}
                className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-background/90 backdrop-blur-sm rounded-full text-xs font-medium">
                      {product.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">{product.price}</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Inquire
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Contact CTA */}
        <ScrollReveal>
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-4">
              Interested in bulk orders or custom merchandise?
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Merchandise;
