const TuneAlongPlayer = () => {
  return (
    <section id="tune-along" className="px-6 md:px-12 py-24 md:py-32 bg-card">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-center">Tune Along Player</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
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
    </section>
  );
};

export default TuneAlongPlayer;
