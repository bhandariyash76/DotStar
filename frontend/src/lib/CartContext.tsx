/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import type { CartItem, Product, ProductColor, ProductSize } from "@/types/models";

interface ApiCartItem {
  productId: string;
  productSnapshot: ProductSnapshot;
  quantity: number;
  selectedSize: ProductSize;
  selectedColor: ProductColor;
}

interface ProductSnapshot {
  name: string;
  slug: string;
  price: number;
  categorySlug?: string;
  image: Product["images"][number];
}

interface ApiCartResponse {
  success: boolean;
  cart: {
    items: ApiCartItem[];
    subtotal: number;
    itemCount: number;
  };
}

interface CartContextValue {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  addItem: (product: Product, selectedSize: ProductSize, selectedColor: ProductColor, quantity?: number) => void;
  updateQuantity: (productId: string, selectedSize: ProductSize, selectedColor: ProductColor, quantity: number) => void;
  removeItem: (productId: string, selectedSize: ProductSize, selectedColor: ProductColor) => void;
  clearCart: () => void;
  getOrderPayload: () => ApiCartItem[];
}

const CART_KEY = "dotstar_cart";
const CartContext = createContext<CartContextValue | undefined>(undefined);

const getCartKey = (item: Pick<CartItem, "productId" | "selectedSize" | "selectedColor">) =>
  `${item.productId}:${item.selectedSize}:${item.selectedColor.name}`;

const toApiItems = (items: CartItem[]): ApiCartItem[] =>
  items.map((item) => ({
    productId: item.productId,
    productSnapshot: {
      name: item.product.name,
      slug: item.product.slug,
      price: item.product.price,
      categorySlug: item.product.categorySlug,
      image: item.product.images[0],
    },
    quantity: item.quantity,
    selectedSize: item.selectedSize,
    selectedColor: item.selectedColor,
  }));

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (!token) return;

    async function loadRemoteCart() {
      try {
        const data = await apiRequest<ApiCartResponse>("/cart", { token });
        if (data.cart.items.length === 0) return;

        setItems((current) => {
          const byKey = new Map(current.map((item) => [getCartKey(item), item]));

          data.cart.items.forEach((item) => {
            const key = `${item.productId}:${item.selectedSize}:${item.selectedColor.name}`;
            if (!byKey.has(key)) {
              byKey.set(key, {
                productId: item.productId,
                product: {
                  id: item.productId,
                  name: item.productSnapshot.name,
                  slug: item.productSnapshot.slug,
                  description: "",
                  price: item.productSnapshot.price,
                  currency: "INR",
                  images: [item.productSnapshot.image],
                  category: "",
                  categorySlug: "",
                  sizes: [item.selectedSize],
                  colors: [item.selectedColor],
                  tags: [],
                  inStock: true,
                  isFeatured: false,
                  isNew: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                quantity: item.quantity,
                selectedSize: item.selectedSize,
                selectedColor: item.selectedColor,
              });
            }
          });

          return Array.from(byKey.values());
        });
      } catch {
        // Local cart remains available if the API is offline.
      }
    }

    loadRemoteCart();
  }, [token]);

  useEffect(() => {
    if (!token || !user) return;

    const timer = window.setTimeout(() => {
      apiRequest("/cart", {
        method: "PUT",
        token,
        body: JSON.stringify({ items: toApiItems(items) }),
      }).catch(() => undefined);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [items, token, user]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      subtotal: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      addItem: (product, selectedSize, selectedColor, quantity = 1) => {
        setItems((current) => {
          const incoming: CartItem = {
            productId: product.id,
            product,
            quantity,
            selectedSize,
            selectedColor,
          };
          const key = getCartKey(incoming);
          const exists = current.find((item) => getCartKey(item) === key);

          if (exists) {
            return current.map((item) =>
              getCartKey(item) === key
                ? { ...item, quantity: Math.min(10, item.quantity + quantity) }
                : item
            );
          }

          return [...current, incoming];
        });
      },
      updateQuantity: (productId, selectedSize, selectedColor, quantity) => {
        setItems((current) =>
          current.map((item) =>
            getCartKey(item) === `${productId}:${selectedSize}:${selectedColor.name}`
              ? { ...item, quantity: Math.max(1, Math.min(10, quantity)) }
              : item
          )
        );
      },
      removeItem: (productId, selectedSize, selectedColor) => {
        setItems((current) =>
          current.filter((item) => getCartKey(item) !== `${productId}:${selectedSize}:${selectedColor.name}`)
        );
      },
      clearCart: () => setItems([]),
      getOrderPayload: () => toApiItems(items),
    }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
