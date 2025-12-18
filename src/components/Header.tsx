import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/headstock-logo.svg";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#tuner", label: "Tuner" },
    { href: "#tune-in-motion", label: "Online Tuner" },
    { href: "#tune-along", label: "Tune Along" },
    { href: "#contact", label: "Contact" },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    
    const target = document.querySelector(href);
    if (target) {
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex justify-between items-center px-4 md:px-12 py-3 md:py-6">
        <a href="/" className="flex items-center flex-shrink-0">
          <img src={logo} alt="Headstock Studio" className="h-16 md:h-20 w-auto max-w-[200px] md:max-w-none" />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 md:gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="text-sm uppercase tracking-wider text-foreground/80 hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger className="md:hidden">
            <Menu className="h-6 w-6 text-foreground" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] bg-background border-border">
            <nav className="flex flex-col gap-6 mt-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="text-lg uppercase tracking-wider text-foreground/80 hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
