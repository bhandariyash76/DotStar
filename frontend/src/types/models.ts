// ─── Product ────────────────────────────────────────────────────────────────

export type ProductSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  images: ProductImage[];
  category: string;
  categorySlug: string;
  sizes: ProductSize[];
  colors: ProductColor[];
  tags: string[];
  inStock: boolean;
  isFeatured: boolean;
  isNew: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Category ───────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: ProductImage;
  productCount: number;
}

// ─── Collection ─────────────────────────────────────────────────────────────

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: ProductImage;
  productIds: string[];
}

// ─── Cart ───────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedSize: ProductSize;
  selectedColor: ProductColor;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

// ─── User ───────────────────────────────────────────────────────────────────

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  addresses: Address[];
  createdAt: string;
}

// ─── Order ──────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: ProductSize;
  color: ProductColor;
  image: ProductImage;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingAddress: Address;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Review ─────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

// ─── Site Config ────────────────────────────────────────────────────────────

export interface NavLink {
  label: string;
  href: string;
}

export interface HeroSlide {
  heading: string;
  subheading: string;
  cta: string;
  ctaLink: string;
  image: ProductImage;
}

export interface SiteConfig {
  name: string;
  description: string;
  navigation: NavLink[];
  hero: HeroSlide[];
  featuredCollectionIds: string[];
  announcementBar?: string;
}
