import type { CartItem } from "@/types/models";

export interface Discount {
  id: string;
  name: string;
  code?: string;
  scope: "cart" | "product" | "collection";
  productId?: string;
  collectionSlug?: string;
  type: "percentage" | "fixed";
  value: number;
  minCartValue: number;
  maxCartValue?: number;
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
}

export interface DiscountsResponse {
  success: boolean;
  discounts: Discount[];
}

export function isDiscountActive(discount: Discount) {
  const now = Date.now();
  if (!discount.isActive) return false;
  if (discount.startsAt && new Date(discount.startsAt).getTime() > now) return false;
  if (discount.endsAt && new Date(discount.endsAt).getTime() < now) return false;
  return true;
}

function getDiscountBase(discount: Discount, items: CartItem[], subtotal: number) {
  if (discount.scope === "cart") return subtotal;

  return items
    .filter((item) => {
      if (discount.scope === "product") return item.productId === discount.productId;
      return item.product.categorySlug === discount.collectionSlug;
    })
    .reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

export function calculateDiscountAmount(discount: Discount, items: CartItem[], subtotal: number) {
  if (!isDiscountActive(discount)) return 0;
  if (subtotal < discount.minCartValue) return 0;
  if (discount.maxCartValue && subtotal > discount.maxCartValue) return 0;

  const base = getDiscountBase(discount, items, subtotal);
  if (base <= 0) return 0;

  return discount.type === "percentage"
    ? Math.min(base, Math.round(base * (discount.value / 100)))
    : Math.min(base, discount.value);
}

export function getBestDiscount(discounts: Discount[], items: CartItem[], subtotal: number) {
  return discounts
    .map((discount) => ({
      discount,
      amount: calculateDiscountAmount(discount, items, subtotal),
    }))
    .sort((a, b) => b.amount - a.amount)[0];
}
