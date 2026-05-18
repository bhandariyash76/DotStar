import PageLayout from "@/components/PageLayout";
import ShopHeader from "@/components/ShopHeader";
import ProductGrid from "@/components/ProductGrid";
import { getNewProducts } from "@/lib/data";

export default function NewArrivalsPage() {
  const newProducts = getNewProducts();

  return (
    <PageLayout>
      <section className="max-w-[1440px] mx-auto px-6 md:px-10 pt-8 pb-20 md:pb-30">
        <ShopHeader
          overline="Just dropped"
          title="New arrivals"
          description="The latest pieces from DotStar — first to know, first to wear."
        />
        <ProductGrid
          products={newProducts}
          emptyMessage="No new arrivals right now. Check back soon."
        />
      </section>
    </PageLayout>
  );
}
