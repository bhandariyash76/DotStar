import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { formatPrice } from "@/lib/utils";
import type { Address, Order } from "@/types/models";

interface OrdersResponse {
  success: boolean;
  orders: Order[];
}

const pincodeMap: Record<string, { city: string; state: string }> = {
  "400": { city: "Mumbai", state: "Maharashtra" },
  "401": { city: "Thane", state: "Maharashtra" },
  "411": { city: "Pune", state: "Maharashtra" },
  "440": { city: "Nagpur", state: "Maharashtra" },
  "422": { city: "Nashik", state: "Maharashtra" },
  "110": { city: "New Delhi", state: "Delhi" },
  "122": { city: "Gurugram", state: "Haryana" },
  "201": { city: "Noida", state: "Uttar Pradesh" },
  "560": { city: "Bengaluru", state: "Karnataka" },
  "570": { city: "Mysuru", state: "Karnataka" },
  "600": { city: "Chennai", state: "Tamil Nadu" },
  "641": { city: "Coimbatore", state: "Tamil Nadu" },
  "700": { city: "Kolkata", state: "West Bengal" },
  "500": { city: "Hyderabad", state: "Telangana" },
  "530": { city: "Visakhapatnam", state: "Andhra Pradesh" },
  "380": { city: "Ahmedabad", state: "Gujarat" },
  "390": { city: "Vadodara", state: "Gujarat" },
  "395": { city: "Surat", state: "Gujarat" },
  "302": { city: "Jaipur", state: "Rajasthan" },
  "342": { city: "Jodhpur", state: "Rajasthan" },
  "226": { city: "Lucknow", state: "Uttar Pradesh" },
  "208": { city: "Kanpur", state: "Uttar Pradesh" },
  "452": { city: "Indore", state: "Madhya Pradesh" },
  "462": { city: "Bhopal", state: "Madhya Pradesh" },
  "800": { city: "Patna", state: "Bihar" },
  "160": { city: "Chandigarh", state: "Punjab" },
  "141": { city: "Ludhiana", state: "Punjab" },
  "682": { city: "Kochi", state: "Kerala" },
  "695": { city: "Thiruvananthapuram", state: "Kerala" },
  "781": { city: "Guwahati", state: "Assam" },
  "751": { city: "Bhubaneswar", state: "Odisha" },
};

function lookupPincode(pincode: string): { city: string; state: string } | null {
  const clean = pincode.replace(/\D/g, "");
  if (clean.length >= 3) {
    const prefix = clean.slice(0, 3);
    if (pincodeMap[prefix]) {
      return pincodeMap[prefix];
    }
  }
  return null;
}

const emptyAddress: Address = {
  id: "",
  firstName: "",
  lastName: "",
  street: "",
  apartment: "",
  city: "",
  state: "",
  zip: "",
  country: "India",
  phone: "",
  isDefault: false,
};

