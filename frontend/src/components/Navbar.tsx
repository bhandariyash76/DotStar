"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/data";
import DotStarLogo from './DotStarLogo';
import BrandText from './BrandText';
import ThemeToggle from './ThemeToggle';
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const { itemCount } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* Announcement Bar */}
      {siteConfig.announcementBar && (
        <div className="bg-ink text-primary text-center py-2 overflow-hidden">
          <div className="marquee-track">
            {[...Array(4)].map((_, i) => (
              <span key={i} className="text-overline uppercase whitespace-nowrap mx-12">
                {siteConfig.announcementBar}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Nav — solid surface so brand/links never fade on white pages */}
      <nav
        className={cn(
          "site-nav sticky top-0 z-50 transition-shadow duration-500 ease-smooth",
          scrolled && "shadow-sm"
        )}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link
              to="/"
              className="nav-brand flex items-center gap-2.5 md:-ml-4 group"
              id="nav-logo"
            >
              <DotStarLogo className="w-7 h-auto md:w-8 transition-transform duration-300 group-hover:scale-110" />
              <BrandText size="sm" className="hidden sm:flex shrink-0 !text-inherit" />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-10">
              {siteConfig.navigation.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="nav-link text-caption uppercase tracking-widest transition-colors duration-300 relative group"
                  id={`nav-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-ink transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="nav-link text-caption uppercase tracking-widest transition-colors duration-300 relative group"
                  id="nav-admin"
                >
                  Admin
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-ink transition-all duration-300 group-hover:w-full" />
                </Link>
              )}
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-5">
              <ThemeToggle className="hidden sm:flex" />
              
              {/* Search Icon */}
              <button
                className="nav-icon transition-colors duration-300"
                aria-label="Search"
                id="nav-search"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>

              <Link
                to={user ? "/account" : "/login"}
                className="nav-icon transition-colors duration-300"
                aria-label={user ? "Account" : "Login"}
                id="nav-account"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21a8 8 0 0 0-16 0" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>

              {/* Cart Icon */}
              <Link
                to="/cart"
                className="nav-icon transition-colors duration-300 relative"
                aria-label="Cart"
                id="nav-cart"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-accent text-primary text-[10px] font-medium rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              </Link>

              {/* Mobile Menu Toggle */}
              <div className="flex items-center gap-2 md:hidden">
                <ThemeToggle />
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="nav-icon p-2"
                  aria-label="Toggle menu"
                  id="nav-menu-toggle"
                >
                  <div className="w-6 flex flex-col gap-1.5">
                    <span className={cn(
                      "block h-px bg-current transition-all duration-300 origin-center",
                      mobileOpen && "rotate-45 translate-y-[3.5px]"
                    )} />
                    <span className={cn(
                      "block h-px bg-current transition-all duration-300",
                      mobileOpen && "-rotate-45 -translate-y-[3.5px]"
                    )} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-primary transition-all duration-500 ease-smooth md:hidden flex flex-col",
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        <div className="flex-1 flex flex-col justify-center items-center gap-8 px-6">
          {siteConfig.navigation.map((link, i) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-headline font-light text-ink hover:text-accent transition-colors duration-300"
              style={{ transitionDelay: mobileOpen ? `${i * 80}ms` : "0ms" }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to={user ? "/account" : "/login"}
            onClick={() => setMobileOpen(false)}
            className="text-title font-light text-ink-secondary hover:text-accent transition-colors duration-300"
          >
            {user ? "Account" : "Login"}
          </Link>
          <Link
            to="/cart"
            onClick={() => setMobileOpen(false)}
            className="text-title font-light text-ink-secondary hover:text-accent transition-colors duration-300"
          >
            Cart ({itemCount})
          </Link>
          {user?.role === "admin" && (
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="text-title font-light text-ink-secondary hover:text-accent transition-colors duration-300"
            >
              Admin
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

