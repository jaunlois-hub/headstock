import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically send the form data to a backend
    toast({
      title: "Message Sent",
      description: "We'll get back to you soon!",
    });
    
    // Reset form
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section id="contact" className="px-6 md:px-12 py-24 md:py-32 bg-card">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold mb-16 tracking-tight text-center">Get In Touch</h2>
        
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-6">Contact Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-primary font-semibold">WhatsApp:</span>
                <a href="https://wa.me/27604763078" className="text-foreground/80 hover:text-foreground transition-colors">
                  060 476 3078
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-primary font-semibold">Email:</span>
                <a href="mailto:info@headstock.co.za" className="text-foreground/80 hover:text-foreground transition-colors">
                  info@headstock.co.za
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-primary font-semibold">Phone:</span>
                <a href="tel:+27780992341" className="text-foreground/80 hover:text-foreground transition-colors">
                  078 099 2341
                </a>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-semibold mb-6">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground h-12"
              />
              <Input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground h-12"
              />
              <Textarea
                placeholder="Message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-[120px]"
              />
              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 uppercase tracking-wider"
              >
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
