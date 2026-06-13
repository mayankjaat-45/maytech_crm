"use client";

import AdminShell from "@/components/admin/AdminShell";
import { API } from "@/lib/api";
import { Loader2, Plus, RefreshCcw, ShieldCheck, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const formatRole = (role) => {
  if (!role) return "—";
  return role.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function TeamPage() {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("crm_user");

    if (!storedUser) {
      setCheckingRole(false);
      return;
    }

    const user = JSON.parse(storedUser);
    const allowedRoles = ["founder", "co_founder"];

    if (!allowedRoles.includes(user.role)) {
      setAllowed(false);
    } else {
      setAllowed(true);
    }

    setCheckingRole(false);
  }, []);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "sales",
  });

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);

      const { data } = await API.get("/api/auth/users");

      setUsers(data.users || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "sales",
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      toast.error("Name, email and password are required");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setSaving(true);

      await API.post("/auth/register", form);

      toast.success("Team member created successfully");

      resetForm();
      fetchUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  if (checkingRole) {
    return (
      <AdminShell>
        <div className="flex h-[70vh] items-center justify-center">
          <Loader2 className="animate-spin text-cyan-400" size={34} />
        </div>
      </AdminShell>
    );
  }

  if (!allowed) {
    return (
      <AdminShell>
        <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-10 text-center">
          <h1 className="text-2xl font-black text-red-300">Access Denied</h1>
          <p className="mt-2 text-sm text-slate-400">
            Only founder and co-founder can manage team members.
          </p>
        </div>
      </AdminShell>
    );
  }
  return (
    <AdminShell>
      <Toaster position="top-right" />

      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
            Team
          </p>
          <h1 className="mt-2 text-3xl font-black md:text-4xl">
            Team Management
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Founder and co-founder can create teammates for CRM access.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
        >
          <RefreshCcw size={17} />
          Refresh
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form
          onSubmit={handleCreateUser}
          className="rounded-3xl border border-white/10 bg-white/4 p-6"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
              <UserPlus size={24} />
            </div>

            <div>
              <h2 className="text-xl font-black">Create Teammate</h2>
              <p className="text-sm text-slate-400">Add CRM user account</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">
                Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Team member name"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="sales@maytech.com"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">
                Phone / WhatsApp Number
              </label>

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="9876543210"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">
                Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none"
              >
                <option value="co_founder">Co Founder</option>
                <option value="manager">Manager</option>
                <option value="developer">Developer</option>
                <option value="sales">Sales</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Plus size={18} />
              )}
              {saving ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/4">
          <div className="border-b border-white/10 p-6">
            <h2 className="text-xl font-black">Active Users</h2>
            <p className="mt-1 text-sm text-slate-400">
              Users who can login to MayTech CRM.
            </p>
          </div>

          {loadingUsers ? (
            <div className="flex h-60 items-center justify-center">
              <Loader2 className="animate-spin text-cyan-400" size={32} />
            </div>
          ) : users.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-180 text-left text-sm">
                <thead className="border-b border-white/10 bg-white/3 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-4">User</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-white/3">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10 text-sm font-black text-cyan-300">
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>

                          <div>
                            <p className="font-bold text-white">{user.name}</p>
                            <p className="text-xs text-slate-500">
                              Added{" "}
                              {new Date(user.createdAt).toLocaleDateString(
                                "en-IN",
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-300">{user.email}</td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
                          <ShieldCheck size={14} />
                          {formatRole(user.role)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
