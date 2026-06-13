"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BadgeCheck,
  CalendarClock,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  PhoneCall,
  PlusCircle,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const allNavItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: ["founder", "co_founder", "manager", "developer", "sales"],
  },
  {
    label: "Leads",
    href: "/admin/leads",
    icon: Users,
    roles: ["founder", "co_founder", "manager", "developer", "sales"],
  },
  {
    label: "My Leads",
    href: "/admin/my-leads",
    icon: UserCheck,
    roles: ["founder", "co_founder", "manager", "developer", "sales"],
  },
  {
    label: "Follow-ups",
    href: "/admin/follow-ups",
    icon: CalendarClock,
    roles: ["founder", "co_founder", "manager", "developer", "sales"],
  },
  {
    label: "Converted",
    href: "/admin/converted",
    icon: BadgeCheck,
    roles: ["founder", "co_founder", "manager", "sales"],
  },
  {
    label: "Add Lead",
    href: "/admin/leads/add",
    icon: PlusCircle,
    roles: ["founder", "co_founder", "manager", "developer", "sales"],
  },
  {
    label: "Bulk Upload",
    href: "/admin/leads/bulk",
    icon: Upload,
    roles: ["founder", "co_founder", "manager", "sales"],
  },
  {
    label: "Team",
    href: "/admin/team",
    icon: UserPlus,
    roles: ["founder", "co_founder"],
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: FileText,
    roles: ["founder", "co_founder", "manager", "sales"],
  },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("crm_token");
    const storedUser = localStorage.getItem("crm_user");

    if (!token || !storedUser) {
      router.push("/admin/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem("crm_token");
      localStorage.removeItem("crm_user");
      router.push("/admin/login");
    } finally {
      setCheckingAuth(false);
    }
  }, [router]);

  const navItems = useMemo(() => {
    if (!user?.role) return [];
    return allNavItems.filter((item) => item.roles.includes(user.role));
  }, [user]);

  const logout = () => {
    localStorage.removeItem("crm_token");
    localStorage.removeItem("crm_user");
    router.push("/admin/login");
  };

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      {open ? (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          aria-label="Close sidebar overlay"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#020617] transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="shrink-0 p-5">
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
                <PhoneCall size={22} />
              </div>

              <div>
                <h1 className="text-lg font-black leading-tight">
                  MayTech CRM
                </h1>
                <p className="text-xs text-slate-400">Lead Tracker</p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl p-2 text-slate-400 hover:bg-white/10 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto px-5 pb-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  active
                    ? "bg-cyan-400 text-slate-950"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-5">
          <div className="rounded-3xl border border-white/10 bg-white/4 p-4">
            <div className="mb-4">
              <p className="truncate text-sm font-black text-white">
                {user?.name || "User"}
              </p>
              <p className="mt-1 text-xs capitalize text-slate-400">
                {user?.role?.replace("_", " ") || "Member"}
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#020617]/90 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-xl border border-white/10 p-2 text-slate-300"
          >
            <Menu size={20} />
          </button>

          <p className="font-black">MayTech CRM</p>
        </header>

        <section className="p-4 md:p-8">{children}</section>
      </div>
    </main>
  );
}
