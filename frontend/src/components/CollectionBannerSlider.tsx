"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const BANNER_COLLECTIONS = [
  {
    id: "caps",
    title: "CAPS COLLECTION",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=2000",
    link: "/shop/caps",
  },
  {
    id: "tshirts",
    title: "T-SHIRTS COLLECTION",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=2000",
    link: "/shop/tshirts",
  },
  {
    id: "custom",
    title: "CUSTOM COLLECTION",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=2000",
    link: "/shop/custom",
  },
  {
    id: "jeans",
    title: "JEANS COLLECTION",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=2000",
    link: "/shop/bottoms",
  },
  {
    id: "shirts",
    title: "SHIRTS COLLECTION",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ce3?auto=format&fit=crop&q=80&w=2000",
    link: "/shop/shirts",
  },
];

export default function CollectionBannerSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % BANNER_COLLECTIONS.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden bg-ink" id="collection-banner-slider">
      {/* Slides Container */}
      <div className="absolute inset-0 w-full h-full">
        {BANNER_COLLECTIONS.map((banner, index) => (
          <div
            key={banner.id}
            className={cn(
              "absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out",
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            )}
          >
            {/* Background Image */}
            <div className="absolute inset-0 w-full h-full">
              <img
                src={banner.image}
                alt={banner.title}
                className={cn(
                  "w-full h-full object-cover object-center transition-transform duration-[10000ms] ease-linear",
                  index === currentIndex ? "scale-105" : "scale-100"
                )}
              />
              {/* Dark Overlay for text readability */}
              <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-20">
              <h2
                className={cn(
                  "text-4xl md:text-6xl font-bold text-white tracking-widest uppercase mb-6 transition-all duration-1000 delay-300",
                  index === currentIndex ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}
              >
                {banner.title}
              </h2>
              <Link
                to={banner.link}
                className={cn(
                  "text-white text-sm tracking-[0.2em] uppercase border-b border-white pb-1 hover:text-accent hover:border-accent transition-all duration-300 delay-500",
                  index === currentIndex ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}
              >
                Shop Now
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {BANNER_COLLECTIONS.map((_, index) => (
          <button
            key={`dot-${index}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all duration-300",
              index === currentIndex ? "bg-white scale-125" : "bg-white/40 hover:bg-white/60"
            )}
          />
        ))}
      </div>
    </section>
  );
}
