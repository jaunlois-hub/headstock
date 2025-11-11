const Submit = () => {
  return (
    <section id="submit" className="px-4 md:px-12 py-16 md:py-24">
      <h2 className="text-3xl md:text-4xl font-bold mb-6">Submit your demo</h2>
      <p className="text-lg text-muted-foreground mb-4">
        MP3 only, max 5 MB. We listen to everything.
      </p>

      <div className="space-y-4 text-lg">
        <div>
          <strong className="text-foreground">Email:</strong>{" "}
          <a
            href="mailto:info@headstock.co.za"
            className="text-primary hover:underline transition-colors"
          >
            info@headstock.co.za
          </a>
        </div>

        <div>
          <strong className="text-foreground">CD postal:</strong>{" "}
          <span className="text-muted-foreground">
            Headstock, P.O. Box 572, Senekal, 9600, SA
          </span>
        </div>

        <div>
          <strong className="text-foreground">Call / WhatsApp:</strong>{" "}
          <a
            href="tel:+27638473106"
            className="text-primary hover:underline transition-colors"
          >
            +27 63 847 3106
          </a>
        </div>
      </div>
    </section>
  );
};

export default Submit;
