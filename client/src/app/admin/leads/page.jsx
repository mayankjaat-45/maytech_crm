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

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusBadge = (status) => {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black";

  switch (status) {
    case "interested":
      return `${base} bg-success-soft text-success`;

    case "converted":
      return `${base} bg-primary-soft text-primary-dark`;

    case "lost":
    case "not_interested":
    case "invalid_number":
      return `${base} bg-danger-soft text-danger`;

    case "follow_up":
      return `${base} bg-warning-soft text-warning`;

    case "proposal_sent":
    case "contacted":
    case "requirement_asked":
      return `${base} bg-info-soft text-info`;

    default:
      return `${base} bg-secondary-soft text-secondary`;
  }
};

const callBadge = (status) => {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black";

  switch (status) {
    case "called":
      return `${base} bg-success-soft text-success`;

    case "not_picked":
    case "busy":
      return `${base} bg-warning-soft text-warning`;

    case "wrong_number":
      return `${base} bg-danger-soft text-danger`;

    case "whatsapp_sent":
    case "meeting_scheduled":
      return `${base} bg-info-soft text-info`;

    default:
      return `${base} bg-secondary-soft text-secondary`;
  }
};

const getWhatsAppNumber = (phone) => {
  const cleanedPhone = String(phone || "").replace(/\D/g, "");

  if (cleanedPhone.startsWith("91") && cleanedPhone.length > 10) {
    return cleanedPhone;
  }

  return `91${cleanedPhone}`;
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

      setLeads(data?.leads || []);
    } catch (error) {
      console.log(error?.response?.data || error?.message);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchLeads();
  };

  return (
    <AdminShell>
      <div className="mx-auto w-full max-w-350">
        {/* Page header */}
        <header className="mb-6 rounded-3xl border border-border-soft bg-white p-5 shadow-[var(--shadow-card) md:mb-8 md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary-dark">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Leads
              </div>

              <h1 className="mt-4 text-2xl font-black tracking-tight text-secondary md:text-4xl">
                Lead Numbers
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted md:text-base">
                Manage numbers added by your team, track requirements and update
                call status.
              </p>
            </div>

            <Link
              href="/admin/leads/add"
              className="btn-primary w-full md:w-auto"
            >
              <Plus size={18} />
              Add Lead
            </Link>
          </div>
        </header>

        {/* Filters */}
        <form
          onSubmit={handleSearch}
          className="mb-6 grid gap-3 rounded-3xl border border-border-soft bg-white p-4 shadow-(--shadow-card) md:grid-cols-[minmax(260px,1fr)_220px_220px_auto] md:p-5"
        >
          <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-border-soft bg-bg-soft px-4 transition focus-within:border-primary focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(255,153,0,0.12)]">
            <Search size={18} className="shrink-0 text-soft" />

            <input
              type="search"
              value={filters.search}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  search: event.target.value,
                }))
              }
              placeholder="Search phone number..."
              className="w-full bg-transparent text-sm text-main outline-none placeholder:text-soft"
            />
          </div>

          <select
            value={filters.callStatus}
            onChange={(event) =>
              setFilters((previous) => ({
                ...previous,
                callStatus: event.target.value,
              }))
            }
            className="min-h-12 rounded-2xl border border-border-soft bg-white px-4 text-sm font-semibold text-secondary outline-none transition hover:border-border-medium focus:border-primary focus:shadow-[0_0_0_4px_rgba(255,153,0,0.12)]"
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
            onChange={(event) =>
              setFilters((previous) => ({
                ...previous,
                leadStatus: event.target.value,
              }))
            }
            className="min-h-12 rounded-2xl border border-border-soft bg-white px-4 text-sm font-semibold text-secondary outline-none transition hover:border-border-medium focus:border-primary focus:shadow-[0_0_0_4px_rgba(255,153,0,0.12)]"
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

          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-secondary px-5 text-sm font-black text-white transition hover:bg-secondary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCcw size={16} />
            )}
            Apply Filters
          </button>
        </form>

        {/* Leads section */}
        <section className="overflow-hidden rounded-3xl border border-border-soft bg-white shadow-(--shadow-card)">
          <div className="flex flex-col gap-2 border-b border-border-soft bg-white p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-dark">
                Lead Management
              </p>

              <h2 className="mt-2 text-lg font-black text-secondary md:text-xl">
                All Leads
              </h2>
            </div>

            <div className="inline-flex w-fit items-center rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary-dark">
              Total leads: {leads.length}
            </div>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
                  <Loader2 className="animate-spin text-primary" size={30} />
                </div>

                <p className="text-sm font-semibold text-muted">
                  Loading leads...
                </p>
              </div>
            </div>
          ) : leads.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
                <Search size={28} />
              </div>

              <h3 className="mt-4 text-lg font-black text-secondary">
                No leads found
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
                No leads match your current search and filter selection.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="grid gap-4 bg-bg-soft p-4 md:hidden">
                {leads.map((lead) => (
                  <article
                    key={lead._id}
                    className="group relative overflow-hidden rounded-[22px] border border-border-soft bg-white p-4 shadow-(--shadow-card)"
                  >
                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary-soft transition-transform duration-300 group-hover:scale-110" />

                    <div className="relative">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-soft">
                            Lead Phone
                          </p>

                          <h3 className="mt-1 wrap-break-word text-xl font-black text-secondary">
                            {lead.phone}
                          </h3>
                        </div>

                        <span className={statusBadge(lead.leadStatus)}>
                          {formatLabel(lead.leadStatus)}
                        </span>
                      </div>

                      <p className="mb-4 line-clamp-2 rounded-2xl border border-primary/10 bg-bg-warm p-3 text-sm leading-6 text-muted">
                        {lead.requirementNote || lead.note || "No note added"}
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-border-soft bg-bg-soft p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-soft">
                            Source
                          </p>

                          <p className="mt-1 text-sm font-bold text-secondary">
                            {formatLabel(lead.source)}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-border-soft bg-bg-soft p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-soft">
                            Service
                          </p>

                          <p className="mt-1 line-clamp-1 text-sm font-bold text-secondary">
                            {formatLabel(lead.serviceRequired)}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-border-soft bg-bg-soft p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-soft">
                            Call Status
                          </p>

                          <div className="mt-2">
                            <span className={callBadge(lead.callStatus)}>
                              {formatLabel(lead.callStatus)}
                            </span>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-border-soft bg-bg-soft p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-soft">
                            Follow-up
                          </p>

                          <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-secondary">
                            <Calendar
                              size={14}
                              className="shrink-0 text-primary-dark"
                            />

                            <span>{formatDate(lead.followUpDate)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border-soft bg-white p-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-dark">
                          <UserRound size={17} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-soft">
                            Assigned To
                          </p>

                          <p className="truncate text-sm font-bold text-secondary">
                            {lead.assignedTo?.name || "Not Assigned"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <a
                          href={`tel:${lead.phone}`}
                          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border border-border-soft bg-white px-2 text-xs font-black text-secondary transition hover:border-primary/30 hover:bg-primary-soft"
                        >
                          <Phone size={15} />
                          Call
                        </a>

                        <a
                          href={`https://wa.me/${getWhatsAppNumber(
                            lead.phone,
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border border-border-soft bg-white px-2 text-xs font-black text-secondary transition hover:border-primary/30 hover:bg-primary-soft"
                        >
                          <Send size={15} />
                          WA
                        </a>

                        <Link
                          href={`/admin/leads/${lead._id}`}
                          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl bg-primary px-2 text-xs font-black text-white shadow-[0_10px_22px_rgba(255,153,0,0.22)] transition hover:bg-primary-dark"
                        >
                          <Eye size={15} />
                          Open
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-250 text-left text-sm">
                  <thead className="border-b border-border-soft bg-secondary-soft">
                    <tr className="text-xs uppercase tracking-wider text-secondary">
                      <th className="px-5 py-4 font-black">Phone</th>
                      <th className="px-5 py-4 font-black">Source</th>
                      <th className="px-5 py-4 font-black">Call Status</th>
                      <th className="px-5 py-4 font-black">Lead Status</th>
                      <th className="px-5 py-4 font-black">Service</th>
                      <th className="px-5 py-4 font-black">Assigned To</th>
                      <th className="px-5 py-4 font-black">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border-soft">
                    {leads.map((lead) => (
                      <tr
                        key={lead._id}
                        className="transition-colors hover:bg-bg-warm"
                      >
                        <td className="px-5 py-4">
                          <div className="font-black text-secondary">
                            {lead.phone}
                          </div>

                          <div className="mt-1 max-w-52 truncate text-xs text-soft">
                            {lead.requirementNote || lead.note || "No note"}
                          </div>
                        </td>

                        <td className="px-5 py-4 font-medium text-muted">
                          {formatLabel(lead.source)}
                        </td>

                        <td className="px-5 py-4">
                          <span className={callBadge(lead.callStatus)}>
                            {formatLabel(lead.callStatus)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className={statusBadge(lead.leadStatus)}>
                            {formatLabel(lead.leadStatus)}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-medium text-muted">
                          {formatLabel(lead.serviceRequired)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-dark">
                              <UserRound size={15} />
                            </div>

                            <span className="font-semibold text-secondary">
                              {lead.assignedTo?.name || "Not Assigned"}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${lead.phone}`}
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-soft bg-white text-muted transition hover:border-primary/30 hover:bg-primary-soft hover:text-primary-dark"
                              aria-label={`Call ${lead.phone}`}
                            >
                              <Phone size={16} />
                            </a>

                            <a
                              href={`https://wa.me/${getWhatsAppNumber(
                                lead.phone,
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-soft bg-white text-muted transition hover:border-primary/30 hover:bg-primary-soft hover:text-primary-dark"
                              aria-label={`WhatsApp ${lead.phone}`}
                            >
                              <Send size={16} />
                            </a>

                            <Link
                              href={`/admin/leads/${lead._id}`}
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-[0_8px_18px_rgba(255,153,0,0.2)] transition hover:bg-primary-dark"
                              aria-label={`Open lead ${lead.phone}`}
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
      </div>
    </AdminShell>
  );
}
