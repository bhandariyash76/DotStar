"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section ref={sectionRef} className="py-20 md:py-30 bg-ink text-primary" id="newsletter-section">
      <div className={cn(
        "max-w-[1440px] mx-auto px-6 md:px-10 text-center opacity-0 translate-y-6 transition-all duration-700 ease-smooth",
        visible && "opacity-100 translate-y-0"
      )}>
        <p className="text-overline uppercase text-primary/40 mb-4">Stay in the loop</p>
        <h2 className="text-headline text-primary mb-4">
          {submitted ? "You\u2019re in." : "Join the list."}
        </h2>
        <p className="text-body text-primary/60 max-w-md mx-auto mb-10">
          {submitted
            ? "We\u2019ll keep you posted on new drops, restocks, and exclusive early access."
            : "Early access to drops, restocks, and things we don\u2019t share anywhere else."}
        </p>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-5 py-3 bg-transparent border border-primary/20 text-primary text-body placeholder:text-primary/30 focus:border-accent focus:outline-none transition-colors duration-300"
              id="newsletter-email"
            />
            <button type="submit" className="px-8 py-3 bg-primary text-ink text-caption uppercase tracking-widest hover:bg-accent hover:text-primary transition-all duration-300" id="newsletter-submit">
              Subscribe
            </button>
          </form>
        ) : (
          <div className="animate-fade-up">
            <svg className="w-10 h-10 mx-auto text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
        )}
      </div>
    </section>
  );
}



