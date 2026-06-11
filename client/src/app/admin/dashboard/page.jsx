"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API } from "@/lib/api";
import AdminShell from "@/components/admin/AdminShell";
import {
  Loader2,
  Users,
  Phone,
  CheckCircle,
  Clock,
  TrendingUp,
  IndianRupee,
  Send,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("crm_token");
    localStorage.removeItem("crm_user");
    router.push("/admin/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("crm_token");

    if (!token) {
      router.push("/admin/login");
      return;
    }

    const fetchStats = async () => {
      try {
        const { data } = await API.get("/api/leads/dashboard/stats");
        setStats(data.stats);
      } catch (error) {
        console.log(error?.response?.data || error.message);

        if (error?.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      title: "Total Leads",
      value: stats?.totalLeads || 0,
      icon: Users,
    },
    {
      title: "Not Called",
      value: stats?.not_called || 0,
      icon: Phone,
    },
    {
      title: "Interested",
      value: stats?.interested || 0,
      icon: CheckCircle,
    },
    {
      title: "Today Follow-ups",
      value: stats?.todayFollowUps || 0,
      icon: Clock,
    },
    {
      title: "Proposal Sent",
      value: stats?.proposalSent || 0,
      icon: Send,
    },
    {
      title: "Converted",
      value: stats?.converted || 0,
      icon: TrendingUp,
    },
    {
      title: "Total Revenue",
      value: `₹${Number(stats?.totalRevenue || 0).toLocaleString("en-IN")}`,
      icon: IndianRupee,
    },
    {
      title: "Estimated Budget",
      value: `₹${Number(stats?.totalEstimatedBudget || 0).toLocaleString(
        "en-IN",
      )}`,
      icon: IndianRupee,
    },
  ];

  return (
    <AdminShell>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
          Overview
        </p>

        <h1 className="mt-2 text-3xl font-black md:text-4xl">CRM Dashboard</h1>

        <p className="mt-2 text-sm text-slate-400">
          Track your lead calls, requirements, follow-ups and revenue.
        </p>
      </div>

      {loading ? (
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="animate-spin text-cyan-400" size={34} />
        </div>
      ) : (
        <>
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="rounded-3xl border border-white/10 bg-white/4 p-6"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                    <Icon size={24} />
                  </div>

                  <p className="text-sm font-semibold text-slate-400">
                    {card.title}
                  </p>

                  <h2 className="mt-2 text-3xl font-black md:text-4xl">
                    {card.value}
                  </h2>
                </div>
              );
            })}
          </section>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/admin/leads")}
              className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300"
            >
              View Leads
            </button>

            <button
              onClick={() => router.push("/admin/leads/add")}
              className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
            >
              Add Lead
            </button>

            <button
              onClick={() => router.push("/admin/follow-ups")}
              className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
            >
              Today Follow-ups
            </button>

            <button
              onClick={() => router.push("/admin/converted")}
              className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
            >
              Converted Leads
            </button>
          </div>
        </>
      )}
    </AdminShell>
  );
}