export default function AccountPage() {
  const { user, token, loading, logout, updateProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"profile" | "addresses" | "orders">("profile");

  // Address Form State
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressMessage, setAddressMessage] = useState("");
  const [addressSaving, setAddressSaving] = useState(false);

  // Return Form State
  const [returningOrderId, setReturningOrderId] = useState<string | null>(null);
  const [returnAction, setReturnAction] = useState("Refund");
  const [returnReason, setReturnReason] = useState("Fit Issue (Too tight / Too loose)");
  const [returnComments, setReturnComments] = useState("");
  const [returnSaving, setReturnSaving] = useState(false);
  const [returnMessage, setReturnMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    apiRequest<OrdersResponse>("/orders/myorders", { token })
      .then((data) => setOrders(data.orders))
      .catch(() => setOrders([]));
  }, [token]);

  if (loading) {
    return (
      <PageLayout>
        <section className="px-6 md:px-10 py-20 max-w-[1440px] mx-auto">Loading account...</section>
      </PageLayout>
    );
  }

  if (!user) {
    return <Navigate to="/login?redirect=/account" replace />;
  }

  // Address Handlers
  const handleStartAddAddress = () => {
    setEditingAddress({ ...emptyAddress, id: `addr_${Date.now()}`, firstName: user.firstName, lastName: user.lastName });
    setAddressMessage("");
  };

  const handleStartEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressMessage("");
  };

  const handlePincodeChange = (zip: string) => {
    if (!editingAddress) return;
    const lookup = lookupPincode(zip);
    if (lookup) {
      setEditingAddress({ ...editingAddress, zip, city: lookup.city, state: lookup.state });
    } else {
      setEditingAddress({ ...editingAddress, zip });
    }
  };

  const handleSaveAddress = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingAddress) return;
    setAddressSaving(true);
    setAddressMessage("");

    try {
      let updatedAddresses = [...user.addresses];
      const existingIndex = updatedAddresses.findIndex((a) => a.id === editingAddress.id);

      if (editingAddress.isDefault) {
        updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefault: false }));
      }

      if (existingIndex >= 0) {
        updatedAddresses[existingIndex] = editingAddress;
      } else {
        updatedAddresses.push(editingAddress);
      }

      if (updatedAddresses.length === 1) {
        updatedAddresses[0].isDefault = true;
      }

      await updateProfile({ addresses: updatedAddresses });
      setEditingAddress(null);
      setAddressMessage("Address saved successfully.");
    } catch (err) {
      setAddressMessage(err instanceof Error ? err.message : "Could not save address.");
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      const updatedAddresses = user.addresses.filter((a) => a.id !== id);
      await updateProfile({ addresses: updatedAddresses });
    } catch {
      alert("Could not delete address.");
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const updatedAddresses = user.addresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }));
      await updateProfile({ addresses: updatedAddresses });
    } catch {
      alert("Could not update default address.");
    }
  };

  // Return Handler
  const handleStartReturn = (orderId: string) => {
    setReturningOrderId(orderId);
    setReturnAction("Refund");
    setReturnReason("Fit Issue (Too tight / Too loose)");
    setReturnComments("");
    setReturnMessage("");
  };

  const handleSubmitReturn = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || !returningOrderId) return;
    setReturnSaving(true);
    setReturnMessage("");

    try {
      const data = await apiRequest<{ success: boolean; order: Order }>(`/orders/${returningOrderId}/return`, {
        method: "PUT",
        token,
        body: JSON.stringify({ returnAction, returnReason, returnComments }),
      });

      setOrders((current) => current.map((o) => (o.id === returningOrderId ? data.order : o)));
      setReturningOrderId(null);
      alert(`${returnAction} request submitted successfully and is currently ON HOLD pending team approval.`);
    } catch (err) {
      setReturnMessage(err instanceof Error ? err.message : "Could not submit return request.");
    } finally {
      setReturnSaving(false);
    }
  };

  return (
    <PageLayout>
      <section className="max-w-[1440px] mx-auto px-6 md:px-10 py-12 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="text-overline uppercase text-ink-muted mb-4">Account</p>
            <h1 className="text-title md:text-headline text-ink">Welcome, {user.firstName}</h1>
          </div>
          <button type="button" onClick={logout} className="btn-outline md:self-auto self-start">
            Sign out
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-8 border-b border-border mb-10 overflow-x-auto">
          {(["profile", "addresses", "orders"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm uppercase tracking-widest font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab ? "border-ink text-ink" : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              {tab === "profile" ? "Profile Details" : tab === "addresses" ? `Saved Addresses (${user.addresses.length})` : `Order History (${orders.length})`}
            </button>
          ))}
        </div>

        {/* Tab 1: Profile */}
        {activeTab === "profile" && (
          <div className="max-w-2xl border border-border bg-surface p-6 md:p-8">
            <h2 className="text-lg font-medium text-ink mb-6">Profile Information</h2>
            <ProfileForm firstName={user.firstName} lastName={user.lastName} email={user.email} onSave={updateProfile} />
          </div>
        )}

        {/* Tab 2: Addresses */}
        {activeTab === "addresses" && (
          <div className="space-y-8 max-w-4xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-ink">Saved Addresses</h2>
              {!editingAddress && (
                <button type="button" onClick={handleStartAddAddress} className="btn-primary text-sm px-6 py-2.5">
                  Add New Address
                </button>
              )}
            </div>

            {addressMessage && <p className="text-caption text-ink-secondary">{addressMessage}</p>}

            {/* Address Form Modal/Inline */}
            {editingAddress && (
              <form onSubmit={handleSaveAddress} className="border border-border bg-surface p-6 md:p-8 space-y-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-md font-medium text-ink">{editingAddress.id.startsWith("addr_") ? "Add Address" : "Edit Address"}</h3>
                  <button type="button" onClick={() => setEditingAddress(null)} className="text-caption uppercase tracking-widest text-ink-muted hover:text-ink">Cancel</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label>
                    <span className="text-caption uppercase tracking-widest text-ink-muted">First Name</span>
                    <input required value={editingAddress.firstName} onChange={(e) => setEditingAddress({ ...editingAddress, firstName: e.target.value })} className="mt-2 w-full border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink" />
                  </label>
                  <label>
                    <span className="text-caption uppercase tracking-widest text-ink-muted">Last Name</span>
                    <input required value={editingAddress.lastName} onChange={(e) => setEditingAddress({ ...editingAddress, lastName: e.target.value })} className="mt-2 w-full border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink" />
                  </label>
                </div>

                <label className="block">
                  <span className="text-caption uppercase tracking-widest text-ink-muted">Street Address</span>
                  <input required value={editingAddress.street} onChange={(e) => setEditingAddress({ ...editingAddress, street: e.target.value })} placeholder="House number, building, street name" className="mt-2 w-full border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink" />
                </label>

                <label className="block">
                  <span className="text-caption uppercase tracking-widest text-ink-muted">Apartment, suite, etc. (optional)</span>
                  <input value={editingAddress.apartment || ""} onChange={(e) => setEditingAddress({ ...editingAddress, apartment: e.target.value })} className="mt-2 w-full border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink" />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label>
                    <span className="text-caption uppercase tracking-widest text-ink-muted">PIN Code (Autofills City/State)</span>
                    <input required value={editingAddress.zip} onChange={(e) => handlePincodeChange(e.target.value)} placeholder="e.g. 400001" className="mt-2 w-full border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink font-medium" />
                  </label>
                  <label>
                    <span className="text-caption uppercase tracking-widest text-ink-muted">City</span>
                    <input required value={editingAddress.city} onChange={(e) => setEditingAddress({ ...editingAddress, city: e.target.value })} className="mt-2 w-full border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink" />
                  </label>
                  <label>
                    <span className="text-caption uppercase tracking-widest text-ink-muted">State</span>
                    <input required value={editingAddress.state} onChange={(e) => setEditingAddress({ ...editingAddress, state: e.target.value })} className="mt-2 w-full border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink" />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label>
                    <span className="text-caption uppercase tracking-widest text-ink-muted">Phone Number</span>
                    <input required value={editingAddress.phone} onChange={(e) => setEditingAddress({ ...editingAddress, phone: e.target.value })} placeholder="10-digit mobile number" className="mt-2 w-full border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink" />
                  </label>
                  <label className="flex items-center gap-3 pt-8 cursor-pointer">
                    <input type="checkbox" checked={editingAddress.isDefault} onChange={(e) => setEditingAddress({ ...editingAddress, isDefault: e.target.checked })} className="accent-ink w-4 h-4" />
                    <span className="text-sm font-medium text-ink">Set as default shipping address</span>
                  </label>
                </div>

                <div className="pt-4 flex gap-4">
                  <button type="submit" disabled={addressSaving} className="btn-primary px-8">
                    {addressSaving ? "Saving..." : "Save Address"}
                  </button>
                  <button type="button" onClick={() => setEditingAddress(null)} className="btn-outline px-8">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Address List */}
            {!editingAddress && user.addresses.length === 0 ? (
              <p className="text-body text-ink-secondary border border-border p-8 text-center bg-surface">No saved addresses yet. Add one above for faster checkout.</p>
            ) : (
              !editingAddress && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.addresses.map((addr) => (
                    <article key={addr.id} className={`border p-6 flex flex-col justify-between ${addr.isDefault ? "border-ink bg-surface shadow-sm" : "border-border bg-primary"}`}>
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <h3 className="font-medium text-ink">{addr.firstName} {addr.lastName}</h3>
                          {addr.isDefault && <span className="text-[10px] uppercase tracking-widest font-semibold bg-ink text-primary px-2.5 py-0.5 rounded-sm">Default</span>}
                        </div>
                        <p className="text-sm text-ink-secondary mb-1">{addr.street} {addr.apartment ? `, ${addr.apartment}` : ""}</p>
                        <p className="text-sm text-ink-secondary mb-1">{addr.city}, {addr.state} {addr.zip}</p>
                        <p className="text-sm text-ink-secondary mb-4">{addr.country} · Phone: {addr.phone}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border/60 text-caption uppercase tracking-widest font-medium">
                        <button type="button" onClick={() => handleStartEditAddress(addr)} className="text-ink hover:text-accent transition-colors">Edit</button>
                        <button type="button" onClick={() => handleDeleteAddress(addr.id)} className="text-red-500 hover:text-red-600 transition-colors">Delete</button>
                        {!addr.isDefault && (
                          <button type="button" onClick={() => handleSetDefaultAddress(addr.id)} className="text-ink-muted hover:text-ink transition-colors ml-auto">Set Default</button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* Tab 3: Orders */}
        {activeTab === "orders" && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-ink">Order History & Returns</h2>
              <Link to="/shop" className="btn-ghost text-sm">Continue Shopping</Link>
            </div>

            {orders.length === 0 ? (
              <p className="text-body text-ink-secondary border border-border p-8 text-center bg-surface">No orders yet. Your completed checkout history will appear here.</p>
            ) : (
              orders.map((order) => (
                <article key={order.id} className="border border-border bg-surface p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                    <div>
                      <p className="text-caption uppercase tracking-widest text-ink-muted">Order ID</p>
                      <p className="text-sm font-medium text-ink">#{order.id.slice(-8)}</p>
                    </div>
                    <div>
                      <p className="text-caption uppercase tracking-widest text-ink-muted">Placed On</p>
                      <p className="text-sm font-medium text-ink">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-caption uppercase tracking-widest text-ink-muted">Total Amount</p>
                      <p className="text-sm font-medium text-ink">{formatPrice(order.total)}</p>
                    </div>
                    <div>
                      <p className="text-caption uppercase tracking-widest text-ink-muted">Status</p>
                      <span className={`text-xs uppercase tracking-widest font-semibold px-2.5 py-1 rounded-sm ${
                        order.status === "delivered" ? "bg-green-100 text-green-800" :
                        (order.status === "return_requested" || order.status === "exchange_requested" || order.returnStatus === "on_hold") ? "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse" :
                        (order.status === "return_approved" || order.status === "exchange_approved" || order.status === "returned") ? "bg-blue-100 text-blue-800" :
                        order.status === "cancelled" ? "bg-red-100 text-red-800" : "bg-secondary text-ink"
                      }`}>
                        {order.status === "return_requested" ? "Return On Hold (Pending Approval)" :
                         order.status === "exchange_requested" ? "Exchange On Hold (Pending Approval)" :
                         order.status === "return_approved" ? "Return Approved" :
                         order.status === "exchange_approved" ? "Exchange Approved" :
                         order.status}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-border/60">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-3 flex items-center gap-4">
                        <img src={item.image?.src || "/products/tee-1.jpg"} alt={item.name} className="w-12 h-16 object-cover bg-secondary" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-ink">{item.name}</p>
                          <p className="text-caption text-ink-muted">Size: {item.size} · Color: {item.color?.name || "Default"} · Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium text-ink">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Return / Refund Section */}
                  {order.status !== "cancelled" && order.status !== "returned" && order.status !== "return_requested" && order.status !== "exchange_requested" && order.status !== "return_approved" && order.status !== "exchange_approved" && returningOrderId !== order.id && (
                    <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4">
                      <p className="text-caption text-ink-secondary">
                        {order.status === "delivered" ? "Eligible for 14-day hassle-free return, refund, or exchange." : "Need help with this order? Request cancellation, modification, refund, or exchange."}
                      </p>
                      <button type="button" onClick={() => handleStartReturn(order.id)} className="btn-outline text-xs px-4 py-2">
                        {order.status === "delivered" ? "Request Return / Refund / Exchange" : "Raise Order Query / Request Refund"}
                      </button>
                    </div>
                  )}

                  {(order.status === "return_requested" || order.status === "exchange_requested" || order.returnStatus === "on_hold" || order.status === "return_approved" || order.status === "exchange_approved" || order.status === "returned") && (
                    <div className="pt-4 border-t border-border bg-amber-50/50 p-4 rounded-lg flex flex-col gap-1.5 border border-amber-200">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                          {order.returnAction || "Return"} Requested · <span className="text-amber-700">{order.returnStatus === "on_hold" ? "On Hold (Pending Admin Approval)" : order.returnStatus?.toUpperCase()}</span>
                        </p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${
                          order.returnStatus === "approved" ? "bg-green-200 text-green-900" :
                          order.returnStatus === "rejected" ? "bg-red-200 text-red-900" :
                          "bg-amber-200 text-amber-900"
                        }`}>
                          {order.returnStatus === "on_hold" ? "Under Review" : order.returnStatus}
                        </span>
                      </div>
                      <p className="text-caption text-ink-secondary font-medium">Issue / Reason: {order.returnReason || "Fit Issue"} {order.returnComments ? `(${order.returnComments})` : ""}</p>
                      <p className="text-caption text-ink-muted">Requested on: {order.returnedAt ? new Date(order.returnedAt).toLocaleDateString() : new Date().toLocaleDateString()} · Our support team is reviewing your request. Once approved, you will be notified via email.</p>
                    </div>
                  )}

                  {/* Return Form Modal/Inline */}
                  {returningOrderId === order.id && (
                    <form onSubmit={handleSubmitReturn} className="pt-4 border-t border-border mt-4 space-y-5 bg-primary p-6 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">Initiate Return, Refund, or Exchange</h3>
                        <button type="button" onClick={() => setReturningOrderId(null)} className="text-caption uppercase tracking-widest text-ink-muted hover:text-ink">Cancel</button>
                      </div>

                      {returnMessage && <p className="text-caption text-red-500">{returnMessage}</p>}

                      <div className="space-y-2">
                        <span className="text-caption uppercase tracking-widest text-ink-muted block">Select Action Required</span>
                        <div className="flex gap-6 pt-1">
                          {(["Refund", "Return", "Exchange"] as const).map((action) => (
                            <label key={action} className="flex items-center gap-2 text-sm font-medium text-ink cursor-pointer">
                              <input type="radio" name="returnAction" value={action} checked={returnAction === action} onChange={(e) => setReturnAction(e.target.value)} className="accent-ink w-4 h-4" />
                              {action}
                            </label>
                          ))}
                        </div>
                      </div>

                      <label className="block">
                        <span className="text-caption uppercase tracking-widest text-ink-muted">Select Issue / Reason</span>
                        <select value={returnReason} onChange={(e) => setReturnReason(e.target.value)} className="mt-2 w-full border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-ink font-medium">
                          <option value="Fit Issue (Too tight / Too loose)">Fit Issue (Too tight / Too loose)</option>
                          <option value="Product Quality (Fabric / Stitching)">Product Quality (Fabric / Stitching)</option>
                          <option value="Defective / Damaged Product">Defective / Damaged Product</option>
                          <option value="Not as Expected / Not Satisfied">Not as Expected / Not Satisfied</option>
                          <option value="Wrong Item Received">Wrong Item Received</option>
                          <option value="Other">Other</option>
                        </select>
                      </label>

                      <label className="block">
                        <span className="text-caption uppercase tracking-widest text-ink-muted">Additional Comments / Details (Optional)</span>
                        <textarea value={returnComments} onChange={(e) => setReturnComments(e.target.value)} placeholder="Please describe the issue in detail..." className="mt-2 min-h-20 w-full border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-ink" />
                      </label>

                      <div className="flex gap-4 pt-2">
                        <button type="submit" disabled={returnSaving} className="btn-primary text-xs px-6 py-2.5">
                          {returnSaving ? "Submitting..." : "Confirm Request (Place On Hold)"}
                        </button>
                        <button type="button" onClick={() => setReturningOrderId(null)} className="btn-outline text-xs px-6 py-2.5">
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </article>
              ))
            )}
          </div>
        )}
      </section>
    </PageLayout>
  );
}

function ProfileForm({
  firstName: initialFirstName,
  lastName: initialLastName,
  email: initialEmail,
  onSave,
}: {
  firstName: string;
  lastName: string;
  email: string;
  onSave: (payload: { firstName: string; lastName: string; email: string }) => Promise<void>;
}) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [email, setEmail] = useState(initialEmail);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await onSave({ firstName, lastName, email });
      setMessage("Profile updated.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label>
          <span className="text-caption uppercase tracking-widest text-ink-muted">First Name</span>
          <input value={firstName} onChange={(event) => setFirstName(event.target.value)} className="mt-2 w-full border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink" />
        </label>
        <label>
          <span className="text-caption uppercase tracking-widest text-ink-muted">Last Name</span>
          <input value={lastName} onChange={(event) => setLastName(event.target.value)} className="mt-2 w-full border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink" />
        </label>
      </div>
      <label className="block">
        <span className="text-caption uppercase tracking-widest text-ink-muted">Email</span>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink" />
      </label>
      {message && <p className="text-caption text-ink-secondary">{message}</p>}
      <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
