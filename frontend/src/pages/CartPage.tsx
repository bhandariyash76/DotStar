import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import { DiscountsResponse, getBestDiscount } from "@/lib/discounts";
import { formatPrice } from "@/lib/utils";

interface OrderResponse {
  success: boolean;
  order: {
    id: string;
  };
}

export default function CartPage() {
  const { user, token } = useAuth();
  const { items, subtotal, itemCount, updateQuantity, removeItem, clearCart, getOrderPayload } = useCart();
  const navigate = useNavigate();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [discounts, setDiscounts] = useState<DiscountsResponse["discounts"]>([]);
  const [shippingAddress, setShippingAddress] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    street: "",
    apartment: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
    phone: "",
  });

  useEffect(() => {
    apiRequest<DiscountsResponse>("/discounts")
      .then((data) => setDiscounts(data.discounts))
      .catch(() => setDiscounts([]));
  }, []);

  const bestDiscount = getBestDiscount(discounts, items, subtotal);
  const discountAmount = bestDiscount?.amount || 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const shippingCost = discountedSubtotal >= 2999 || discountedSubtotal === 0 ? 0 : 199;
  const tax = Math.round(discountedSubtotal * 0.05);
  const total = discountedSubtotal + shippingCost + tax;

  const handleCheckout = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!user || !token) {
      navigate("/login?redirect=/cart");
      return;
    }

    setPlacing(true);
    try {
      await apiRequest<OrderResponse>("/orders", {
        method: "POST",
        token,
        body: JSON.stringify({
          items: getOrderPayload(),
          shippingAddress,
          paymentMethod: "cod",
        }),
      });
      clearCart();
      navigate("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place order.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <PageLayout>
      <section className="max-w-[1440px] mx-auto px-6 md:px-10 py-12 md:py-20">
        <p className="text-overline uppercase text-ink-muted mb-4">Cart</p>
        <h1 className="text-title md:text-headline text-ink mb-10">Your bag</h1>

        {items.length === 0 ? (
          <div className="border border-border bg-surface p-8 md:p-10 text-center">
            <h2 className="text-xl font-medium text-ink mb-3">Your bag is empty</h2>
            <p className="text-body text-ink-secondary mb-8">Add pieces from the latest drop or shop the full collection.</p>
            <Link to="/shop" className="btn-primary">Shop now</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-10">
            <div className="space-y-4">
              {items.map((item) => (
                <article key={`${item.productId}-${item.selectedSize}-${item.selectedColor.name}`} className="grid grid-cols-[96px_1fr] md:grid-cols-[128px_1fr_auto] gap-4 md:gap-6 border border-border bg-surface p-4">
                  <Link to={`/products/${item.product.slug}`} className="block aspect-[3/4] bg-secondary overflow-hidden">
                    <img src={item.product.images[0]?.src} alt={item.product.name} className="w-full h-full object-cover" />
                  </Link>
                  <div>
                    <Link to={`/products/${item.product.slug}`} className="text-sm md:text-base font-medium text-ink hover:text-accent">
                      {item.product.name}
                    </Link>
                    <p className="text-caption text-ink-muted mt-2">
                      {item.selectedSize} · {item.selectedColor.name}
                    </p>
                    <p className="text-sm text-ink-secondary mt-2">{formatPrice(item.product.price)}</p>
                    <button type="button" onClick={() => removeItem(item.productId, item.selectedSize, item.selectedColor)} className="btn-ghost mt-4">
                      Remove
                    </button>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex md:flex-col items-center md:items-end justify-between gap-4">
                    <div className="flex items-center border border-border">
                      <button type="button" onClick={() => updateQuantity(item.productId, item.selectedSize, item.selectedColor, item.quantity - 1)} className="w-10 h-10 text-ink-secondary hover:text-ink">-</button>
                      <span className="w-10 text-center text-sm">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.productId, item.selectedSize, item.selectedColor, item.quantity + 1)} className="w-10 h-10 text-ink-secondary hover:text-ink">+</button>
                    </div>
                    <p className="text-sm font-medium text-ink">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                </article>
              ))}
            </div>

            <aside className="border border-border bg-surface p-6 md:p-8 h-fit lg:sticky lg:top-28">
              <h2 className="text-lg font-medium text-ink mb-6">Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-ink-secondary">Items</span><span>{itemCount}</span></div>
                <div className="flex justify-between"><span className="text-ink-secondary">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-accent">
                    <span>{bestDiscount.discount.name}</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between"><span className="text-ink-secondary">Shipping</span><span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span></div>
                <div className="flex justify-between"><span className="text-ink-secondary">Tax</span><span>{formatPrice(tax)}</span></div>
                <div className="flex justify-between border-t border-border pt-4 text-base font-medium"><span>Total</span><span>{formatPrice(total)}</span></div>
              </div>

              {!checkoutOpen ? (
                <button type="button" onClick={() => setCheckoutOpen(true)} className="btn-primary w-full mt-8">
                  Checkout
                </button>
              ) : (
                <form onSubmit={handleCheckout} className="mt-8 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {(["firstName", "lastName"] as const).map((field) => (
                      <input key={field} required placeholder={field === "firstName" ? "First name" : "Last name"} value={shippingAddress[field]} onChange={(event) => setShippingAddress({ ...shippingAddress, [field]: event.target.value })} className="border border-border bg-primary px-3 py-2 text-sm outline-none focus:border-ink" />
                    ))}
                  </div>
                  {(["street", "apartment", "city", "state", "zip", "phone"] as const).map((field) => (
                    <input key={field} required={field !== "apartment"} placeholder={field.charAt(0).toUpperCase() + field.slice(1)} value={shippingAddress[field]} onChange={(event) => setShippingAddress({ ...shippingAddress, [field]: event.target.value })} className="w-full border border-border bg-primary px-3 py-2 text-sm outline-none focus:border-ink" />
                  ))}
                  {error && <p className="text-caption text-red-500">{error}</p>}
                  <button type="submit" disabled={placing} className="btn-primary w-full disabled:opacity-60">
                    {user ? placing ? "Placing order" : "Place order" : "Sign in to checkout"}
                  </button>
                </form>
              )}
            </aside>
          </div>
        )}
      </section>
    </PageLayout>
  );
}
