import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GuitarTuner from "@/components/GuitarTuner";
import TuneAlongPlayer from "@/components/TuneAlongPlayer";
import ScrollReveal from "@/components/ScrollReveal";

const ToolsSection = () => {
  const [activeTab, setActiveTab] = useState("tuner");

  return (
    <section id="tools" className="px-6 md:px-12 py-24 md:py-32">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight text-center">
            Musician Tools
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Free tools to help you practice and perfect your sound.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12 h-14">
              <TabsTrigger 
                value="tuner" 
                className="uppercase tracking-wider text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Guitar Tuner
              </TabsTrigger>
              <TabsTrigger 
                value="tune-along" 
                className="uppercase tracking-wider text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Tune Along
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="tuner" className="mt-0">
                <motion.div
                  key="tuner"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <GuitarTuner embedded />
                </motion.div>
              </TabsContent>

              <TabsContent value="tune-along" className="mt-0">
                <motion.div
                  key="tune-along"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
                    Practice along with curated tracks to improve your playing.
                  </p>
                  <TuneAlongPlayer />
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ToolsSection;
