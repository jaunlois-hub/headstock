const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border px-6 py-12 text-center">
      <p className="text-sm text-muted-foreground uppercase tracking-wider">
        © {currentYear} Headstock Studio. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
