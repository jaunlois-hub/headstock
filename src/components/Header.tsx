import logo from "@/assets/headstock-logo.svg";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex justify-between items-center px-6 md:px-12 py-4 md:py-6">
        <a href="/" className="flex items-center">
          <img src={logo} alt="Headstock Studio" className="h-12 md:h-20 w-auto" />
        </a>
        <nav className="flex gap-6 md:gap-8">
          <a 
            href="#about" 
            className="text-sm uppercase tracking-wider text-foreground/80 hover:text-foreground transition-colors"
          >
            About
          </a>
          <a 
            href="#services" 
            className="text-sm uppercase tracking-wider text-foreground/80 hover:text-foreground transition-colors"
          >
            Services
          </a>
          <a 
            href="#tuner" 
            className="text-sm uppercase tracking-wider text-foreground/80 hover:text-foreground transition-colors"
          >
            Tuner
          </a>
          <a 
            href="#contact" 
            className="text-sm uppercase tracking-wider text-foreground/80 hover:text-foreground transition-colors"
          >
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
