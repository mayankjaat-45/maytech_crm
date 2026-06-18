"use client";

import AdminShell from "@/components/admin/AdminShell";
import { API } from "@/lib/api";
import {
  Calendar,
  Eye,
  Loader2,
  Phone,
  Plus,
  RefreshCcw,
  Search,
  Send,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const formatLabel = (value) => {
  if (!value) return "—";
  return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusBadge = (status) => {
  const base = "rounded-full px-3 py-1 text-[11px] font-black";

  if (status === "interested")
    return `${base} bg-emerald-400/10 text-emerald-300`;
  if (status === "converted") return `${base} bg-cyan-400/10 text-cyan-300`;
  if (status === "lost") return `${base} bg-red-400/10 text-red-300`;
  if (status === "follow_up") return `${base} bg-yellow-400/10 text-yellow-300`;
  if (status === "proposal_sent") return `${base} bg-blue-400/10 text-blue-300`;

  return `${base} bg-white/10 text-slate-300`;
};

const callBadge = (status) => {
  const base = "rounded-full px-3 py-1 text-[11px] font-black";

  if (status === "called") return `${base} bg-emerald-400/10 text-emerald-300`;
  if (status === "not_picked")
    return `${base} bg-yellow-400/10 text-yellow-300`;
  if (status === "wrong_number") return `${base} bg-red-400/10 text-red-300`;
  if (status === "whatsapp_sent") return `${base} bg-cyan-400/10 text-cyan-300`;

  return `${base} bg-white/10 text-slate-300`;
};

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    callStatus: "",
    leadStatus: "",
  });

  const fetchLeads = async () => {
    try {
      setLoading(true);

      const { data } = await API.get("/api/leads", {
        params: {
          search: filters.search || undefined,
          callStatus: filters.callStatus || undefined,
          leadStatus: filters.leadStatus || undefined,
        },
      });

      setLeads(data.leads || []);
    } catch (error) {
      console.log(error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLeads();
  };

  return (
    <AdminShell>
      <div className="mb-6 flex flex-col justify-between gap-4 md:mb-8 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300 md:text-sm md:tracking-[0.25em]">
            Leads
          </p>

          <h1 className="mt-2 text-2xl font-black md:text-4xl">Lead Numbers</h1>

          <p className="mt-2 text-sm text-slate-400">
            Manage numbers added by your team and update call status.
          </p>
        </div>

        <Link
          href="/admin/leads/add"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300"
        >
          <Plus size={18} />
          Add Lead
        </Link>
      </div>

      <form
        onSubmit={handleSearch}
        className="mb-6 grid gap-3 rounded-3xl border border-white/10 bg-white/4 p-4 md:grid-cols-[1fr_220px_220px_auto]"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3">
          <Search size={18} className="text-slate-500" />
          <input
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            placeholder="Search phone number..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-600"
          />
        </div>

        <select
          value={filters.callStatus}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, callStatus: e.target.value }))
          }
          className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none"
        >
          <option value="">All Call Status</option>
          <option value="not_called">Not Called</option>
          <option value="called">Called</option>
          <option value="not_picked">Not Picked</option>
          <option value="busy">Busy</option>
          <option value="wrong_number">Wrong Number</option>
          <option value="whatsapp_sent">WhatsApp Sent</option>
          <option value="meeting_scheduled">Meeting Scheduled</option>
        </select>

        <select
          value={filters.leadStatus}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, leadStatus: e.target.value }))
          }
          className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none"
        >
          <option value="">All Lead Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="requirement_asked">Requirement Asked</option>
          <option value="interested">Interested</option>
          <option value="not_interested">Not Interested</option>
          <option value="follow_up">Follow Up</option>
          <option value="proposal_sent">Proposal Sent</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
          <option value="invalid_number">Invalid Number</option>
        </select>

        <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950">
          <RefreshCcw size={16} />
          Filter
        </button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/4">
        <div className="border-b border-white/10 p-4 md:p-6">
          <h2 className="text-lg font-black md:text-xl">All Leads</h2>
          <p className="mt-1 text-sm text-slate-400">
            Total leads: {leads.length}
          </p>
        </div>

        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
          </div>
        ) : leads.length === 0 ? (
          <div className="p-10 text-center text-slate-400">No leads found.</div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="grid gap-4 p-4 md:hidden">
              {leads.map((lead) => (
                <div
                  key={lead._id}
                  className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950 p-4 shadow-xl shadow-black/20"
                >
                  <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-cyan-400/10" />

                  <div className="relative">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                          Lead Phone
                        </p>

                        <h3 className="mt-1 text-xl font-black text-white">
                          {lead.phone}
                        </h3>
                      </div>

                      <span className={statusBadge(lead.leadStatus)}>
                        {formatLabel(lead.leadStatus)}
                      </span>
                    </div>

                    <p className="mb-4 line-clamp-2 rounded-2xl bg-white/4 p-3 text-sm text-slate-300">
                      {lead.requirementNote || lead.note || "No note added"}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/3 p-3">
                        <p className="text-[11px] font-bold uppercase text-slate-500">
                          Source
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-200">
                          {formatLabel(lead.source)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/3 p-3">
                        <p className="text-[11px] font-bold uppercase text-slate-500">
                          Service
                        </p>
                        <p className="mt-1 line-clamp-1 text-sm font-bold text-slate-200">
                          {formatLabel(lead.serviceRequired)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/3 p-3">
                        <p className="text-[11px] font-bold uppercase text-slate-500">
                          Call
                        </p>
                        <div className="mt-2">
                          <span className={callBadge(lead.callStatus)}>
                            {formatLabel(lead.callStatus)}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/3 p-3">
                        <p className="text-[11px] font-bold uppercase text-slate-500">
                          Follow-up
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-200">
                          {formatDate(lead.followUpDate)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/3 p-3">
                      <UserRound size={16} className="text-cyan-300" />
                      <div>
                        <p className="text-[11px] font-bold uppercase text-slate-500">
                          Assigned To
                        </p>
                        <p className="text-sm font-bold text-white">
                          {lead.assignedTo?.name || "Not Assigned"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <a
                        href={`tel:${lead.phone}`}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-3 py-3 text-xs font-black text-slate-300 hover:bg-white/10"
                      >
                        <Phone size={15} />
                        Call
                      </a>

                      <a
                        href={`https://wa.me/91${lead.phone}`}
                        target="_blank"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-3 py-3 text-xs font-black text-slate-300 hover:bg-white/10"
                      >
                        <Send size={15} />
                        WA
                      </a>

                      <Link
                        href={`/admin/leads/${lead._id}`}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-3 py-3 text-xs font-black text-slate-950 hover:bg-cyan-300"
                      >
                        <Eye size={15} />
                        Open
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-225 text-left text-sm">
                <thead className="border-b border-white/10 bg-white/3 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-4">Phone</th>
                    <th className="px-5 py-4">Source</th>
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
                        <div className="font-bold">{lead.phone}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {lead.note || "No note"}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {formatLabel(lead.source)}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-300">
                          {formatLabel(lead.callStatus)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className={statusBadge(lead.leadStatus)}>
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
          </>
        )}
      </section>
    </AdminShell>
  );
}
