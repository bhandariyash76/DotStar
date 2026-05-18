import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import ShopHeader from "@/components/ShopHeader";
import { collections } from "@/lib/data";
import { cn, staggerDelay } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export default function CollectionsPage() {
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
    <PageLayout>
      <section
        ref={sectionRef}
        className="max-w-[1440px] mx-auto px-6 md:px-10 pt-8 pb-20 md:pb-30"
      >
        <ShopHeader
          overline="Curated"
          title="Collections"
          description="Themed edits of our best pieces — built around mood, season, and style."
        />

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {collections.map((collection, i) => (
            <Link
              key={collection.id}
              to={`/collections/${collection.slug}`}
              className={cn(
                "group relative aspect-[4/5] sm:aspect-[3/4] bg-secondary rounded-2xl overflow-hidden opacity-0 translate-y-8 transition-all duration-700 ease-smooth",
                visible && "opacity-100 translate-y-0"
              )}
              style={{ transitionDelay: staggerDelay(i, 100) }}
            >
              {collection.image?.src && (
                <img
                  src={collection.image.src}
                  alt={collection.image.alt}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <section className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent z-10" />
              <section className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-8">
                <p className="text-overline uppercase text-primary/70 mb-2">
                  {collection.productIds.length} pieces
                </p>
                <h2 className="text-title text-primary group-hover:text-accent-soft transition-colors duration-500">
                  {collection.name}
                </h2>
                <p className="text-caption text-primary/80 mt-2 max-w-sm">
                  {collection.description}
                </p>
              </section>
              {!collection.image?.src?.startsWith("http") && (
                <span className="absolute inset-0 flex items-center justify-center text-8xl font-extralight text-border-strong/40 select-none">
                  {collection.name.charAt(0)}
                </span>
              )}
            </Link>
          ))}
        </section>
      </section>
    </PageLayout>
  );
}
