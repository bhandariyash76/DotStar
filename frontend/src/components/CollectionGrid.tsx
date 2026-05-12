"use client";

import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Collection } from "@/types/models";
import { cn, staggerDelay } from "@/lib/utils";

interface CollectionGridProps {
  collections: Collection[];
}

export default function CollectionGrid({ collections }: CollectionGridProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 md:py-30 px-6 md:px-10 max-w-[1440px] mx-auto" id="collections-section">
      {/* Section Header */}
      <div className={cn(
        "flex items-end justify-between mb-12 md:mb-16 opacity-0 translate-y-6 transition-all duration-700 ease-smooth",
        visible && "opacity-100 translate-y-0"
      )}>
        <div>
          <p className="text-overline uppercase text-ink-muted mb-3">Curated</p>
          <h2 className="text-headline text-ink">Collections</h2>
        </div>
        <Link to="/collections" className="btn-ghost hidden md:inline-flex" id="collections-view-all">
          View all
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Asymmetric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
        {collections.slice(0, 4).map((collection, i) => {
          // Asymmetric layout: first card spans 7 cols, second 5 cols, then swap
          const spanClass = i === 0
            ? "md:col-span-7 md:row-span-2"
            : i === 1
            ? "md:col-span-5"
            : i === 2
            ? "md:col-span-5"
            : "md:col-span-12";

          const heightClass = i === 0
            ? "aspect-[4/5] md:aspect-auto md:h-full"
            : i === 3
            ? "aspect-[21/9]"
            : "aspect-[4/3]";

          return (
            <Link
              key={collection.id}
              to={`/collections/${collection.slug}`}
              className={cn(
                "group relative overflow-hidden bg-secondary opacity-0 translate-y-8 transition-all duration-700 ease-smooth",
                visible && "opacity-100 translate-y-0",
                spanClass,
                heightClass
              )}
              style={{ transitionDelay: staggerDelay(i, 150) }}
              id={`collection-card-${collection.slug}`}
            >
              {/* Placeholder BG */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-8xl font-extralight text-border-strong/50 select-none">
                  {collection.name.charAt(0)}
                </span>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-all duration-500 z-10" />

              {/* Content */}
              <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-8">
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-smooth">
                  <p className="text-overline uppercase text-ink-muted group-hover:text-primary/70 transition-colors duration-500 mb-2">
                    {collection.productIds.length} Pieces
                  </p>
                  <h3 className="text-title text-ink group-hover:text-primary transition-colors duration-500">
                    {collection.name}
                  </h3>
                  <p className="text-caption text-ink-secondary group-hover:text-primary/80 transition-colors duration-500 mt-1 max-w-sm">
                    {collection.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}



