const Footer = () => (
  <footer className="bg-bg-surface border-t border-border py-6 shrink-0">
    <div className="max-w-screen-2xl mx-auto px-6 flex flex-col items-center gap-1">
      <span className="text-accent font-bold text-sm">TradeInSec</span>
      <span className="text-text-muted text-xs">© {new Date().getFullYear()} TradeInSec. All rights reserved.</span>
    </div>
  </footer>
);

export default Footer;
