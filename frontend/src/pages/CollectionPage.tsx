import { Link, useParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductGrid from "@/components/ProductGrid";
import { getCollectionBySlug, getProductsForCollection } from "@/lib/data";

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const collection = slug ? getCollectionBySlug(slug) : undefined;

  if (!collection) {
    return (
      <PageLayout>
        <section className="py-30 px-6 md:px-10 max-w-[1440px] mx-auto text-center">
          <p className="text-overline uppercase text-ink-muted mb-4">404</p>
          <h1 className="text-headline text-ink mb-6">Collection not found</h1>
          <Link to="/collections" className="btn-primary">
            View all collections
          </Link>
        </section>
      </PageLayout>
    );
  }

  const collectionProducts = getProductsForCollection(collection);

  return (
    <PageLayout>
      <section className="max-w-[1440px] mx-auto px-6 md:px-10 pt-6 pb-20 md:pb-30">
        <Breadcrumbs
          className="mb-8"
          items={[
            { label: "Collections", href: "/collections" },
            { label: collection.name },
          ]}
        />

        <header className="relative mb-12 md:mb-16 rounded-2xl overflow-hidden bg-secondary min-h-[220px] md:min-h-[320px] flex items-end">
          {collection.image?.src && (
            <img
              src={collection.image.src}
              alt={collection.image.alt}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <section className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-ink/10" />
          <section className="relative z-10 p-6 md:p-10 w-full">
            <p className="text-overline uppercase text-primary/70 mb-2">
              {collectionProducts.length} pieces
            </p>
            <h1 className="text-headline text-primary">{collection.name}</h1>
            <p className="text-body text-primary/85 mt-3 max-w-lg">
              {collection.description}
            </p>
          </section>
        </header>

        <ProductGrid
          products={collectionProducts}
          emptyMessage="This collection is being restocked."
        />
      </section>
    </PageLayout>
  );
}
