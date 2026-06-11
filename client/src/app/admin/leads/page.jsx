"use client";

import AdminShell from "@/components/admin/AdminShell";
import { API } from "@/lib/api";
import {
  Eye,
  Loader2,
  Phone,
  Plus,
  RefreshCcw,
  Search,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const formatLabel = (value) => {
  if (!value) return "—";
  return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const statusBadge = (status) => {
  const base = "rounded-full px-3 py-1 text-xs font-bold";

  if (status === "interested")
    return `${base} bg-emerald-400/10 text-emerald-300`;
  if (status === "converted") return `${base} bg-cyan-400/10 text-cyan-300`;
  if (status === "lost") return `${base} bg-red-400/10 text-red-300`;
  if (status === "follow_up") return `${base} bg-yellow-400/10 text-yellow-300`;

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
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
            Leads
          </p>
          <h1 className="mt-2 text-3xl font-black md:text-4xl">Lead Numbers</h1>
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

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/4">
        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
          </div>
        ) : leads.length === 0 ? (
          <div className="p-10 text-center text-slate-400">No leads found.</div>
        ) : (
          <div className="overflow-x-auto">
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
        )}
      </div>
    </AdminShell>
  );
}
