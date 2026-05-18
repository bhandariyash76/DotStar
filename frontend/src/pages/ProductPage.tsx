import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Minus, Plus, Truck, RotateCcw, Shield } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductGallery from "@/components/ProductGallery";
import ProductGrid from "@/components/ProductGrid";
import { formatPrice, cn } from "@/lib/utils";
import type { ProductColor, ProductSize } from "@/types/models";
import { useCart } from "@/lib/CartContext";
import { useCatalog } from "@/lib/CatalogContext";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { getProductBySlug, getRelatedProducts } = useCatalog();
  const product = slug ? getProductBySlug(slug) : undefined;

  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  if (!product) {
    return (
      <PageLayout>
        <section className="py-30 px-6 md:px-10 max-w-[1440px] mx-auto text-center">
          <p className="text-overline uppercase text-ink-muted mb-4">404</p>
          <h1 className="text-headline text-ink mb-6">Product not found</h1>
          <p className="text-body text-ink-secondary mb-10 max-w-md mx-auto">
            This piece may have sold out or the link is incorrect.
          </p>
          <Link to="/shop" className="btn-primary">
            Back to shop
          </Link>
        </section>
      </PageLayout>
    );
  }

  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const related = getRelatedProducts(product);
  const color = selectedColor ?? product.colors[0];
  const size = selectedSize ?? product.sizes[0];

  const handleAddToBag = () => {
    addItem(product, size, color, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <PageLayout>
      <article className="max-w-[1440px] mx-auto px-6 md:px-10 pt-6 pb-20 md:pb-30">
        <Breadcrumbs
          className="mb-8 md:mb-12"
          items={[
            { label: "Shop", href: "/shop" },
            { label: product.category, href: `/shop?category=${product.categorySlug}` },
            { label: product.name },
          ]}
        />

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-20">
          <ProductGallery images={product.images} productName={product.name} />

          <section className="lg:sticky lg:top-28 lg:self-start flex flex-col">
            <div className="flex flex-wrap gap-2 mb-4 items-center">
              {(!product.inStock || product.quantity === 0) ? (
                <span className="text-[10px] uppercase tracking-widest font-medium bg-red-500 text-white px-2.5 py-1 rounded-sm shadow-md">
                  Out of Stock
                </span>
              ) : (
                <>
                  {product.isNew && (
                    <span className="text-[10px] uppercase tracking-widest font-medium bg-secondary text-ink px-2.5 py-1 rounded-sm">
                      New
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="text-[10px] uppercase tracking-widest font-medium bg-accent text-white px-2.5 py-1 rounded-sm">
                      Sale
                    </span>
                  )}
                </>
              )}
              <Link
                to={`/shop?category=${product.categorySlug}`}
                className="text-[10px] uppercase tracking-widest font-medium text-ink-muted hover:text-accent transition-colors"
              >
                {product.category}
              </Link>
            </div>

            <h1 className="text-title md:text-headline text-ink mb-4">{product.name}</h1>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-lg font-medium text-ink">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-body text-ink-muted line-through">
                  {formatPrice(product.compareAtPrice!)}
                </span>
              )}
            </div>

            <p className="text-body text-ink-secondary mb-8 leading-relaxed">
              {product.description}
            </p>

            {product.colors.length > 0 && (
              <fieldset className="mb-6 border-0 p-0">
                <legend className="text-overline uppercase text-ink-muted mb-3">
                  Color — {color?.name}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      aria-label={c.name}
                      aria-pressed={color?.name === c.name}
                      className={cn(
                        "w-9 h-9 rounded-full border-2 transition-all duration-300",
                        color?.name === c.name
                          ? "border-ink scale-110"
                          : "border-border hover:border-ink-muted"
                      )}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </fieldset>
            )}

            {product.sizes.length > 0 && (
              <fieldset className="mb-8 border-0 p-0">
                <legend className="text-overline uppercase text-ink-muted mb-3">
                  Size
                </legend>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      aria-pressed={size === s}
                      className={cn(
                        "min-w-[3rem] px-4 py-2.5 text-caption uppercase tracking-wider border transition-all duration-300",
                        size === s
                          ? "border-ink bg-ink text-primary"
                          : "border-border text-ink-secondary hover:border-ink"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <section className="flex items-stretch gap-3 mb-4">
              <div className="flex items-center border border-border">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-11 h-12 flex items-center justify-center text-ink-secondary hover:text-ink transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-caption font-medium">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-11 h-12 flex items-center justify-center text-ink-secondary hover:text-ink transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={handleAddToBag}
                disabled={!product.inStock || product.quantity === 0}
                className={cn(
                  "flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed",
                  added && "bg-accent hover:bg-accent"
                )}
              >
                {added ? "Added to bag" : (!product.inStock || product.quantity === 0) ? "Out of stock" : "Add to bag"}
              </button>
            </section>

            <p className="text-caption text-ink-muted mb-10">
              Free shipping on orders above ₹2,999
            </p>

            <ul className="space-y-4 pt-8 border-t border-border">
              {[
                { icon: Truck, text: "Ships in 2–4 business days across India" },
                { icon: RotateCcw, text: "Easy 14-day returns on unworn items" },
                { icon: Shield, text: "Secure checkout & quality guarantee" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-caption text-ink-secondary">
                  <Icon className="w-4 h-4 text-ink-muted shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </section>
        </section>

        {related.length > 0 && (
          <section className="mt-20 md:mt-30 pt-16 border-t border-border">
            <p className="text-overline uppercase text-ink-muted mb-3">You may also like</p>
            <h2 className="text-headline text-ink mb-10 md:mb-14">Related pieces</h2>
            <ProductGrid products={related} />
          </section>
        )}
      </article>
    </PageLayout>
  );
}
