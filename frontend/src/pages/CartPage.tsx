import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import { DiscountsResponse, getBestDiscount } from "@/lib/discounts";
import { formatPrice } from "@/lib/utils";
import { Address } from "@/types/models";

interface OrderResponse {
  success: boolean;
  order: {
    id: string;
  };
}

export default function CartPage() {
  const { user, token, updateProfile } = useAuth();
  const { items, subtotal, itemCount, updateQuantity, removeItem, clearCart, getOrderPayload } = useCart();
  const navigate = useNavigate();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"address" | "summary">("address");
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

  const [selectedAddressMode, setSelectedAddressMode] = useState<"saved" | "new">(user?.addresses && user.addresses.length > 0 ? "saved" : "new");
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string>("");
  const [saveNewAddress, setSaveNewAddress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const handleOpenCheckout = () => {
    setCheckoutOpen(true);
    setCheckoutStep("address");
    if (user?.addresses && user.addresses.length > 0) {
      setSelectedAddressMode("saved");
      const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setSelectedSavedAddressId(def.id);
      setShippingAddress({
        firstName: def.firstName,
        lastName: def.lastName,
        street: def.street,
        apartment: def.apartment || "",
        city: def.city,
        state: def.state,
        zip: def.zip,
        country: def.country || "India",
        phone: def.phone,
      });
    } else {
      setSelectedAddressMode("new");
      setShippingAddress((prev) => ({
        ...prev,
        firstName: user?.firstName || prev.firstName,
        lastName: user?.lastName || prev.lastName,
      }));
    }
  };

  const handleSelectSavedAddress = (addr: Address) => {
    setSelectedSavedAddressId(addr.id);
    setShippingAddress({
      firstName: addr.firstName,
      lastName: addr.lastName,
      street: addr.street,
      apartment: addr.apartment || "",
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: addr.country || "India",
      phone: addr.phone,
    });
  };

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

  const handleProceedToSummary = (event: FormEvent) => {
    event.preventDefault();
    if (!shippingAddress.firstName || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zip || !shippingAddress.phone) {
      setError("Please fill in all required shipping address fields.");
      return;
    }
    setError("");
    setCheckoutStep("summary");
  };

  const handleCheckout = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!user || !token) {
      navigate("/login?redirect=/cart");
      return;
    }

    setPlacing(true);
    try {
      if (selectedAddressMode === "new" && saveNewAddress && updateProfile) {
        const newAddrObj = {
          ...shippingAddress,
          id: `addr_${Date.now()}`,
          isDefault: !user.addresses || user.addresses.length === 0,
        };
        await updateProfile({ addresses: [...(user.addresses || []), newAddrObj] });
      }

      await apiRequest<OrderResponse>("/orders", {
        method: "POST",
        token,
        body: JSON.stringify({
          items: getOrderPayload(),
          shippingAddress,
          paymentMethod,
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
                <button type="button" onClick={handleOpenCheckout} className="btn-primary w-full mt-8">
                  Checkout
                </button>
              ) : checkoutStep === "summary" ? (
                <form onSubmit={handleCheckout} className="mt-8 space-y-6 pt-4 border-t border-border">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-ink">Order Summary & Payment</h3>
                    <button type="button" onClick={() => setCheckoutStep("address")} className="text-caption uppercase tracking-widest text-ink-muted hover:text-ink font-bold">
                      ← Edit Address
                    </button>
                  </div>

                  {/* Shipping Address Summary */}
                  <div className="p-4 border border-border bg-surface rounded-lg space-y-1 text-xs">
                    <p className="font-bold uppercase tracking-wider text-ink text-caption">Delivering To:</p>
                    <p className="font-bold text-ink text-sm">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                    <p className="text-ink-secondary">{shippingAddress.street} {shippingAddress.apartment ? `, ${shippingAddress.apartment}` : ""}</p>
                    <p className="text-ink-secondary">{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}</p>
                    <p className="text-ink-muted mt-1">Phone: {shippingAddress.phone}</p>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="space-y-3">
                    <span className="text-caption uppercase tracking-widest text-ink-muted block font-bold">Select Payment Method</span>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`p-3 border rounded-lg flex items-center gap-2 cursor-pointer transition-all ${paymentMethod === "cod" ? "border-ink bg-surface font-bold ring-1 ring-ink" : "border-border bg-primary opacity-80"}`}>
                        <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="accent-ink" />
                        <span className="text-xs uppercase tracking-wider">Cash on Delivery</span>
                      </label>
                      <label className={`p-3 border rounded-lg flex items-center gap-2 cursor-pointer transition-all ${paymentMethod === "online" ? "border-ink bg-surface font-bold ring-1 ring-ink" : "border-border bg-primary opacity-80"}`}>
                        <input type="radio" name="paymentMethod" value="online" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} className="accent-ink" />
                        <span className="text-xs uppercase tracking-wider">Online Payment</span>
                      </label>
                    </div>
                  </div>

                  {/* Price Summary Breakdown */}
                  <div className="p-4 border border-border bg-surface rounded-lg space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-ink-secondary">Subtotal ({itemCount} items)</span><span>{formatPrice(subtotal)}</span></div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-accent font-medium"><span>Discount ({bestDiscount?.discount.name})</span><span>-{formatPrice(discountAmount)}</span></div>
                    )}
                    <div className="flex justify-between"><span className="text-ink-secondary">Shipping</span><span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span></div>
                    <div className="flex justify-between"><span className="text-ink-secondary">Estimated Tax (5%)</span><span>{formatPrice(tax)}</span></div>
                    <div className="flex justify-between border-t border-border pt-2 text-sm font-bold text-ink"><span>Total Amount</span><span>{formatPrice(total)}</span></div>
                  </div>

                  {error && <p className="text-caption text-red-50" >{error}</p>}

                  <button type="submit" disabled={placing} className="btn-primary w-full text-xs py-3.5 disabled:opacity-60">
                    {placing ? "Processing Order..." : `Confirm & Place Order (${formatPrice(total)})`}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleProceedToSummary} className="mt-8 space-y-6 pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-ink">Shipping Address</h3>

                  {user?.addresses && user.addresses.length > 0 && (
                    <div className="flex gap-4 border-b border-border pb-3 text-xs uppercase tracking-widest font-medium">
                      <button
                        type="button"
                        onClick={() => setSelectedAddressMode("saved")}
                        className={`pb-2 border-b-2 transition-colors ${
                          selectedAddressMode === "saved" ? "border-ink text-ink font-bold" : "border-transparent text-ink-muted hover:text-ink"
                        }`}
                      >
                        Saved Addresses ({user.addresses.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedAddressMode("new")}
                        className={`pb-2 border-b-2 transition-colors ${
                          selectedAddressMode === "new" ? "border-ink text-ink font-bold" : "border-transparent text-ink-muted hover:text-ink"
                        }`}
                      >
                        + Add New Address
                      </button>
                    </div>
                  )}

                  {selectedAddressMode === "saved" && user?.addresses && user.addresses.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {user.addresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`p-4 border cursor-pointer transition-all rounded-lg flex items-start gap-3 ${
                            selectedSavedAddressId === addr.id ? "border-ink bg-surface shadow-sm ring-1 ring-ink" : "border-border bg-primary opacity-80 hover:opacity-100"
                          }`}
                        >
                          <input type="radio" name="savedAddress" checked={selectedSavedAddressId === addr.id} readOnly className="mt-1 accent-ink w-4 h-4" />
                          <div className="flex-1 text-sm">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-bold text-ink">{addr.firstName} {addr.lastName}</span>
                              {addr.isDefault && <span className="text-[10px] uppercase tracking-widest font-bold bg-ink text-primary px-2 py-0.5 rounded">Default</span>}
                            </div>
                            <p className="text-caption text-ink-secondary">{addr.street} {addr.apartment ? `, ${addr.apartment}` : ""}</p>
                            <p className="text-caption text-ink-secondary">{addr.city}, {addr.state} {addr.zip}</p>
                            <p className="text-caption text-ink-muted mt-1">Phone: {addr.phone}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {(["firstName", "lastName"] as const).map((field) => (
                          <input key={field} required placeholder={field === "firstName" ? "First name" : "Last name"} value={shippingAddress[field]} onChange={(event) => setShippingAddress({ ...shippingAddress, [field]: event.target.value })} className="border border-border bg-primary px-3 py-2 text-sm outline-none focus:border-ink" />
                        ))}
                      </div>
                      {(["street", "apartment", "city", "state", "zip", "phone"] as const).map((field) => (
                        <input key={field} required={field !== "apartment"} placeholder={field.charAt(0).toUpperCase() + field.slice(1)} value={shippingAddress[field]} onChange={(event) => setShippingAddress({ ...shippingAddress, [field]: event.target.value })} className="w-full border border-border bg-primary px-3 py-2 text-sm outline-none focus:border-ink" />
                      ))}

                      {user && (
                        <label className="flex items-center gap-2 text-xs font-medium text-ink cursor-pointer pt-1">
                          <input type="checkbox" checked={saveNewAddress} onChange={(e) => setSaveNewAddress(e.target.checked)} className="accent-ink w-4 h-4" />
                          Save this address to my profile for future orders
                        </label>
                      )}
                    </div>
                  )}

                  {error && <p className="text-caption text-red-500">{error}</p>}
                  <button type="submit" className="btn-primary w-full text-xs py-3.5">
                    {user ? "Continue to Order Summary & Payment ➔" : "Sign in to checkout"}
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
