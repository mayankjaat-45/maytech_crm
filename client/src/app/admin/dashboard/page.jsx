"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  IndianRupee,
  Loader2,
  Phone,
  Plus,
  Send,
  TrendingUp,
  Users,
} from "lucide-react";

import AdminShell from "@/components/admin/AdminShell";
import { API } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("crm_token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    const fetchStats = async () => {
      try {
        const { data } = await API.get("/api/leads/dashboard/stats");
        setStats(data?.stats || {});
      } catch (error) {
        console.log(error?.response?.data || error?.message);

        if (error?.response?.status === 401) {
          localStorage.removeItem("crm_token");
          localStorage.removeItem("crm_user");
          router.replace("/admin/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  const cards = [
    {
      title: "Total Leads",
      value: stats?.totalLeads || 0,
      icon: Users,
      description: "All leads available in the CRM",
    },
    {
      title: "Not Called",
      value: stats?.not_called || 0,
      icon: Phone,
      description: "Leads waiting for the first call",
    },
    {
      title: "Interested",
      value: stats?.interested || 0,
      icon: CheckCircle,
      description: "Leads showing active interest",
    },
    {
      title: "Today Follow-ups",
      value: stats?.todayFollowUps || 0,
      icon: Clock,
      description: "Follow-ups scheduled for today",
    },
    {
      title: "Proposal Sent",
      value: stats?.proposalSent || 0,
      icon: Send,
      description: "Leads who received proposals",
    },
    {
      title: "Converted",
      value: stats?.converted || 0,
      icon: TrendingUp,
      description: "Successfully converted leads",
    },
    {
      title: "Total Revenue",
      value: `₹${Number(stats?.totalRevenue || 0).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      description: "Revenue from converted leads",
      highlighted: true,
    },
    {
      title: "Estimated Budget",
      value: `₹${Number(stats?.totalEstimatedBudget || 0).toLocaleString(
        "en-IN",
      )}`,
      icon: IndianRupee,
      description: "Combined estimated lead budget",
      highlighted: true,
    },
  ];

  const quickActions = [
    {
      title: "View Leads",
      description: "Manage all available leads",
      icon: Users,
      path: "/admin/leads",
      primary: true,
    },
    {
      title: "Add Lead",
      description: "Create a new lead",
      icon: Plus,
      path: "/admin/leads/add",
    },
    {
      title: "Follow-ups",
      description: "View scheduled follow-ups",
      icon: Clock,
      path: "/admin/follow-ups",
    },
    {
      title: "Converted",
      description: "View converted customers",
      icon: TrendingUp,
      path: "/admin/converted",
    },
  ];

  return (
    <AdminShell>
      <div className="mx-auto w-full max-w-350">
        {/* Dashboard header */}
        <header className="mb-6 rounded-3xl border border-border-soft bg-white p-5 shadow-[var(--shadow-card) md:mb-8 md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary-dark">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Overview
              </div>

              <h1 className="mt-4 text-2xl font-black tracking-tight text-secondary md:text-4xl">
                CRM Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted md:text-base">
                Track your leads, calls, requirements, follow-ups, conversions
                and revenue from one place.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/admin/leads/add")}
              className="btn-primary w-full sm:w-auto"
            >
              <Plus size={18} />
              Add New Lead
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex min-h-[55vh] items-center justify-center rounded-3xl border border-border-soft bg-white shadow-[var(--shadow-card)">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
                <Loader2 className="animate-spin text-primary" size={30} />
              </div>

              <p className="text-sm font-semibold text-muted">
                Loading dashboard statistics...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {cards.map((card) => {
                const Icon = card.icon;

                return (
                  <article
                    key={card.title}
                    className={`group relative overflow-hidden rounded-[22px] border p-5 shadow-[var(--shadow-card) transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-soft) md:p-6 ${
                      card.highlighted
                        ? "border-[rgba(255,153,0,0.22)] bg-bg-warm"
                        : "border-border-soft bg-white"
                    }`}
                  >
                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 transition-transform duration-300 group-hover:scale-125" />

                    <div className="relative">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark md:h-12 md:w-12">
                          <Icon size={22} />
                        </div>

                        <span className="rounded-full border border-primary/15 bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-dark">
                          Live
                        </span>
                      </div>

                      <p className="mt-5 text-sm font-bold text-muted">
                        {card.title}
                      </p>

                      <h2 className="mt-2 wrap-break-word text-2xl font-black leading-tight tracking-tight text-secondary md:text-3xl">
                        {card.value}
                      </h2>

                      <p className="mt-3 text-xs leading-5 text-soft">
                        {card.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </section>

            {/* Quick actions */}
            <section className="mt-7 rounded-3xl border border-border-soft bg-white p-5 shadow-(--shadow-card) md:mt-8 md:p-7">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-dark">
                    Quick Actions
                  </p>

                  <h2 className="mt-2 text-xl font-black text-secondary md:text-2xl">
                    Manage your CRM
                  </h2>
                </div>

                <p className="text-sm text-muted">
                  Access frequently used sections.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <button
                      key={action.title}
                      type="button"
                      onClick={() => router.push(action.path)}
                      className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                        action.primary
                          ? "border-primary bg-primary text-white shadow-[0_14px_32px_rgba(255,153,0,0.24)] hover:bg-primary-dark"
                          : "border-border-soft bg-bg-soft text-secondary hover:border-primary/30 hover:bg-primary-soft"
                      }`}
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          action.primary
                            ? "bg-white/20 text-white"
                            : "bg-white text-primary-dark shadow-sm"
                        }`}
                      >
                        <Icon size={20} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-bold">{action.title}</p>

                        <p
                          className={`mt-1 truncate text-xs ${
                            action.primary ? "text-white/75" : "text-muted"
                          }`}
                        >
                          {action.description}
                        </p>
                      </div>

                      <ArrowRight
                        size={18}
                        className="shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </AdminShell>
  );
}
