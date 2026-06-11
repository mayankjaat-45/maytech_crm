"use client";

import AdminShell from "@/components/admin/AdminShell";
import { API } from "@/lib/api";
import {
  CalendarClock,
  Eye,
  Loader2,
  Phone,
  RefreshCcw,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const formatLabel = (value) => {
  if (!value) return "—";
  return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatDate = (dateValue) => {
  if (!dateValue) return "—";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const badgeClass = (status) => {
  const base = "rounded-full px-3 py-1 text-xs font-bold";

  if (status === "interested") {
    return `${base} bg-emerald-400/10 text-emerald-300`;
  }

  if (status === "follow_up") {
    return `${base} bg-yellow-400/10 text-yellow-300`;
  }

  if (status === "proposal_sent") {
    return `${base} bg-cyan-400/10 text-cyan-300`;
  }

  if (status === "lost") {
    return `${base} bg-red-400/10 text-red-300`;
  }

  if (status === "converted") {
    return `${base} bg-green-400/10 text-green-300`;
  }

  return `${base} bg-white/10 text-slate-300`;
};

export default function FollowUpsPage() {
  const [type, setType] = useState("today");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowUps = async () => {
    try {
      setLoading(true);

      const { data } = await API.get("/api/leads/follow-ups", {
        params: { type },
      });

      setLeads(data.leads || []);
    } catch (error) {
      console.log(error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, [type]);

  return (
    <AdminShell>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
            Follow-ups
          </p>

          <h1 className="mt-2 text-3xl font-black md:text-4xl">
            Follow-up Calls
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Track today, pending and upcoming lead follow-ups.
          </p>
        </div>

        <button
          onClick={fetchFollowUps}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
        >
          <RefreshCcw size={17} />
          Refresh
        </button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Today", value: "today" },
          { label: "Pending", value: "pending" },
          { label: "Upcoming", value: "upcoming" },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => setType(item.value)}
            className={`rounded-2xl px-5 py-3 text-sm font-black transition ${
              type === item.value
                ? "bg-cyan-400 text-slate-950"
                : "border border-white/10 bg-white/4 text-slate-300 hover:bg-white/10"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/4">
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
              <CalendarClock size={24} />
            </div>

            <div>
              <h2 className="text-xl font-black">
                {formatLabel(type)} Follow-ups
              </h2>
              <p className="text-sm text-slate-400">
                Total leads: {leads.length}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
          </div>
        ) : leads.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            No follow-ups found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-225 text-left text-sm">
              <thead className="border-b border-white/10 bg-white/3 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">Follow-up Date</th>
                  <th className="px-5 py-4">Call Status</th>
                  <th className="px-5 py-4">Lead Status</th>
                  <th className="px-5 py-4">Service</th>
                  <th className="px-5 py-4">Assigned To</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-white/3">
                    <td className="px-5 py-4">
                      <p className="font-bold text-white">{lead.phone}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                        {lead.requirementNote || lead.note || "No note"}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-bold text-slate-300">
                      {formatDate(lead.followUpDate)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-300">
                        {formatLabel(lead.callStatus)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className={badgeClass(lead.leadStatus)}>
                        {formatLabel(lead.leadStatus)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {formatLabel(lead.serviceRequired)}
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {lead.assignedTo?.name || "Not Assigned"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <a
                          href={`tel:${lead.phone}`}
                          className="rounded-xl border border-white/10 p-2 text-slate-300 hover:bg-white/10"
                        >
                          <Phone size={16} />
                        </a>

                        <a
                          href={`https://wa.me/91${lead.phone}`}
                          target="_blank"
                          className="rounded-xl border border-white/10 p-2 text-slate-300 hover:bg-white/10"
                        >
                          <Send size={16} />
                        </a>

                        <Link
                          href={`/admin/leads/${lead._id}`}
                          className="rounded-xl bg-cyan-400 p-2 text-slate-950"
                        >
                          <Eye size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
