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

const initialFilters = {
  search: "",
  callStatus: "",
  leadStatus: "",
};

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

const getWhatsAppNumber = (phone) => {
  const cleanedPhone = String(phone || "").replace(/\D/g, "");

  if (!cleanedPhone) {
    return "";
  }

  if (cleanedPhone.startsWith("91") && cleanedPhone.length > 10) {
    return cleanedPhone;
  }

  return `91${cleanedPhone}`;
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

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);

  const fetchLeads = async (filterValues = filters) => {
    try {
      setLoading(true);

      const { data } = await API.get("/api/leads", {
        params: {
          search: filterValues.search.trim() || undefined,
          callStatus: filterValues.callStatus || undefined,
          leadStatus: filterValues.leadStatus || undefined,
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
    fetchLeads(initialFilters);
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchLeads(filters);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    fetchLeads(initialFilters);
  };

  return (
    <AdminShell>
      <div className="mx-auto w-full max-w-350">
        {/* Page header */}
        <header className="mb-6 overflow-hidden rounded-3xl border border-primary/20 bg-[linear-gradient(135deg,var(--bg-warm)_0%,var(--bg-card)_58%,var(--secondary-soft)_100%)] p-5 shadow-[var(--shadow-card) md:mb-8 md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary-dark">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Leads
              </div>

              <h1 className="mt-4 text-2xl font-black tracking-tight text-secondary md:text-4xl">
                Lead Numbers
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted md:text-base">
                Manage numbers added by your team, track requirements, contact
                leads and update their progress.
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
          className="mb-6 grid gap-3 rounded-3xl border border-border-soft bg-white p-4 shadow-(--shadow-card)] md:grid-cols-2 md:p-5 xl:grid-cols-[minmax(260px,1fr)_220px_220px_auto]"
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

          <div className="grid grid-cols-2 gap-2 md:col-span-2 xl:col-span-1 xl:flex">
            <button
              type="button"
              onClick={handleResetFilters}
              disabled={loading}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-border-soft bg-white px-4 text-sm font-bold text-secondary transition hover:border-primary/30 hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reset
            </button>

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
              Filter
            </button>
          </div>
        </form>

        {/* Leads section */}
        <section className="overflow-hidden rounded-3xl border border-border-soft bg-white shadow-(--shadow-card)">
          <div className="flex flex-col gap-4 border-b border-border-soft p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-dark">
                Lead Management
              </p>

              <h2 className="mt-2 text-lg font-black text-secondary md:text-xl">
                All Lead Cards
              </h2>

              <p className="mt-1 text-sm text-muted">
                Contact, review and manage every lead.
              </p>
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

              <button
                type="button"
                onClick={handleResetFilters}
                className="btn-secondary mt-5"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 bg-bg-soft p-4 sm:p-5 md:grid-cols-2 2xl:grid-cols-3">
              {leads.map((lead) => (
                <article
                  key={lead._id}
                  className="group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-border-soft bg-white p-4 shadow-[var(--shadow-card) transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-soft) sm:p-5"
                >
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary-soft transition-transform duration-300 group-hover:scale-125" />

                  <div className="relative flex h-full flex-col">
                    {/* Lead heading */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-soft">
                          Lead Phone
                        </p>

                        <h3 className="mt-1 wrap-break-word text-xl font-black text-secondary">
                          {lead.phone}
                        </h3>

                        <p className="mt-1 text-xs font-semibold text-muted">
                          {formatLabel(lead.source)}
                        </p>
                      </div>

                      <span
                        className={`${statusBadge(
                          lead.leadStatus,
                        )} max-w-32.5 shrink-0 text-center`}
                      >
                        {formatLabel(lead.leadStatus)}
                      </span>
                    </div>

                    {/* Requirement note */}
                    <div className="mt-4 rounded-2xl border border-primary/15 bg-bg-warm p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-primary-dark">
                        Requirement
                      </p>

                      <p className="mt-2 line-clamp-3 min-h-18 text-sm leading-6 text-muted">
                        {lead.requirementNote ||
                          lead.note ||
                          "No requirement note added"}
                      </p>
                    </div>

                    {/* Lead details */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-border-soft bg-bg-soft p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-soft">
                          Service
                        </p>

                        <p className="mt-1 line-clamp-2 min-h-10 text-sm font-bold leading-5 text-secondary">
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
                        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-soft">
                          <Calendar size={13} className="text-primary-dark" />
                          Follow-up
                        </p>

                        <p className="mt-1.5 text-sm font-bold text-secondary">
                          {formatDate(lead.followUpDate)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border-soft bg-bg-soft p-3">
                        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-soft">
                          <UserRound size={13} className="text-primary-dark" />
                          Assigned To
                        </p>

                        <p className="mt-1.5 truncate text-sm font-bold text-secondary">
                          {lead.assignedTo?.name || "Not Assigned"}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto grid grid-cols-3 gap-2 pt-5">
                      <a
                        href={`tel:${lead.phone}`}
                        className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border border-border-soft bg-white px-2 text-xs font-black text-secondary transition hover:border-primary/30 hover:bg-primary-soft"
                        aria-label={`Call ${lead.phone}`}
                      >
                        <Phone size={15} />
                        Call
                      </a>

                      <a
                        href={`https://wa.me/${getWhatsAppNumber(lead.phone)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border border-border-soft bg-white px-2 text-xs font-black text-secondary transition hover:border-primary/30 hover:bg-primary-soft"
                        aria-label={`WhatsApp ${lead.phone}`}
                      >
                        <Send size={15} />
                        WhatsApp
                      </a>

                      <Link
                        href={`/admin/leads/${lead._id}`}
                        className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl bg-primary px-2 text-xs font-black text-white shadow-[0_10px_22px_rgba(255,153,0,0.22)] transition hover:bg-primary-dark"
                        aria-label={`Open lead ${lead.phone}`}
                      >
                        <Eye size={15} />
                        Open
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
