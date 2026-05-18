import { useState } from "react";
import { ProductImage } from "@/types/models";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];

  if (!active) return null;

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      <div className="relative aspect-[3/4] bg-secondary rounded-2xl overflow-hidden">
        <img
          key={active.src}
          src={active.src}
          alt={active.alt || productName}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <>
          <div className="hidden md:flex gap-2">
            {images.map((img, i) => (
              <button
                key={img.src}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`View image ${i + 1}`}
                aria-current={i === activeIndex ? "true" : undefined}
                className={cn(
                  "relative shrink-0 w-20 h-24 rounded-lg overflow-hidden border-2 transition-all duration-300",
                  i === activeIndex
                    ? "border-ink opacity-100"
                    : "border-transparent opacity-60 hover:opacity-90"
                )}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-1.5 md:hidden">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`Go to image ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === activeIndex ? "bg-ink w-4" : "bg-border-strong w-1.5"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
