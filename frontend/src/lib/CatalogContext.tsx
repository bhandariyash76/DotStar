/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import { products as fallbackProducts } from "@/lib/data";
import type { Product } from "@/types/models";

interface ProductsResponse {
  success: boolean;
  products: Product[];
}

interface ProductResponse {
  success: boolean;
  product: Product;
}

interface CatalogContextValue {
  products: Product[];
  loading: boolean;
  refreshProducts: () => Promise<void>;
  getProductBySlug: (slug: string) => Product | undefined;
  getRelatedProducts: (product: Product, limit?: number) => Product[];
  getUniqueCategories: () => { name: string; slug: string }[];
}

const CatalogContext = createContext<CatalogContextValue | undefined>(undefined);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [loading, setLoading] = useState(true);

  const refreshProducts = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<ProductsResponse>("/products");
      setProducts(data.products.length > 0 ? data.products : fallbackProducts);
    } catch {
      setProducts(fallbackProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      refreshProducts();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const value = useMemo<CatalogContextValue>(
    () => ({
      products,
      loading,
      refreshProducts,
      getProductBySlug: (slug) => products.find((product) => product.slug === slug),
      getRelatedProducts: (product, limit = 4) =>
        products
          .filter(
            (item) =>
              item.id !== product.id &&
              (item.categorySlug === product.categorySlug ||
                item.tags.some((tag) => product.tags.includes(tag)))
          )
          .slice(0, limit),
      getUniqueCategories: () => {
        const seen = new Set<string>();
        return products.reduce<{ name: string; slug: string }[]>((acc, product) => {
          if (!seen.has(product.categorySlug)) {
            seen.add(product.categorySlug);
            acc.push({ name: product.category, slug: product.categorySlug });
          }
          return acc;
        }, []);
      },
    }),
    [loading, products]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export async function getProductBySlugFromApi(slug: string) {
  const data = await apiRequest<ProductResponse>(`/products/slug/${slug}`);
  return data.product;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error("useCatalog must be used within CatalogProvider");
  }
  return context;
}
