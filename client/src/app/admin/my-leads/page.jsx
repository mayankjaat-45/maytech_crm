"use client";

import AdminShell from "@/components/admin/AdminShell";
import { API } from "@/lib/api";
import {
  Calendar,
  Eye,
  Loader2,
  Phone,
  RefreshCcw,
  Search,
  Send,
  Tag,
  UserCheck,
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

export default function MyLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    callStatus: "",
    leadStatus: "",
    serviceRequired: "",
  });

  const fetchMyLeads = async () => {
    try {
      setLoading(true);

      const { data } = await API.get("/api/leads/my-leads", {
        params: {
          search: filters.search || undefined,
          callStatus: filters.callStatus || undefined,
          leadStatus: filters.leadStatus || undefined,
          serviceRequired: filters.serviceRequired || undefined,
        },
      });

      setLeads(data.leads || []);
      setPagination(data.pagination || null);
    } catch (error) {
      console.log(error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLeads();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchMyLeads();
  };

  return (
    <AdminShell>
      <div className="mb-6 overflow-hidden rounded-3xl border border-cyan-400/20 bg-linear-to-br from-cyan-400/15 via-white/4 to-slate-950 p-5 md:mb-8 md:p-7">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
              <UserCheck size={14} />
              My Leads
            </div>

            <h1 className="text-2xl font-black text-white md:text-4xl">
              Assigned To Me
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Only leads assigned to your account will appear here. Call,
              WhatsApp, follow-up and update the lead status quickly.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchMyLeads}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
          >
            <RefreshCcw size={17} />
            Refresh
          </button>
        </div>
      </div>

      <form
        onSubmit={handleFilter}
        className="mb-6 grid gap-3 rounded-3xl border border-white/10 bg-white/4 p-4 xl:grid-cols-[1fr_200px_220px_240px_auto]"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 md:py-3">
          <Search size={18} className="text-slate-500" />
          <input
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            placeholder="Search phone..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-600"
          />
        </div>

        <select
          value={filters.callStatus}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, callStatus: e.target.value }))
          }
          className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-sm outline-none md:py-3"
        >
          <option value="">All Calls</option>
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
          className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-sm outline-none md:py-3"
        >
          <option value="">All Status</option>
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

        <select
          value={filters.serviceRequired}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              serviceRequired: e.target.value,
            }))
          }
          className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-sm outline-none md:py-3"
        >
          <option value="">All Services</option>
          <option value="not_sure">Not Sure</option>
          <option value="website_development">Website Development</option>
          <option value="website_redesign">Website Redesign</option>
          <option value="seo">SEO</option>
          <option value="google_ads">Google Ads</option>
          <option value="landing_page">Landing Page</option>
          <option value="ecommerce_website">Ecommerce Website</option>
          <option value="portfolio_website">Portfolio Website</option>
          <option value="other">Other</option>
        </select>

        <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-4 text-sm font-black text-slate-950 hover:bg-cyan-300 md:py-3">
          <RefreshCcw size={16} />
          Filter
        </button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/4">
        <div className="border-b border-white/10 p-4 md:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300 md:h-12 md:w-12">
              <UserCheck size={22} />
            </div>

            <div>
              <h2 className="text-lg font-black md:text-xl">My Lead List</h2>
              <p className="text-sm text-slate-400">
                Total: {pagination?.total || leads.length}
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
            No assigned leads found.
          </div>
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
                          Assigned Lead
                        </p>

                        <h3 className="mt-1 text-xl font-black text-white">
                          {lead.phone}
                        </h3>
                      </div>

                      <span className={statusBadge(lead.leadStatus)}>
                        {formatLabel(lead.leadStatus)}
                      </span>
                    </div>

                    <p className="mb-4 line-clamp-2 rounded-2xl bg-white/4 p-3 text-sm leading-6 text-slate-300">
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
                          Call Status
                        </p>
                        <div className="mt-2">
                          <span className={callBadge(lead.callStatus)}>
                            {formatLabel(lead.callStatus)}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/3 p-3">
                        <p className="flex items-center gap-1 text-[11px] font-bold uppercase text-slate-500">
                          <Calendar size={12} />
                          Follow-up
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-200">
                          {formatDate(lead.followUpDate)}
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
              <table className="w-full min-w-237.5 text-left text-sm">
                <thead className="border-b border-white/10 bg-white/3 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-4">Phone</th>
                    <th className="px-5 py-4">Source</th>
                    <th className="px-5 py-4">Call Status</th>
                    <th className="px-5 py-4">Lead Status</th>
                    <th className="px-5 py-4">Service</th>
                    <th className="px-5 py-4">Follow-up</th>
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
                        {formatDate(lead.followUpDate)}
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
