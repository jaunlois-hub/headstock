const TuneInMotion = () => {
  return (
    <section id="tuner-app" className="px-6 md:px-12 py-24 md:py-32">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-center">Online Tuner</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Use our online guitar tuner to keep your instrument in perfect pitch.
        </p>
        <div className="w-full aspect-[16/9] rounded-lg overflow-hidden border border-border">
          <iframe
            src="https://tune-in-motion.lovable.app"
            className="w-full h-full"
            title="Guitar Tuner"
            allow="microphone"
          />
        </div>
      </div>
    </section>
  );
};

export default TuneInMotion;
