export const isDiscountActive = (discount, now = new Date()) => {
  if (!discount.isActive) return false;
  if (discount.startsAt && discount.startsAt > now) return false;
  if (discount.endsAt && discount.endsAt < now) return false;
  return true;
};

export const formatDiscount = (discount) => ({
  id: discount._id,
  name: discount.name,
  code: discount.code,
  scope: discount.scope,
  productId: discount.productId,
  collectionSlug: discount.collectionSlug,
  type: discount.type,
  value: discount.value,
  minCartValue: discount.minCartValue || 0,
  maxCartValue: discount.maxCartValue,
  startsAt: discount.startsAt,
  endsAt: discount.endsAt,
  isActive: discount.isActive,
  createdAt: discount.createdAt,
  updatedAt: discount.updatedAt
});

const getLineDiscountBase = (discount, items, subtotal) => {
  if (discount.scope === 'cart') {
    return subtotal;
  }

  const matchedItems = items.filter((item) => {
    if (discount.scope === 'product') {
      return item.productId === discount.productId;
    }

    if (discount.scope === 'collection') {
      return item.productSnapshot?.categorySlug === discount.collectionSlug;
    }

    return false;
  });

  return matchedItems.reduce(
    (sum, item) => sum + item.productSnapshot.price * item.quantity,
    0
  );
};

export const calculateDiscountAmount = (discount, items, subtotal) => {
  if (!isDiscountActive(discount)) return 0;
  if (subtotal < (discount.minCartValue || 0)) return 0;
  if (discount.maxCartValue && subtotal > discount.maxCartValue) return 0;

  const base = getLineDiscountBase(discount, items, subtotal);
  if (base <= 0) return 0;

  if (discount.type === 'percentage') {
    return Math.min(base, Math.round(base * (discount.value / 100)));
  }

  return Math.min(base, discount.value);
};

export const getBestDiscount = (discounts, items, subtotal) => {
  return discounts
    .map((discount) => ({
      discount,
      amount: calculateDiscountAmount(discount, items, subtotal)
    }))
    .sort((a, b) => b.amount - a.amount)[0];
};
