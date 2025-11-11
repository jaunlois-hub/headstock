import { Card } from "@/components/ui/card";

const services = [
  "Productions",
  "Publications",
  "Digital distribution",
  "Radio plugging",
  "Music videos",
  "Artist designs",
];

const Services = () => {
  return (
    <section id="services" className="px-4 md:px-12 py-16 md:py-24">
      <h2 className="text-3xl md:text-4xl font-bold mb-8">What we do</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {services.map((service) => (
          <Card
            key={service}
            className="bg-card border-border p-6 md:p-8 hover:translate-y-[-4px] transition-transform duration-300 cursor-default"
          >
            <h3 className="text-lg md:text-xl font-medium text-foreground">
              {service}
            </h3>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default Services;
