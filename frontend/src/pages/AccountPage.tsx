import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types/models";

interface OrdersResponse {
  success: boolean;
  orders: Order[];
}

export default function AccountPage() {
  const { user, token, loading, logout, updateProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

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

        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.2fr] gap-10">
          <section className="border border-border bg-surface p-6 md:p-8">
            <h2 className="text-lg font-medium text-ink mb-6">Profile</h2>
            <ProfileForm
              firstName={user.firstName}
              lastName={user.lastName}
              email={user.email}
              onSave={updateProfile}
            />
          </section>

          <section className="border border-border bg-surface p-6 md:p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-medium text-ink">Order history</h2>
              <Link to="/shop" className="btn-ghost">Shop</Link>
            </div>

            {orders.length === 0 ? (
              <p className="text-body text-ink-secondary">No orders yet. Your completed checkout history will appear here.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <article key={order.id} className="border border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div>
                        <p className="text-caption uppercase tracking-widest text-ink-muted">Order</p>
                        <p className="text-sm font-medium text-ink">#{order.id.slice(-8)}</p>
                      </div>
                      <span className="text-caption uppercase tracking-widest text-accent">{order.status}</span>
                    </div>
                    <p className="text-sm text-ink-secondary mb-2">
                      {order.items.length} {order.items.length === 1 ? "item" : "items"} · {formatPrice(order.total)}
                    </p>
                    <p className="text-caption text-ink-muted">
                      Placed {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
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
          <span className="text-caption uppercase tracking-widest text-ink-muted">First name</span>
          <input value={firstName} onChange={(event) => setFirstName(event.target.value)} className="mt-2 w-full border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink" />
        </label>
        <label>
          <span className="text-caption uppercase tracking-widest text-ink-muted">Last name</span>
          <input value={lastName} onChange={(event) => setLastName(event.target.value)} className="mt-2 w-full border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink" />
        </label>
      </div>
      <label className="block">
        <span className="text-caption uppercase tracking-widest text-ink-muted">Email</span>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink" />
      </label>
      {message && <p className="text-caption text-ink-secondary">{message}</p>}
      <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
        {saving ? "Saving" : "Save profile"}
      </button>
    </form>
  );
}
