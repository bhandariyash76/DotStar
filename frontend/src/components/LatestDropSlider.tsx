import { Link } from "react-router-dom";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { Bookmark, Plus } from "lucide-react";

export default function LatestDropSlider() {
  // We need 6-7 cards. We'll duplicate the products array to ensure enough cards for the infinite slider.
  const sliderProducts = [...products, ...products].slice(0, 8);

  return (
    <section className="py-16 md:py-24 overflow-hidden bg-bg" id="latest-drop-slider">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 flex items-end justify-between mb-8">
        <h2 className="text-headline text-ink font-semibold">Latest drop</h2>
        <Link to="/shop" className="btn-outline rounded-full text-[10px] px-6 py-2">
          Discover more
        </Link>
      </div>

      <div className="relative w-full overflow-hidden">
        {/* The marquee-track class has a 30s linear infinite animation */}
        <div className="marquee-track flex gap-4 md:gap-6 px-6 md:px-10 hover:animation-play-state-paused">
          {sliderProducts.map((product, index) => (
            <div
              key={`${product.id}-${index}`}
              className="flex-shrink-0 w-[280px] md:w-[360px] flex flex-col relative rounded-[20px] overflow-hidden bg-white/50 group"
            >
              {/* Product Image Area */}
              <div className="relative w-full aspect-[4/5] bg-secondary overflow-hidden">
                <img
                  src={product.images[0]?.src || '/products/tee-1.jpg'}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-105"
                />
                
                {/* Bookmark Icon */}
                <button className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-transparent hover:bg-white/20 transition-colors">
                  <Bookmark className="w-5 h-5 text-white drop-shadow-md" />
                </button>

                {/* Pagination Dots (Visual only) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
                </div>
              </div>

              {/* Bottom Info Bar */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex justify-between items-end">
                <div className="flex flex-col text-white">
                  <span className="text-sm font-medium leading-tight">{product.name}</span>
                  <span className="text-xs text-white/80 mt-0.5">{formatPrice(product.price)}</span>
                </div>
                
                <button className="w-8 h-8 flex items-center justify-center rounded-full border border-white/30 text-white hover:bg-white hover:text-ink transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {/* Duplicate set for seamless looping */}
          {sliderProducts.map((product, index) => (
            <div
              key={`dup-${product.id}-${index}`}
              className="flex-shrink-0 w-[280px] md:w-[360px] flex flex-col relative rounded-[20px] overflow-hidden bg-white/50 group"
            >
              <div className="relative w-full aspect-[4/5] bg-secondary overflow-hidden">
                <img
                  src={product.images[0]?.src || '/products/tee-1.jpg'}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-105"
                />
                
                <button className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-transparent hover:bg-white/20 transition-colors">
                  <Bookmark className="w-5 h-5 text-white drop-shadow-md" />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex justify-between items-end">
                <div className="flex flex-col text-white">
                  <span className="text-sm font-medium leading-tight">{product.name}</span>
                  <span className="text-xs text-white/80 mt-0.5">{formatPrice(product.price)}</span>
                </div>
                
                <button className="w-8 h-8 flex items-center justify-center rounded-full border border-white/30 text-white hover:bg-white hover:text-ink transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
