"use client";

import AdminShell from "@/components/admin/AdminShell";
import { API } from "@/lib/api";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  Plus,
  RefreshCcw,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "sales",
};

const formatRole = (role) => {
  if (!role) return "—";

  return role
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatDate = (dateValue) => {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const roleBadgeClass = (role) => {
  const base =
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black";

  switch (role) {
    case "founder":
      return `${base} bg-primary text-white`;

    case "co_founder":
      return `${base} bg-primary-soft text-primary-dark`;

    case "manager":
      return `${base} bg-info-soft text-info`;

    case "developer":
      return `${base} bg-secondary-soft text-secondary`;

    case "sales":
      return `${base} bg-success-soft text-success`;

    default:
      return `${base} bg-secondary-soft text-secondary`;
  }
};

const ToastContainer = () => {
  return (
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
  );
};

export default function TeamPage() {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [saving, setSaving] = useState(false);

  const [allowed, setAllowed] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const storedUser = localStorage.getItem("crm_user");

    if (!storedUser) {
      setAllowed(false);
      setCheckingRole(false);
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      const allowedRoles = ["founder", "co_founder"];

      setAllowed(allowedRoles.includes(user?.role));
    } catch (error) {
      console.log("USER PARSE ERROR:", error);
      setAllowed(false);
    } finally {
      setCheckingRole(false);
    }
  }, []);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);

      const { data } = await API.get("/api/auth/users");

      setUsers(data?.users || []);
    } catch (error) {
      console.log("USERS ERROR:", error?.response?.data || error?.message);

      toast.error(error?.response?.data?.message || "Failed to load users");

      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (allowed && !checkingRole) {
      fetchUsers();
    }

    if (!allowed && !checkingRole) {
      setLoadingUsers(false);
    }
  }, [allowed, checkingRole]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setShowPassword(false);
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      password: form.password,
      role: form.role,
    };

    if (!payload.name || !payload.email || !payload.password) {
      toast.error("Name, email and password are required");
      return;
    }

    if (payload.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setSaving(true);

      await API.post("/api/auth/register", payload);

      toast.success("Team member created successfully");

      resetForm();
      await fetchUsers();
    } catch (error) {
      console.log(
        "CREATE USER ERROR:",
        error?.response?.data || error?.message,
      );

      toast.error(error?.response?.data?.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  if (checkingRole) {
    return (
      <AdminShell>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
              <Loader2 className="animate-spin text-primary" size={30} />
            </div>

            <p className="text-sm font-semibold text-muted">
              Checking permissions...
            </p>
          </div>
        </div>
      </AdminShell>
    );
  }

  if (!allowed) {
    return (
      <AdminShell>
        <div className="mx-auto flex min-h-[65vh] max-w-3xl items-center justify-center">
          <div className="w-full rounded-3xl border border-danger/20 bg-white p-8 text-center shadow-[var(--shadow-card) md:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-soft text-danger">
              <ShieldCheck size={29} />
            </div>

            <h1 className="mt-5 text-2xl font-black text-secondary">
              Access Denied
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
              Only the founder and co-founder can create or manage CRM team
              members.
            </p>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <ToastContainer />

      <div className="mx-auto w-full max-w-350">
        {/* Page header */}
        <header className="mb-6 overflow-hidden rounded-3xl border border-primary/20 bg-[linear-gradient(135deg,var(--bg-warm)_0%,var(--bg-card)_58%,var(--secondary-soft)_100%)] p-5 shadow-[var(--shadow-card) md:mb-8 md:p-7">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-primary-dark">
                <Users size={14} />
                Team
              </div>

              <h1 className="mt-4 text-2xl font-black tracking-tight text-secondary md:text-4xl">
                Team Management
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted md:text-base">
                Create CRM accounts, assign roles and manage the team members
                who can access MayTech CRM.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchUsers}
              disabled={loadingUsers}
              className="btn-secondary w-full md:w-auto"
            >
              <RefreshCcw
                size={17}
                className={loadingUsers ? "animate-spin" : ""}
              />
              Refresh Team
            </button>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
          {/* Create user form */}
          <form
            onSubmit={handleCreateUser}
            className="h-fit rounded-3xl border border-border-soft bg-white p-5 shadow-(--shadow-card) md:p-6"
          >
            <div className="mb-6 flex items-start gap-3 border-b border-border-soft pb-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
                <UserPlus size={23} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-dark">
                  New Account
                </p>

                <h2 className="mt-1 text-xl font-black text-secondary">
                  Create Teammate
                </h2>

                <p className="mt-1 text-sm leading-6 text-muted">
                  Add a new user who can log in to the CRM.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="form-label">
                  Name <span className="text-danger">*</span>
                </label>

                <div className="flex min-h-12.5 items-center gap-3 rounded-[14px] border border-border-soft bg-white px-4 transition hover:border-border-medium focus-within:border-primary focus-within:shadow-[0_0_0_4px_rgba(255,153,0,0.14)]">
                  <UserPlus size={17} className="shrink-0 text-primary-dark" />

                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Team member name"
                    required
                    disabled={saving}
                    className="w-full bg-transparent text-sm font-semibold text-main outline-none placeholder:text-soft"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="form-label">
                  Email <span className="text-danger">*</span>
                </label>

                <div className="flex min-h-12.5 items-center gap-3 rounded-[14px] border border-border-soft bg-white px-4 transition hover:border-border-medium focus-within:border-primary focus-within:shadow-[0_0_0_4px_rgba(255,153,0,0.14)]">
                  <Mail size={17} className="shrink-0 text-primary-dark" />

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="sales@maytech.com"
                    autoComplete="email"
                    required
                    disabled={saving}
                    className="w-full bg-transparent text-sm font-semibold text-main outline-none placeholder:text-soft"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="form-label">
                  Phone / WhatsApp Number
                </label>

                <div className="flex min-h-12.5 items-center gap-3 rounded-[14px] border border-border-soft bg-white px-4 transition hover:border-border-medium focus-within:border-primary focus-within:shadow-[0_0_0_4px_rgba(255,153,0,0.14)]">
                  <Phone size={17} className="shrink-0 text-primary-dark" />

                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    inputMode="numeric"
                    autoComplete="tel"
                    disabled={saving}
                    className="w-full bg-transparent text-sm font-semibold text-main outline-none placeholder:text-soft"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="form-label">
                  Password <span className="text-danger">*</span>
                </label>

                <div className="flex min-h-12.5 items-center gap-3 rounded-[14px] border border-border-soft bg-white px-4 transition hover:border-border-medium focus-within:border-primary focus-within:shadow-[0_0_0_4px_rgba(255,153,0,0.14)]">
                  <Lock size={17} className="shrink-0 text-primary-dark" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                    required
                    disabled={saving}
                    className="w-full bg-transparent text-sm font-semibold text-main outline-none placeholder:text-soft"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    disabled={saving}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted transition hover:bg-primary-soft hover:text-primary-dark"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="role" className="form-label">
                  Role
                </label>

                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  disabled={saving}
                  className="form-input min-h-12.5 font-semibold"
                >
                  <option value="co_founder">Co-Founder</option>
                  <option value="manager">Manager</option>
                  <option value="developer">Developer</option>
                  <option value="sales">Sales</option>
                </select>
              </div>

              <div className="border-t border-border-soft pt-5">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary w-full py-3.5"
                >
                  {saving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Plus size={18} />
                  )}

                  {saving ? "Creating User..." : "Create User"}
                </button>
              </div>
            </div>
          </form>

          {/* Team members */}
          <section className="overflow-hidden rounded-3xl border border-border-soft bg-white shadow-[var(--shadow-card)">
            <div className="flex flex-col gap-4 border-b border-border-soft p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
                  <Users size={23} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-dark">
                    CRM Access
                  </p>

                  <h2 className="mt-1 text-xl font-black text-secondary">
                    Active Users
                  </h2>

                  <p className="mt-1 text-sm text-muted">
                    Users who can log in to MayTech CRM.
                  </p>
                </div>
              </div>

              <div className="inline-flex w-fit items-center rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary-dark">
                Total users: {users.length}
              </div>
            </div>

            {loadingUsers ? (
              <div className="flex min-h-105 items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
                    <Loader2 className="animate-spin text-primary" size={30} />
                  </div>

                  <p className="text-sm font-semibold text-muted">
                    Loading team members...
                  </p>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="flex min-h-105 flex-col items-center justify-center p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
                  <Users size={28} />
                </div>

                <h3 className="mt-4 text-lg font-black text-secondary">
                  No users found
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
                  Create the first CRM team member using the form.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 bg-bg-soft p-4 md:grid-cols-2 md:p-5 2xl:grid-cols-3">
                {users.map((user) => {
                  const isActive = user.isActive !== false;

                  return (
                    <article
                      key={user._id}
                      className="group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-border-soft bg-white p-5 shadow-[var(--shadow-card) transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-soft)"
                    >
                      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary-soft transition-transform duration-300 group-hover:scale-125" />

                      <div className="relative flex h-full flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-black uppercase text-white shadow-[0_10px_24px_rgba(255,153,0,0.24)]">
                              {user.name?.trim()?.charAt(0) || "U"}
                            </div>

                            <div className="min-w-0">
                              <h3 className="truncate font-black text-secondary">
                                {user.name || "Unnamed User"}
                              </h3>

                              <p className="mt-1 text-xs text-soft">
                                Added {formatDate(user.createdAt)}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${
                              isActive
                                ? "bg-success-soft text-success"
                                : "bg-danger-soft text-danger"
                            }`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="mt-5 space-y-3">
                          <div className="flex items-start gap-3 rounded-2xl border border-border-soft bg-bg-soft p-3">
                            <Mail
                              size={16}
                              className="mt-0.5 shrink-0 text-primary-dark"
                            />

                            <div className="min-w-0">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-soft">
                                Email
                              </p>

                              <p className="mt-1 wrap-break-word text-sm font-semibold text-secondary">
                                {user.email || "Not available"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 rounded-2xl border border-border-soft bg-bg-soft p-3">
                            <Phone
                              size={16}
                              className="mt-0.5 shrink-0 text-primary-dark"
                            />

                            <div className="min-w-0">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-soft">
                                Phone
                              </p>

                              <p className="mt-1 wrap-break-word text-sm font-semibold text-secondary">
                                {user.phone || "Not saved"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto pt-5">
                          <span className={roleBadgeClass(user.role)}>
                            <ShieldCheck size={14} />
                            {formatRole(user.role)}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
