"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  PhoneCall,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import { API } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    const email = form.email.trim();

    if (!email || !form.password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const { data } = await API.post("/api/auth/login", {
        email,
        password: form.password,
      });

      if (!data?.token || !data?.user) {
        throw new Error("Invalid login response");
      }

      localStorage.setItem("crm_token", data.token);
      localStorage.setItem("crm_user", JSON.stringify(data.user));

      toast.success("Login successful");

      router.replace("/admin/dashboard");
    } catch (error) {
      console.log(error?.response?.data || error?.message);

      toast.error(
        error?.response?.data?.message || error?.message || "Login failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-bg-soft text-main">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "var(--secondary)",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "14px",
            boxShadow: "var(--shadow-medium)",
          },
          success: {
            iconTheme: {
              primary: "var(--primary)",
              secondary: "#ffffff",
            },
          },
        }}
      />

      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        <div className="absolute -bottom-40 -right-32 h-105 w-105 rounded-full bg-secondary/10 blur-3xl" />

        <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <section className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="grid w-full max-w-262.5 overflow-hidden rounded-[30px] border border-border-soft bg-white shadow-[var(--shadow-medium) lg:grid-cols-[0.9fr_1.1fr]">
          {/* Brand panel */}
          <aside className="relative hidden overflow-hidden bg-secondary p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-2xl" />

            <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_14px_34px_rgba(255,153,0,0.3)]">
                  <PhoneCall size={23} />
                </div>

                <div>
                  <h1 className="text-xl font-black">MayTech CRM</h1>
                  <p className="mt-1 text-xs font-medium text-white/55">
                    Lead Tracker
                  </p>
                </div>
              </div>

              <div className="mt-16">
                <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  CRM Workspace
                </div>

                <h2 className="mt-5 max-w-md text-4xl font-black leading-tight">
                  Manage every lead from one place.
                </h2>

                <p className="mt-5 max-w-md text-sm leading-7 text-white/65">
                  Track calls, follow-ups, requirements, assignments,
                  conversions and revenue with the MayTech CRM dashboard.
                </p>
              </div>
            </div>

            <div className="relative mt-12 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                <p className="text-lg font-black text-primary">01</p>
                <p className="mt-1 text-xs text-white/60">Capture leads</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                <p className="text-lg font-black text-primary">02</p>
                <p className="mt-1 text-xs text-white/60">Track follow-ups</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                <p className="text-lg font-black text-primary">03</p>
                <p className="mt-1 text-xs text-white/60">Convert clients</p>
              </div>
            </div>
          </aside>

          {/* Login form */}
          <div className="flex items-center justify-center p-5 sm:p-8 md:p-10 lg:p-12">
            <div className="w-full max-w-md">
              {/* Mobile logo */}
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_12px_28px_rgba(255,153,0,0.25)]">
                  <PhoneCall size={22} />
                </div>

                <div>
                  <h1 className="text-lg font-black text-secondary">
                    MayTech CRM
                  </h1>

                  <p className="mt-1 text-xs text-muted">Lead Tracker</p>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
                  <Lock size={27} />
                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-primary-dark">
                  Secure Login
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-tight text-secondary">
                  Welcome back
                </h2>

                <p className="mt-3 text-sm leading-6 text-muted">
                  Sign in to manage leads, calls, follow-ups and team
                  assignments.
                </p>
              </div>

              <form onSubmit={handleLogin}>
                <div className="space-y-5">
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>

                    <div className="flex min-h-13 items-center gap-3 rounded-2xl border border-border-soft bg-bg-soft px-4 transition hover:border-border-medium focus-within:border-primary focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(255,153,0,0.14)]">
                      <Mail size={18} className="shrink-0 text-primary-dark" />

                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="mayank@maytech.com"
                        autoComplete="email"
                        required
                        disabled={loading}
                        className="w-full bg-transparent text-sm font-medium text-main outline-none placeholder:text-soft"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>

                    <div className="flex min-h-13 items-center gap-3 rounded-2xl border border-border-soft bg-bg-soft px-4 transition hover:border-border-medium focus-within:border-primary focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(255,153,0,0.14)]">
                      <Lock size={18} className="shrink-0 text-primary-dark" />

                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                        disabled={loading}
                        className="w-full bg-transparent text-sm font-medium text-main outline-none placeholder:text-soft"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((previous) => !previous)}
                        disabled={loading}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted transition hover:bg-primary-soft hover:text-primary-dark"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary min-h-13 w-full"
                  >
                    {loading ? (
                      <Loader2 size={19} className="animate-spin" />
                    ) : (
                      <Lock size={18} />
                    )}

                    <span>{loading ? "Logging in..." : "Login to CRM"}</span>

                    {!loading ? (
                      <ArrowRight size={18} className="ml-auto" />
                    ) : null}
                  </button>
                </div>
              </form>

              <div className="mt-6 rounded-2xl border border-primary/15 bg-bg-warm p-4 text-center">
                <p className="text-xs leading-5 text-muted">
                  Access is limited to authorised MayTech CRM team members.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
