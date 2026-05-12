"use client";

import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "@/lib/data";

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const opacity = Math.max(0, 1 - scrollY / 600);
      const translateY = scrollY * 0.3;
      el.style.setProperty("--hero-opacity", String(opacity));
      el.style.setProperty("--hero-translate", `${translateY}px`);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const hero = siteConfig.hero[0];

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100svh] flex items-end pb-16 md:pb-24 overflow-hidden bg-secondary"
      id="hero-section"
    >
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to top, rgba(26,26,26,0.7) 0%, rgba(26,26,26,0.2) 40%, transparent 70%)",
        }}
      />

      {/* Parallax background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/hero/hero-1.jpg')`,
          transform: "translateY(var(--hero-translate, 0px))",
          opacity: "var(--hero-opacity, 1)",
          transition: "none",
        }}
      />

      {/* Abstract geometric pattern */}
      <div className="absolute inset-0 z-[5] opacity-[0.04]">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 border border-ink rounded-full" />
        <div className="absolute bottom-1/3 left-1/6 w-64 h-64 border border-ink" />
        <div className="absolute top-1/2 right-1/3 w-48 h-px bg-ink" />
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-[1440px] mx-auto px-6 md:px-10 w-full">
        <div className="max-w-3xl">
          <p className="text-overline uppercase text-primary/60 mb-6 animate-fade-up">
            {hero.subheading}
          </p>
          <h1
            className="text-display text-primary mb-8 animate-fade-up whitespace-pre-line"
            style={{ animationDelay: "150ms" }}
          >
            {hero.heading}
          </h1>
          <Link
            to={hero.ctaLink}
            className="btn-primary bg-primary text-ink hover:bg-accent hover:text-primary animate-fade-up"
            style={{ animationDelay: "300ms" }}
            id="hero-cta"
          >
            {hero.cta}
            <svg
              className="ml-2 w-4 h-4"
              viewBox="0 0 24 24"
             fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-10 hidden md:flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: "800ms" }}>
          <span className="text-overline text-primary/40 tracking-widest [writing-mode:vertical-rl]">
            Scroll
          </span>
          <div className="w-px h-12 bg-primary/20 relative overflow-hidden">
            <div className="w-full h-4 bg-primary/60 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}



