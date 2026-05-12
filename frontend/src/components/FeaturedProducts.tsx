"use client";

import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { Product } from "@/types/models";
import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface FeaturedProductsProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

export default function FeaturedProducts({
  products,
  title = "New Arrivals",
  subtitle = "Just dropped",
}: FeaturedProductsProps) {
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
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 md:py-30 px-6 md:px-10 max-w-[1440px] mx-auto" id="featured-products-section">
      <div className={cn(
        "flex items-end justify-between mb-12 md:mb-16 opacity-0 translate-y-6 transition-all duration-700 ease-smooth",
        visible && "opacity-100 translate-y-0"
      )}>
        <div>
          <p className="text-overline uppercase text-ink-muted mb-3">{subtitle}</p>
          <h2 className="text-headline text-ink">{title}</h2>
        </div>
        <Link to="/shop" className="btn-ghost hidden md:inline-flex" id="featured-view-all">
          Shop all
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
      <div className="mt-10 text-center md:hidden">
        <Link to="/shop" className="btn-outline" id="featured-mobile-cta">View all products</Link>
      </div>
    </section>
  );
}



