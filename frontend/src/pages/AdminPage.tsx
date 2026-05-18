import { FormEvent, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { useCatalog } from "@/lib/CatalogContext";
import { Discount, DiscountsResponse } from "@/lib/discounts";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderStatus, Product } from "@/types/models";

interface OrdersResponse {
  success: boolean;
  orders: Order[];
}

interface ProductResponse {
  success: boolean;
  product: Product;
}

const statusOptions: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  compareAtPrice: "",
  image: "",
  category: "",
  categorySlug: "",
  sizes: "S, M, L, XL",
  colors: "Black:#111111, White:#F8F8F8",
  tags: "",
  inStock: true,
  isFeatured: false,
  isNew: true,
};

const emptyDiscountForm = {
  name: "",
  code: "",
  scope: "cart" as Discount["scope"],
  productId: "",
  collectionSlug: "",
  type: "percentage" as Discount["type"],
  value: "",
  minCartValue: "0",
  maxCartValue: "",
  isActive: true,
};

export default function AdminPage() {
  const { user, token, loading } = useAuth();
  const { products, refreshProducts } = useCatalog();
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [discountForm, setDiscountForm] = useState(emptyDiscountForm);
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token || user?.role !== "admin") return;
    apiRequest<OrdersResponse>("/orders", { token })
      .then((data) => setOrders(data.orders))
      .catch(() => setOrders([]));
    apiRequest<DiscountsResponse>("/discounts/admin", { token })
      .then((data) => setDiscounts(data.discounts))
      .catch(() => setDiscounts([]));
  }, [token, user?.role]);

  if (loading) {
    return (
      <PageLayout>
        <section className="max-w-[1440px] mx-auto px-6 md:px-10 py-20">Loading admin...</section>
      </PageLayout>
    );
  }

  if (!user) return <Navigate to="/login?redirect=/admin" replace />;

  if (user.role !== "admin") {
    return (
      <PageLayout>
        <section className="max-w-[720px] mx-auto px-6 md:px-10 py-20 text-center">
          <p className="text-overline uppercase text-ink-muted mb-4">Admin</p>
          <h1 className="text-headline text-ink mb-4">Access restricted</h1>
          <p className="text-body text-ink-secondary">Only admin accounts can manage products and orders.</p>
        </section>
      </PageLayout>
    );
  }

  const fillForm = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: String(product.price),
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
      image: product.images[0]?.src || "",
      category: product.category,
      categorySlug: product.categorySlug,
      sizes: product.sizes.join(", "),
      colors: product.colors.map((color) => `${color.name}:${color.hex}`).join(", "),
      tags: product.tags.join(", "),
      inStock: product.inStock,
      isFeatured: product.isFeatured,
      isNew: product.isNew,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const productPayload = {
    name: form.name,
    slug: form.slug || undefined,
    description: form.description,
    price: Number(form.price),
    compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
    currency: "INR",
    images: form.image
      ? [{ src: form.image, alt: form.name, width: 800, height: 1000 }]
      : [],
    categoryName: form.category,
    categorySlug: form.categorySlug,
    sizes: form.sizes.split(",").map((size) => size.trim()).filter(Boolean),
    colors: form.colors
      .split(",")
      .map((entry) => {
        const [name, hex] = entry.split(":").map((part) => part.trim());
        return { name, hex };
      })
      .filter((color) => color.name && color.hex),
    tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    inStock: form.inStock,
    isFeatured: form.isFeatured,
    isNew: form.isNew,
    isNewProduct: form.isNew,
  };

  const saveProduct = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setSaving(true);
    setMessage("");

    try {
      await apiRequest<ProductResponse>(editingId ? `/products/${editingId}` : "/products", {
        method: editingId ? "PUT" : "POST",
        token,
        body: JSON.stringify(productPayload),
      });
      await refreshProducts();
      resetForm();
      setMessage(editingId ? "Product updated." : "Product added.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save product.");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!token || !window.confirm("Delete this product?")) return;
    await apiRequest(`/products/${productId}`, { method: "DELETE", token });
    await refreshProducts();
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    if (!token) return;
    await apiRequest(`/orders/${orderId}/status`, {
      method: "PUT",
      token,
      body: JSON.stringify({
        status,
        isDelivered: status === "delivered",
      }),
    });
    const data = await apiRequest<OrdersResponse>("/orders", { token });
    setOrders(data.orders);
  };

  const resetDiscountForm = () => {
    setEditingDiscountId(null);
    setDiscountForm(emptyDiscountForm);
  };

  const saveDiscount = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;

    const payload = {
      ...discountForm,
      code: discountForm.code || undefined,
      productId: discountForm.scope === "product" ? discountForm.productId : undefined,
      collectionSlug: discountForm.scope === "collection" ? discountForm.collectionSlug : undefined,
      value: Number(discountForm.value),
      minCartValue: Number(discountForm.minCartValue || 0),
      maxCartValue: discountForm.maxCartValue ? Number(discountForm.maxCartValue) : undefined,
    };

    await apiRequest(editingDiscountId ? `/discounts/${editingDiscountId}` : "/discounts", {
      method: editingDiscountId ? "PUT" : "POST",
      token,
      body: JSON.stringify(payload),
    });

    const data = await apiRequest<DiscountsResponse>("/discounts/admin", { token });
    setDiscounts(data.discounts);
    resetDiscountForm();
  };

  const editDiscount = (discount: Discount) => {
    setEditingDiscountId(discount.id);
    setDiscountForm({
      name: discount.name,
      code: discount.code || "",
      scope: discount.scope,
      productId: discount.productId || "",
      collectionSlug: discount.collectionSlug || "",
      type: discount.type,
      value: String(discount.value),
      minCartValue: String(discount.minCartValue || 0),
      maxCartValue: discount.maxCartValue ? String(discount.maxCartValue) : "",
      isActive: discount.isActive,
    });
  };

  const deleteDiscount = async (discountId: string) => {
    if (!token || !window.confirm("Delete this discount?")) return;
    await apiRequest(`/discounts/${discountId}`, { method: "DELETE", token });
    setDiscounts((current) => current.filter((discount) => discount.id !== discountId));
  };

  return (
    <PageLayout>
      <section className="max-w-[1440px] mx-auto px-6 md:px-10 py-10 md:py-16">
        <p className="text-overline uppercase text-ink-muted mb-4">Admin</p>
        <h1 className="text-title md:text-headline text-ink mb-10">Store management</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-8">
          <section className="border border-border bg-surface p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-ink">{editingId ? "Edit product" : "Add product"}</h2>
              {editingId && <button type="button" onClick={resetForm} className="btn-ghost">New</button>}
            </div>
            <form onSubmit={saveProduct} className="space-y-4">
              <input required placeholder="Product name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink" />
              <input placeholder="Slug (optional)" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} className="w-full border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink" />
              <textarea required placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="min-h-28 w-full border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink" />
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" placeholder="Price" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink" />
                <input type="number" placeholder="Compare price" value={form.compareAtPrice} onChange={(event) => setForm({ ...form, compareAtPrice: event.target.value })} className="border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink" />
              </div>
              <input required placeholder="Image URL" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} className="w-full border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink" />
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Category name" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink" />
                <input required placeholder="category-slug" value={form.categorySlug} onChange={(event) => setForm({ ...form, categorySlug: event.target.value })} className="border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink" />
              </div>
              <input required placeholder="Sizes: S, M, L" value={form.sizes} onChange={(event) => setForm({ ...form, sizes: event.target.value })} className="w-full border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink" />
              <input required placeholder="Colors: Black:#111111, White:#FFFFFF" value={form.colors} onChange={(event) => setForm({ ...form, colors: event.target.value })} className="w-full border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink" />
              <input placeholder="Tags: tee, oversized" value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} className="w-full border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink" />

              <div className="grid grid-cols-3 gap-3 text-caption uppercase tracking-widest text-ink-secondary">
                {(["inStock", "isFeatured", "isNew"] as const).map((field) => (
                  <label key={field} className="flex items-center gap-2 border border-border px-3 py-3">
                    <input type="checkbox" checked={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.checked })} />
                    {field === "inStock" ? "Stock" : field === "isFeatured" ? "Featured" : "New"}
                  </label>
                ))}
              </div>

              {message && <p className="text-caption text-ink-secondary">{message}</p>}
              <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-60">
                {saving ? "Saving" : editingId ? "Update product" : "Add product"}
              </button>
            </form>
          </section>

          <section className="space-y-8">
            <div className="border border-border bg-surface p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-ink">{editingDiscountId ? "Edit discount" : "Discounts"}</h2>
                {editingDiscountId && <button type="button" onClick={resetDiscountForm} className="btn-ghost">New</button>}
              </div>

              <form onSubmit={saveDiscount} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                <input required placeholder="Discount name" value={discountForm.name} onChange={(event) => setDiscountForm({ ...discountForm, name: event.target.value })} className="border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink" />
                <input placeholder="Code optional" value={discountForm.code} onChange={(event) => setDiscountForm({ ...discountForm, code: event.target.value })} className="border border-border bg-primary px-4 py-3 text-sm uppercase outline-none focus:border-ink" />
                <select value={discountForm.scope} onChange={(event) => setDiscountForm({ ...discountForm, scope: event.target.value as Discount["scope"] })} className="border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink">
                  <option value="cart">Cart value</option>
                  <option value="product">Specific product</option>
                  <option value="collection">Collection/category</option>
                </select>
                <select value={discountForm.type} onChange={(event) => setDiscountForm({ ...discountForm, type: event.target.value as Discount["type"] })} className="border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink">
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed amount</option>
                </select>

                {discountForm.scope === "product" && (
                  <select required value={discountForm.productId} onChange={(event) => setDiscountForm({ ...discountForm, productId: event.target.value })} className="border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink md:col-span-2">
                    <option value="">Choose product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                )}

                {discountForm.scope === "collection" && (
                  <input required placeholder="Collection/category slug, e.g. t-shirts" value={discountForm.collectionSlug} onChange={(event) => setDiscountForm({ ...discountForm, collectionSlug: event.target.value })} className="border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink md:col-span-2" />
                )}

                <input required type="number" placeholder={discountForm.type === "percentage" ? "Discount %" : "Discount amount"} value={discountForm.value} onChange={(event) => setDiscountForm({ ...discountForm, value: event.target.value })} className="border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink" />
                <input type="number" placeholder="Min cart value" value={discountForm.minCartValue} onChange={(event) => setDiscountForm({ ...discountForm, minCartValue: event.target.value })} className="border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink" />
                <input type="number" placeholder="Max cart value" value={discountForm.maxCartValue} onChange={(event) => setDiscountForm({ ...discountForm, maxCartValue: event.target.value })} className="border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink" />
                <label className="flex items-center gap-2 border border-border px-4 py-3 text-caption uppercase tracking-widest text-ink-secondary">
                  <input type="checkbox" checked={discountForm.isActive} onChange={(event) => setDiscountForm({ ...discountForm, isActive: event.target.checked })} />
                  Active
                </label>
                <button type="submit" className="btn-primary md:col-span-2">{editingDiscountId ? "Update discount" : "Add discount"}</button>
              </form>

              <div className="space-y-3">
                {discounts.map((discount) => (
                  <article key={discount.id} className="flex flex-wrap items-center justify-between gap-3 border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-ink">{discount.name}</p>
                      <p className="text-caption text-ink-muted">
                        {discount.scope} · {discount.type === "percentage" ? `${discount.value}%` : formatPrice(discount.value)} · min {formatPrice(discount.minCartValue || 0)}
                        {discount.maxCartValue ? ` · max ${formatPrice(discount.maxCartValue)}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => editDiscount(discount)} className="btn-ghost">Edit</button>
                      <button type="button" onClick={() => deleteDiscount(discount.id)} className="text-caption uppercase tracking-widest text-red-500">Delete</button>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="border border-border bg-surface p-6 md:p-8">
              <h2 className="text-lg font-medium text-ink mb-6">Products</h2>
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {products.map((product) => (
                  <article key={product.id} className="grid grid-cols-[64px_1fr_auto] gap-4 items-center border border-border p-3">
                    <img src={product.images[0]?.src} alt={product.name} className="w-16 h-20 object-cover bg-secondary" />
                    <div>
                      <p className="text-sm font-medium text-ink">{product.name}</p>
                      <p className="text-caption text-ink-muted">{product.category} · {formatPrice(product.price)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => fillForm(product)} className="btn-ghost">Edit</button>
                      <button type="button" onClick={() => deleteProduct(product.id)} className="text-caption uppercase tracking-widest text-red-500">Delete</button>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="border border-border bg-surface p-6 md:p-8">
              <h2 className="text-lg font-medium text-ink mb-6">Orders</h2>
              {orders.length === 0 ? (
                <p className="text-body text-ink-secondary">No orders yet.</p>
              ) : (
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {orders.map((order) => (
                    <article key={order.id} className="border border-border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <div>
                          <p className="text-sm font-medium text-ink">#{order.id.slice(-8)}</p>
                          <p className="text-caption text-ink-muted">{formatPrice(order.total)} · {order.items.length} items</p>
                        </div>
                        <select value={order.status} onChange={(event) => updateOrderStatus(order.id, event.target.value as OrderStatus)} className="border border-border bg-primary px-3 py-2 text-sm outline-none focus:border-ink">
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                      <p className="text-caption text-ink-muted">{new Date(order.createdAt).toLocaleString()}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </PageLayout>
  );
}
