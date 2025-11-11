import logo from "@/assets/headstock-logo.svg";

const Header = () => {
  return (
    <header className="flex justify-between items-center px-4 md:px-12 py-6 md:py-8">
      <div className="flex items-center">
        <img src={logo} alt="Headstock Productions" className="h-8 md:h-10 w-auto" />
      </div>
      <nav className="flex gap-4 md:gap-8">
        <a 
          href="#services" 
          className="text-foreground hover:text-primary transition-colors font-medium"
        >
          Services
        </a>
        <a 
          href="#tuner" 
          className="text-foreground hover:text-primary transition-colors font-medium"
        >
          Tuner
        </a>
        <a 
          href="#submit" 
          className="text-foreground hover:text-primary transition-colors font-medium"
        >
          Submit
        </a>
      </nav>
    </header>
  );
};

export default Header;
