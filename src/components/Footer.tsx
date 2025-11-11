const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-center px-4 py-8 text-sm text-muted-foreground">
      © {currentYear} Headstock Productions
    </footer>
  );
};

export default Footer;
