import { Link } from "react-router-dom";
import { siteConfig } from "@/lib/data";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-secondary border-t border-border" id="site-footer">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
        {/* Main Grid */}
        <div className="py-16 md:py-20 grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-xl font-semibold tracking-[0.15em] uppercase">
              {siteConfig.name}
            </Link>
            <p className="text-caption text-ink-secondary mt-4 max-w-xs leading-relaxed">
              {siteConfig.description}
            </p>
            <div className="flex gap-4 mt-6">
              {["Instagram", "Twitter"].map((social) => (
                <a key={social} href="#" className="text-ink-muted hover:text-accent transition-colors duration-300" aria-label={social}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="5" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-overline uppercase text-ink-muted mb-5">Shop</h4>
            <ul className="space-y-3">
              {["New Arrivals", "T-Shirts", "Bottoms", "Hoodies", "Outerwear"].map((item) => (
                <li key={item}>
                  <Link to={`/shop/${item.toLowerCase().replace(/\s/g, "-")}`} className="text-caption text-ink-secondary hover:text-ink transition-colors duration-300">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-overline uppercase text-ink-muted mb-5">Company</h4>
            <ul className="space-y-3">
              {["About", "Stores", "Careers", "Press"].map((item) => (
                <li key={item}>
                  <Link to={`/${item.toLowerCase()}`} className="text-caption text-ink-secondary hover:text-ink transition-colors duration-300">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-overline uppercase text-ink-muted mb-5">Help</h4>
            <ul className="space-y-3">
              {["Contact", "Shipping", "Returns", "Track Order", "FAQ"].map((item) => (
                <li key={item}>
                  <Link to={`/help/${item.toLowerCase().replace(/\s/g, "-")}`} className="text-caption text-ink-secondary hover:text-ink transition-colors duration-300">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-caption text-ink-muted">
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms"].map((item) => (
              <Link key={item} to={`/${item.toLowerCase()}`} className="text-caption text-ink-muted hover:text-ink transition-colors duration-300">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}



