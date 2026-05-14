"use client";

import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Product } from "@/types/models";
import { formatPrice, cn, staggerDelay } from "@/lib/utils";
import { Bookmark, Plus } from "lucide-react";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div
      ref={cardRef}
      className={cn(
        "group opacity-0 translate-y-6 transition-all duration-700 ease-smooth flex flex-col",
        visible && "opacity-100 translate-y-0"
      )}
      style={{ transitionDelay: staggerDelay(index, 120) }}
    >
      <Link to={`/products/${product.slug}`} className="block relative" id={`product-card-${product.slug}`}>
        {/* Image Container */}
        <div className="relative aspect-[3/4] bg-secondary mb-3 rounded-2xl overflow-hidden">
          {/* Actual Product Image with zoom effect */}
          <img 
            src={product.images[0]?.src || '/products/tee-1.jpg'} 
            alt={product.images[0]?.alt || product.name} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.isNew && (
              <span className="text-[10px] uppercase tracking-widest font-medium bg-white/90 text-ink px-2 py-0.5 rounded-sm backdrop-blur-md">
                New
              </span>
            )}
            {hasDiscount && (
              <span className="text-[10px] uppercase tracking-widest font-medium bg-accent text-white px-2 py-0.5 rounded-sm">
                Sale
              </span>
            )}
          </div>

          {/* Bookmark Icon */}
          <button 
            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-transparent hover:bg-white/20 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              // bookmark logic here
            }}
          >
            <Bookmark className="w-5 h-5 text-white drop-shadow-md" />
          </button>

          {/* Pagination Dots (Visual) */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
          </div>
        </div>

        {/* Details Area */}
        <div className="flex items-start justify-between px-1">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-[13px] font-medium text-ink group-hover:text-accent transition-colors duration-300">
              {product.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-ink-secondary">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-[11px] text-ink-muted line-through">
                  {formatPrice(product.compareAtPrice!)}
                </span>
              )}
            </div>
          </div>
          
          <button 
            className="mt-0.5 w-6 h-6 flex items-center justify-center text-ink-secondary hover:text-ink transition-colors"
            onClick={(e) => {
              e.preventDefault();
              // quick add logic
            }}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </Link>
    </div>
  );
}



