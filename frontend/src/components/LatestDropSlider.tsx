import { Link } from "react-router-dom";
import { formatPrice } from "@/lib/utils";
import { Bookmark, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { useCart } from "@/lib/CartContext";
import { useCatalog } from "@/lib/CatalogContext";

export default function LatestDropSlider() {
  const resumeTimerRef = useRef<number | null>(null);
  const [isMobilePaused, setIsMobilePaused] = useState(false);
  const { addItem } = useCart();
  const { products } = useCatalog();
  const sliderProducts = products.slice(0, 8);
  const marqueeProducts = [...sliderProducts, ...sliderProducts];

  const pauseMobileAutoScroll = () => {
    if (resumeTimerRef.current) {
      window.clearTimeout(resumeTimerRef.current);
    }
    setIsMobilePaused(true);
  };

  const resumeMobileAutoScroll = () => {
    if (resumeTimerRef.current) {
      window.clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = window.setTimeout(() => {
      setIsMobilePaused(false);
    }, 700);
  };

  const ProductSlide = ({
    product,
    suffix,
  }: {
    product: (typeof products)[number];
    suffix: string;
  }) => (
    <article className="flex-shrink-0 w-[78vw] max-w-[280px] md:w-[360px] md:max-w-none snap-start flex flex-col relative rounded-[20px] overflow-hidden bg-white/50 group">
      <Link
        to={`/products/${product.slug}`}
        className="block relative"
        aria-label={`Open ${product.name}`}
        id={`latest-drop-${product.slug}-${suffix}`}
      >
        <div className="relative w-full aspect-[4/5] bg-secondary overflow-hidden">
          <img
            src={product.images[0]?.src || "/products/tee-1.jpg"}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-105"
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex justify-between items-end">
          <div className="flex flex-col text-white pr-10">
            <span className="text-sm font-medium leading-tight">{product.name}</span>
            <span className="text-xs text-white/80 mt-0.5">{formatPrice(product.price)}</span>
          </div>
        </div>
      </Link>

      <button
        type="button"
        aria-label={`Save ${product.name}`}
        className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-transparent hover:bg-white/20 transition-colors"
      >
        <Bookmark className="w-5 h-5 text-white drop-shadow-md" />
      </button>

      <button
        type="button"
        aria-label={`Quick add ${product.name}`}
        onClick={() => addItem(product, product.sizes[0], product.colors[0])}
        className="absolute bottom-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full border border-white/30 text-white hover:bg-white hover:text-ink transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
    </article>
  );

  return (
    <section className="py-16 md:py-24 overflow-hidden bg-bg" id="latest-drop-slider">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 flex items-end justify-between mb-8">
        <h2 className="text-headline text-ink font-semibold">Latest drop</h2>
        <Link to="/shop" className="hidden md:inline-flex btn-outline rounded-full text-[10px] px-6 py-2">
          Discover more
        </Link>
      </div>

      <div className="relative w-full">
        <div
          className="md:hidden overflow-x-auto overflow-y-hidden no-scrollbar touch-pan-x"
          onTouchStart={pauseMobileAutoScroll}
          onTouchEnd={resumeMobileAutoScroll}
          onTouchCancel={resumeMobileAutoScroll}
          onPointerDown={(event) => {
            if (event.pointerType === "touch") pauseMobileAutoScroll();
          }}
          onPointerUp={(event) => {
            if (event.pointerType === "touch") resumeMobileAutoScroll();
          }}
          onPointerCancel={(event) => {
            if (event.pointerType === "touch") resumeMobileAutoScroll();
          }}
        >
          <div
            className={`marquee-track latest-drop-mobile-track flex gap-4 px-6 ${
              isMobilePaused ? "is-paused" : ""
            }`}
          >
            {marqueeProducts.map((product, index) => (
              <ProductSlide key={`${product.id}-${index}`} product={product} suffix={`mobile-${index}`} />
            ))}
          </div>
        </div>

        <div className="hidden md:block overflow-hidden">
          <div className="marquee-track flex gap-4 md:gap-6 px-6 md:px-10">
            {marqueeProducts.map((product, index) => (
              <ProductSlide key={`${product.id}-${index}`} product={product} suffix={`desktop-${index}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
