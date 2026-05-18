import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "register";

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>("login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = searchParams.get("redirect") || "/account";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const signedInUser =
        mode === "login"
          ? await login(email, password)
          : await register({ firstName, lastName, email, password });
      navigate(signedInUser.role === "admin" ? "/admin" : redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign you in");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <section className="max-w-[1080px] mx-auto px-6 md:px-10 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-20 items-start">
        <div>
          <p className="text-overline uppercase text-ink-muted mb-4">DotStar account</p>
          <h1 className="text-title md:text-headline text-ink mb-5">
            Sign in for faster checkout and order history.
          </h1>
          <p className="text-body text-ink-secondary leading-relaxed max-w-md">
            Your account keeps your cart synced, saves delivery details, and gives you one place to track every drop you order.
          </p>
        </div>

        <section className="border border-border bg-surface p-6 md:p-8">
          <div className="grid grid-cols-2 border border-border mb-8">
            {(["login", "register"] as AuthMode[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item);
                  setError("");
                }}
                className={cn(
                  "py-3 text-caption uppercase tracking-widest transition-colors",
                  mode === item ? "bg-ink text-primary" : "text-ink-secondary hover:text-ink"
                )}
              >
                {item === "login" ? "Login" : "Create"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "register" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-caption uppercase tracking-widest text-ink-muted">First name</span>
                  <input
                    required
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className="mt-2 w-full border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink"
                  />
                </label>
                <label className="block">
                  <span className="text-caption uppercase tracking-widest text-ink-muted">Last name</span>
                  <input
                    required
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="mt-2 w-full border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink"
                  />
                </label>
              </div>
            )}

            <label className="block">
              <span className="text-caption uppercase tracking-widest text-ink-muted">Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink"
              />
            </label>

            <label className="block">
              <span className="text-caption uppercase tracking-widest text-ink-muted">Password</span>
              <input
                required
                type="password"
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full border border-border bg-primary px-4 py-3 text-sm outline-none focus:border-ink"
              />
            </label>

            {error && (
              <p className="text-caption text-red-500 border border-red-500/30 bg-red-500/5 px-4 py-3">
                {error}
              </p>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
              {submitting ? "Please wait" : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="text-caption text-ink-muted mt-6">
            By continuing, you agree to secure cookie-based sessions for DotStar checkout.
          </p>
          <Link to="/shop" className="btn-ghost mt-8">
            Continue shopping
          </Link>
        </section>
      </section>
    </PageLayout>
  );
}
