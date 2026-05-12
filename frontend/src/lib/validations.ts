import { z } from "zod";

// ─── Enums & Primitives ────────────────────────────────────────────────────

export const ProductSizeSchema = z.enum(["XS", "S", "M", "L", "XL", "XXL"]);

export const OrderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
]);

// ─── Product ────────────────────────────────────────────────────────────────

export const ProductColorSchema = z.object({
  name: z.string().min(1),
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
});

export const ProductImageSchema = z.object({
  src: z.string().url("Invalid image URL"),
  alt: z.string().min(1, "Alt text is required"),
  width: z.number().positive(),
  height: z.number().positive(),
});

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Product name is required").max(200),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  compareAtPrice: z.number().positive().optional(),
  currency: z.string().length(3, "Currency must be a 3-letter code"),
  images: z.array(ProductImageSchema).min(1, "At least one image is required"),
  category: z.string().min(1),
  categorySlug: z.string().min(1),
  sizes: z.array(ProductSizeSchema).min(1, "At least one size is required"),
  colors: z.array(ProductColorSchema).min(1, "At least one color is required"),
  tags: z.array(z.string()),
  inStock: z.boolean(),
  isFeatured: z.boolean(),
  isNew: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// ─── Category ───────────────────────────────────────────────────────────────

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1),
  description: z.string(),
  image: ProductImageSchema,
  productCount: z.number().int().nonnegative(),
});

// ─── Collection ─────────────────────────────────────────────────────────────

export const CollectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1),
  description: z.string(),
  image: ProductImageSchema,
  productIds: z.array(z.string().uuid()),
});

// ─── Cart ───────────────────────────────────────────────────────────────────

export const CartItemSchema = z.object({
  productId: z.string().uuid(),
  product: ProductSchema,
  quantity: z.number().int().positive().max(10, "Maximum 10 per item"),
  selectedSize: ProductSizeSchema,
  selectedColor: ProductColorSchema,
});

export const CartSchema = z.object({
  items: z.array(CartItemSchema),
  subtotal: z.number().nonnegative(),
  itemCount: z.number().int().nonnegative(),
});

// ─── Address ────────────────────────────────────────────────────────────────

export const AddressSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  street: z.string().min(1, "Street is required").max(200),
  apartment: z.string().max(100).optional(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  zip: z.string().min(3, "ZIP code is required").max(12),
  country: z.string().min(1, "Country is required").max(100),
  phone: z.string().min(7, "Phone number is required").max(20),
  isDefault: z.boolean(),
});

// ─── User ───────────────────────────────────────────────────────────────────

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  avatar: z.string().url().optional(),
  addresses: z.array(AddressSchema),
  createdAt: z.string().datetime(),
});

// ─── Order ──────────────────────────────────────────────────────────────────

export const OrderItemSchema = z.object({
  productId: z.string().uuid(),
  name: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  size: ProductSizeSchema,
  color: ProductColorSchema,
  image: ProductImageSchema,
});

export const OrderSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  items: z.array(OrderItemSchema).min(1),
  status: OrderStatusSchema,
  subtotal: z.number().nonnegative(),
  shippingCost: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  total: z.number().positive(),
  shippingAddress: AddressSchema,
  trackingNumber: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// ─── Review ─────────────────────────────────────────────────────────────────

export const ReviewSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  userId: z.string().uuid(),
  userName: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(200),
  comment: z.string().min(1).max(2000),
  createdAt: z.string().datetime(),
});

// ─── Form Schemas ───────────────────────────────────────────────────────────

export const ContactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().min(3, "Subject is required").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
});

export const NewsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const CheckoutSchema = z.object({
  shippingAddress: AddressSchema.omit({ id: true, isDefault: true }),
  billingAddress: AddressSchema.omit({ id: true, isDefault: true }).optional(),
  sameAsBilling: z.boolean(),
  paymentMethod: z.enum(["card", "upi", "cod"]),
  notes: z.string().max(500).optional(),
});

export const SearchQuerySchema = z.object({
  query: z.string().min(1).max(200).trim(),
  category: z.string().optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().positive().optional(),
  sizes: z.array(ProductSizeSchema).optional(),
  sortBy: z.enum(["newest", "price-asc", "price-desc", "popular"]).optional(),
});

// ─── Inferred Types ─────────────────────────────────────────────────────────

export type ContactFormData = z.infer<typeof ContactFormSchema>;
export type NewsletterData = z.infer<typeof NewsletterSchema>;
export type CheckoutData = z.infer<typeof CheckoutSchema>;
export type SearchQueryData = z.infer<typeof SearchQuerySchema>;
