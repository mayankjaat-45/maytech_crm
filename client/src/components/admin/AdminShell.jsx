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
      router.replace("/admin/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem("crm_token");
      localStorage.removeItem("crm_user");
      router.replace("/admin/login");
    } finally {
      setCheckingAuth(false);
    }
  }, [router]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const navItems = useMemo(() => {
    if (!user?.role) {
      return [];
    }

    return allNavItems.filter((item) => item.roles.includes(user.role));
  }, [user]);

  const logout = () => {
    localStorage.removeItem("crm_token");
    localStorage.removeItem("crm_user");
    router.replace("/admin/login");
  };

  const isNavItemActive = (href) => {
    if (href === "/admin/leads") {
      return pathname === "/admin/leads";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg-soft">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
            <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
          </div>

          <p className="text-sm font-semibold text-muted">
            Checking authentication...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-soft text-main">
      {open && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-secondary/60 backdrop-blur-sm lg:hidden"
          aria-label="Close sidebar overlay"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-secondary text-white shadow-[20px_0_50px_rgba(15,23,42,0.12)] transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="shrink-0 px-5 pb-4 pt-5">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/admin/dashboard"
              onClick={() => setOpen(false)}
              className="flex min-w-0 items-center gap-3"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_12px_28px_rgba(255,153,0,0.3)]">
                <PhoneCall size={23} strokeWidth={2.2} />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-lg font-black leading-tight text-white">
                  MayTech CRM
                </h1>

                <p className="mt-1 truncate text-xs font-medium text-white/55">
                  Lead Tracker
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="mx-5 h-px shrink-0 bg-white/10" />

        <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-5 py-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isNavItemActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-200 ${
                  active
                    ? "bg-primary text-white shadow-[0_12px_28px_rgba(255,153,0,0.25)]"
                    : "text-white/70 hover:translate-x-0.5 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-white/[0.06] text-white/70 group-hover:bg-white/10 group-hover:text-white"
                  }`}
                >
                  <Icon size={18} strokeWidth={2.1} />
                </span>

                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-5">
          <div className="rounded-[22px] border border-white/10 bg-white/[0.05] p-4 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-sm font-black uppercase text-primary-dark">
                {user?.name?.trim()?.charAt(0) || "U"}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-black text-white">
                  {user?.name || "User"}
                </p>

                <p className="mt-1 truncate text-xs capitalize text-white/50">
                  {user?.role?.replaceAll("_", " ") || "Member"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white/75 transition hover:border-primary/40 hover:bg-primary hover:text-white"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border-soft bg-white/90 px-4 shadow-sm backdrop-blur-xl lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-soft bg-white text-secondary shadow-sm transition hover:border-primary/30 hover:bg-primary-soft"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-[0_8px_18px_rgba(255,153,0,0.25)]">
              <PhoneCall size={18} />
            </div>

            <div>
              <p className="text-sm font-black leading-tight text-secondary">
                MayTech CRM
              </p>
              <p className="text-[10px] font-medium text-muted">Lead Tracker</p>
            </div>
          </Link>

          <div className="h-10 w-10" />
        </header>

        <section className="min-h-screen bg-bg-soft p-4 md:p-6 lg:p-8">
          {children}
        </section>
      </div>
    </main>
  );
}
