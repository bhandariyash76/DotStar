"use client";

import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
/* import Image from "next/image" removed */
import { Product } from "@/types/models";
import { formatPrice, cn, staggerDelay } from "@/lib/utils";

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
        "group opacity-0 translate-y-6 transition-all duration-700 ease-smooth",
        visible && "opacity-100 translate-y-0"
      )}
      style={{ transitionDelay: staggerDelay(index, 120) }}
    >
      <Link to={`/products/${product.slug}`} className="block" id={`product-card-${product.slug}`}>
        {/* Image Container */}
        <div className="img-hover-zoom relative aspect-[4/5] bg-secondary mb-4 overflow-hidden">
          {/* Actual Product Image with zoom effect */}
          <img 
            src={product.images[0]?.src || '/products/tee-1.jpg'} 
            alt={product.images[0]?.alt || product.name} 
           
           
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-110"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.isNew && (
              <span className="text-[10px] uppercase tracking-widest font-medium bg-ink text-primary px-2.5 py-1">
                New
              </span>
            )}
            {hasDiscount && (
              <span className="text-[10px] uppercase tracking-widest font-medium bg-accent text-primary px-2.5 py-1">
                Sale
              </span>
            )}
          </div>

          {/* Quick add overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-smooth z-10">
            <button className="w-full py-2.5 bg-ink/90 backdrop-blur-sm text-primary text-overline uppercase tracking-widest hover:bg-accent transition-colors duration-300">
              Quick Add
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-1.5">
          {/* Color dots */}
          <div className="flex gap-1.5">
            {product.colors.map((color) => (
              <span
                key={color.hex}
                className="w-3 h-3 rounded-full border border-border"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>

          <h3 className="text-body font-normal text-ink group-hover:text-accent transition-colors duration-300 leading-snug">
            {product.name}
          </h3>

          <div className="flex items-center gap-2">
            <span className="text-body font-medium">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-caption text-ink-muted line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}



