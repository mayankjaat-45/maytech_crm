"use client";

import AdminShell from "@/components/admin/AdminShell";
import { API } from "@/lib/api";
import {
  BadgeCheck,
  CalendarDays,
  Eye,
  IndianRupee,
  Loader2,
  Phone,
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

const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
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

export default function ConvertedLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    serviceRequired: "",
  });

  const fetchConvertedLeads = async () => {
    try {
      setLoading(true);

      const { data } = await API.get("/api/leads/converted", {
        params: {
          search: filters.search.trim() || undefined,
          serviceRequired: filters.serviceRequired || undefined,
        },
      });

      setLeads(data?.leads || []);
      setPagination(data?.pagination || null);
    } catch (error) {
      console.log(error?.response?.data || error?.message);

      setLeads([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConvertedLeads();
  }, []);

  const handleFilter = (event) => {
    event.preventDefault();
    fetchConvertedLeads();
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      serviceRequired: "",
    });

    setTimeout(() => {
      fetchConvertedLeads();
    }, 0);
  };

  return (
    <AdminShell>
      <div className="mx-auto w-full max-w-350">
        {/* Page header */}
        <header className="mb-6 overflow-hidden rounded-3xl border border-primary/20 bg-[linear-gradient(135deg,var(--bg-warm)_0%,var(--bg-card)_58%,var(--secondary-soft)_100%)] p-5 shadow-(--shadow-card) md:mb-8 md:p-7">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-primary-dark">
                <BadgeCheck size={14} />
                Converted
              </div>

              <h1 className="mt-4 text-2xl font-black tracking-tight text-secondary md:text-4xl">
                Converted Leads
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted md:text-base">
                Track leads that became paying clients or confirmed business
                projects.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchConvertedLeads}
              disabled={loading}
              className="btn-secondary w-full md:w-auto"
            >
              <RefreshCcw size={17} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </header>

        {/* Filters */}
        <form
          onSubmit={handleFilter}
          className="mb-6 grid gap-3 rounded-3xl border border-border-soft bg-white p-4 shadow-(--shadow-card) md:grid-cols-[minmax(260px,1fr)_260px_auto] md:p-5"
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
            value={filters.serviceRequired}
            onChange={(event) =>
              setFilters((previous) => ({
                ...previous,
                serviceRequired: event.target.value,
              }))
            }
            className="min-h-12 rounded-2xl border border-border-soft bg-white px-4 text-sm font-semibold text-secondary outline-none transition hover:border-border-medium focus:border-primary focus:shadow-[0_0_0_4px_rgba(255,153,0,0.12)]"
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

          <div className="grid grid-cols-2 gap-2 md:flex">
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

        {/* Converted leads */}
        <section className="overflow-hidden rounded-3xl border border-border-soft bg-white shadow-(--shadow-card)">
          <div className="flex flex-col gap-4 border-b border-border-soft p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
                <BadgeCheck size={24} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-dark">
                  Successful Conversions
                </p>

                <h2 className="mt-1 text-xl font-black text-secondary">
                  Closed Leads
                </h2>

                <p className="mt-1 text-sm text-muted">
                  Paying clients and confirmed projects.
                </p>
              </div>
            </div>

            <div className="inline-flex w-fit items-center rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary-dark">
              Total: {pagination?.total ?? leads.length}
            </div>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
                  <Loader2 className="animate-spin text-primary" size={30} />
                </div>

                <p className="text-sm font-semibold text-muted">
                  Loading converted leads...
                </p>
              </div>
            </div>
          ) : leads.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
                <BadgeCheck size={28} />
              </div>

              <h3 className="mt-4 text-lg font-black text-secondary">
                No converted leads found
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
                No converted leads match your current search and service
                filters.
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
                            Client Phone
                          </p>

                          <h3 className="mt-1 wrap-break-word text-xl font-black text-secondary">
                            {lead.phone}
                          </h3>

                          <p className="mt-1 text-xs font-semibold text-muted">
                            {formatLabel(lead.source)}
                          </p>
                        </div>

                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-[11px] font-black text-primary-dark">
                          <BadgeCheck size={13} />
                          Converted
                        </span>
                      </div>

                      <div className="rounded-2xl border border-primary/15 bg-bg-warm p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-primary-dark">
                          Requirement
                        </p>

                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
                          {lead.requirementNote || lead.note || "—"}
                        </p>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-border-soft bg-bg-soft p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-soft">
                            Service
                          </p>

                          <p className="mt-1 line-clamp-2 text-sm font-bold text-secondary">
                            {formatLabel(lead.serviceRequired)}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-border-soft bg-bg-soft p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-soft">
                            Converted On
                          </p>

                          <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-secondary">
                            <CalendarDays
                              size={14}
                              className="shrink-0 text-primary-dark"
                            />

                            <span>{formatDate(lead.updatedAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-3 rounded-2xl border border-border-soft bg-white p-3">
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

                      {Number(lead.convertedAmount || 0) > 0 ? (
                        <div className="mt-3 flex items-center justify-between rounded-2xl bg-secondary p-3 text-white">
                          <div className="flex items-center gap-2">
                            <IndianRupee size={16} className="text-primary" />

                            <span className="text-xs font-semibold text-white/65">
                              Converted Amount
                            </span>
                          </div>

                          <span className="font-black">
                            ₹{formatCurrency(lead.convertedAmount)}
                          </span>
                        </div>
                      ) : null}

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
                <table className="w-full min-w-262.5 text-left text-sm">
                  <thead className="border-b border-border-soft bg-secondary-soft">
                    <tr className="text-xs uppercase tracking-wider text-secondary">
                      <th className="px-5 py-4 font-black">Phone</th>
                      <th className="px-5 py-4 font-black">Service</th>
                      <th className="px-5 py-4 font-black">Requirement</th>
                      <th className="px-5 py-4 font-black">Assigned To</th>
                      <th className="px-5 py-4 font-black">Converted Amount</th>
                      <th className="px-5 py-4 font-black">Converted On</th>
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
                          <p className="font-black text-secondary">
                            {lead.phone}
                          </p>

                          <p className="mt-1 text-xs text-soft">
                            {formatLabel(lead.source)}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-dark">
                            {formatLabel(lead.serviceRequired)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <p className="line-clamp-2 max-w-md leading-6 text-muted">
                            {lead.requirementNote || lead.note || "—"}
                          </p>
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
                          <div className="flex items-center gap-1 font-black text-secondary">
                            <IndianRupee
                              size={15}
                              className="text-primary-dark"
                            />

                            {formatCurrency(lead.convertedAmount)}
                          </div>
                        </td>

                        <td className="px-5 py-4 font-medium text-muted">
                          {formatDate(lead.updatedAt)}
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
