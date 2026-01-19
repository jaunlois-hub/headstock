import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GuitarTuner from "@/components/GuitarTuner";

const ToolsSection = () => {
  const [activeTab, setActiveTab] = useState("tuner");

  return (
    <section id="tools" className="px-6 md:px-12 py-24 md:py-32">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight text-center">
          Musician Tools
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Free tools to help you practice and perfect your sound.
        </p>

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

          <TabsContent value="tuner" className="mt-0">
            <TunerContent />
          </TabsContent>

          <TabsContent value="tune-along" className="mt-0">
            <TuneAlongContent />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

const TunerContent = () => {
  return (
    <div className="animate-fade-in">
      <GuitarTuner embedded />
    </div>
  );
};

const TuneAlongContent = () => {
  return (
    <div className="animate-fade-in">
      <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
        Practice along with your favorite songs using our interactive player.
      </p>
      <div className="w-full aspect-[16/9] rounded-lg overflow-hidden border border-border">
        <iframe
          src="https://preview--tune-along-player.lovable.app"
          className="w-full h-full"
          title="Tune Along Player"
          allow="autoplay"
        />
      </div>
    </div>
  );
};

export default ToolsSection;
