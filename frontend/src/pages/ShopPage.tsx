import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import ShopHeader from "@/components/ShopHeader";
import ProductGrid from "@/components/ProductGrid";
import { cn } from "@/lib/utils";
import { useCatalog } from "@/lib/CatalogContext";

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get("category");
  const { products, getUniqueCategories } = useCatalog();
  const categories = getUniqueCategories();

  const filtered = useMemo(() => {
    if (!categorySlug) return products;
    return products.filter((p) => p.categorySlug === categorySlug);
  }, [categorySlug, products]);

  const activeCategory = categories.find((c) => c.slug === categorySlug);

  const setCategory = (slug: string | null) => {
    if (slug) {
      setSearchParams({ category: slug });
    } else {
      setSearchParams({});
    }
  };

  return (
    <PageLayout>
      <section className="max-w-[1440px] mx-auto px-6 md:px-10 pt-8 pb-20 md:pb-30">
        <ShopHeader
          overline="Shop"
          title={activeCategory ? activeCategory.name : "All products"}
          description={
            activeCategory
              ? `Explore our ${activeCategory.name.toLowerCase()} — minimal streetwear, built to last.`
              : "Every piece in the DotStar catalog. Filter by category or browse the full range."
          }
        />

        <nav
          aria-label="Product categories"
          className="flex flex-wrap gap-2 mb-10 md:mb-14"
        >
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={cn(
              "px-4 py-2 text-caption uppercase tracking-widest border transition-all duration-300",
              !categorySlug
                ? "border-ink bg-ink text-primary"
                : "border-border text-ink-secondary hover:border-ink"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setCategory(cat.slug)}
              className={cn(
                "px-4 py-2 text-caption uppercase tracking-widest border transition-all duration-300",
                categorySlug === cat.slug
                  ? "border-ink bg-ink text-primary"
                  : "border-border text-ink-secondary hover:border-ink"
              )}
            >
              {cat.name}
            </button>
          ))}
        </nav>

        <p className="text-caption text-ink-muted mb-8">
          {filtered.length} {filtered.length === 1 ? "product" : "products"}
        </p>

        <ProductGrid
          products={filtered}
          emptyMessage="No products in this category yet."
        />
      </section>
    </PageLayout>
  );
}
