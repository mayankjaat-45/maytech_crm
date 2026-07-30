"use client";

import AdminShell from "@/components/admin/AdminShell";
import { API } from "@/lib/api";
import {
  BadgeCheck,
  Download,
  FileDown,
  FileSpreadsheet,
  IndianRupee,
  Loader2,
  RefreshCcw,
  Search,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const initialFilters = {
  search: "",
  leadStatus: "",
  serviceRequired: "",
};

const formatLabel = (value) => {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatDate = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
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

const escapeCsvValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value).replaceAll('"', '""');

  if (
    stringValue.includes(",") ||
    stringValue.includes("\n") ||
    stringValue.includes('"')
  ) {
    return `"${stringValue}"`;
  }

  return stringValue;
};

const downloadCsv = (filename, rows) => {
  const csv = rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");

  const csvWithBom = `\uFEFF${csv}`;

  const blob = new Blob([csvWithBom], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
};

export default function ReportsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState(initialFilters);

  const fetchLeads = async (filterValues = filters) => {
    try {
      setLoading(true);

      const { data } = await API.get("/api/leads", {
        params: {
          search: filterValues.search.trim() || undefined,
          leadStatus: filterValues.leadStatus || undefined,
          serviceRequired: filterValues.serviceRequired || undefined,
          limit: 1000,
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

  const convertedLeads = useMemo(() => {
    return leads.filter((lead) => lead.leadStatus === "converted");
  }, [leads]);

  const totalRevenue = useMemo(() => {
    return convertedLeads.reduce(
      (sum, lead) => sum + Number(lead.convertedAmount || 0),
      0,
    );
  }, [convertedLeads]);

  const totalEstimatedBudget = useMemo(() => {
    return leads.reduce(
      (sum, lead) => sum + Number(lead.estimatedBudget || 0),
      0,
    );
  }, [leads]);

  const handleFilter = (event) => {
    event.preventDefault();
    fetchLeads(filters);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    fetchLeads(initialFilters);
  };

  const exportAllLeads = () => {
    if (leads.length === 0) {
      return;
    }

    const rows = [
      [
        "Phone",
        "Source",
        "Call Status",
        "Lead Status",
        "Service Required",
        "Assigned To",
        "Estimated Budget",
        "Converted Amount",
        "Follow Up Date",
        "Requirement Note",
        "Created At",
      ],
      ...leads.map((lead) => [
        lead.phone,
        formatLabel(lead.source),
        formatLabel(lead.callStatus),
        formatLabel(lead.leadStatus),
        formatLabel(lead.serviceRequired),
        lead.assignedTo?.name || "Not Assigned",
        lead.estimatedBudget || 0,
        lead.convertedAmount || 0,
        formatDate(lead.followUpDate),
        lead.requirementNote || lead.note || "",
        formatDate(lead.createdAt),
      ]),
    ];

    downloadCsv("maytech-crm-leads.csv", rows);
  };

  const exportConvertedLeads = () => {
    if (convertedLeads.length === 0) {
      return;
    }

    const rows = [
      [
        "Phone",
        "Source",
        "Service Required",
        "Assigned To",
        "Estimated Budget",
        "Converted Amount",
        "Converted At",
        "Requirement Note",
      ],
      ...convertedLeads.map((lead) => [
        lead.phone,
        formatLabel(lead.source),
        formatLabel(lead.serviceRequired),
        lead.assignedTo?.name || "Not Assigned",
        lead.estimatedBudget || 0,
        lead.convertedAmount || 0,
        formatDate(lead.convertedAt || lead.updatedAt),
        lead.requirementNote || lead.note || "",
      ]),
    ];

    downloadCsv("maytech-crm-converted-leads.csv", rows);
  };

  const reportCards = [
    {
      title: "Filtered Leads",
      value: leads.length,
      description: "Records matching the active filters",
      icon: Users,
    },
    {
      title: "Converted Leads",
      value: convertedLeads.length,
      description: "Successfully converted clients",
      icon: BadgeCheck,
    },
    {
      title: "Total Revenue",
      value: `₹${formatCurrency(totalRevenue)}`,
      description: "Revenue from converted leads",
      icon: IndianRupee,
      highlighted: true,
    },
    {
      title: "Estimated Budget",
      value: `₹${formatCurrency(totalEstimatedBudget)}`,
      description: "Combined estimated lead value",
      icon: FileSpreadsheet,
      highlighted: true,
    },
  ];

  return (
    <AdminShell>
      <div className="mx-auto w-full max-w-350">
        {/* Page header */}
        <header className="mb-6 overflow-hidden rounded-3xl border border-primary/20 bg-[linear-gradient(135deg,var(--bg-warm)_0%,var(--bg-card)_58%,var(--secondary-soft)_100%)] p-5 shadow-[var(--shadow-card) md:mb-8 md:p-7">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-primary-dark">
                <FileDown size={14} />
                Reports
              </div>

              <h1 className="mt-4 text-2xl font-black tracking-tight text-secondary md:text-4xl">
                Lead Reports
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted md:text-base">
                Review lead performance and export filtered lead or converted
                client data as CSV files.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchLeads(filters)}
              disabled={loading}
              className="btn-secondary w-full md:w-auto"
            >
              <RefreshCcw size={17} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </header>

        {/* Report cards */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {reportCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className={`group relative overflow-hidden rounded-[22px] border p-5 shadow-(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-(--shadow-soft)] md:p-6 ${
                  card.highlighted
                    ? "border-primary/20 bg-bg-warm"
                    : "border-border-soft bg-white"
                }`}
              >
                <div className="absolute -right-9 -top-9 h-28 w-28 rounded-full bg-primary/5 transition-transform duration-300 group-hover:scale-125" />

                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
                    <Icon size={22} />
                  </div>

                  <p className="mt-5 text-sm font-bold text-muted">
                    {card.title}
                  </p>

                  <h2 className="mt-2 wrap-break-word text-2xl font-black tracking-tight text-secondary md:text-3xl">
                    {loading ? "—" : card.value}
                  </h2>

                  <p className="mt-3 text-xs leading-5 text-soft">
                    {card.description}
                  </p>
                </div>
              </article>
            );
          })}
        </section>

        {/* Filters */}
        <form
          onSubmit={handleFilter}
          className="mb-6 grid gap-3 rounded-3xl border border-border-soft bg-white p-4 shadow-(--shadow-card)] lg:grid-cols-[minmax(240px,1fr)_220px_260px_auto] lg:p-5"
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

          <div className="grid grid-cols-2 gap-2 lg:flex">
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

        {/* Export section */}
        <section className="overflow-hidden rounded-3xl border border-border-soft bg-white shadow-(--shadow-card)]">
          <div className="flex flex-col gap-4 border-b border-border-soft p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
                <FileDown size={24} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-dark">
                  CSV Export
                </p>

                <h2 className="mt-1 text-xl font-black text-secondary">
                  Export Report Data
                </h2>

                <p className="mt-1 text-sm text-muted">
                  Download the currently filtered records.
                </p>
              </div>
            </div>

            <div className="inline-flex w-fit items-center rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary-dark">
              {leads.length} records ready
            </div>
          </div>

          {loading ? (
            <div className="flex h-52 items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
                  <Loader2 className="animate-spin text-primary" size={30} />
                </div>

                <p className="text-sm font-semibold text-muted">
                  Preparing report data...
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 bg-bg-soft p-4 md:grid-cols-2 md:p-6">
              {/* All leads export */}
              <article className="flex h-full flex-col rounded-[22px] border border-border-soft bg-white p-5 shadow-(--shadow-card)">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-white">
                    <Users size={20} />
                  </div>

                  <div>
                    <h3 className="font-black text-secondary">
                      All Filtered Leads
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-muted">
                      Includes lead status, call status, service, assignment,
                      budgets, notes and follow-up dates.
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-border-soft bg-bg-soft p-4">
                  <p className="text-xs font-semibold text-muted">
                    Records included
                  </p>

                  <p className="mt-1 text-2xl font-black text-secondary">
                    {leads.length}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={exportAllLeads}
                  disabled={leads.length === 0}
                  className="btn-primary mt-5 w-full"
                >
                  <Download size={18} />
                  Export All Leads
                </button>
              </article>

              {/* Converted leads export */}
              <article className="flex h-full flex-col rounded-[22px] border border-primary/20 bg-bg-warm p-5 shadow-(--shadow-card)">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_10px_24px_rgba(255,153,0,0.24)]">
                    <BadgeCheck size={20} />
                  </div>

                  <div>
                    <h3 className="font-black text-secondary">
                      Converted Leads
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-muted">
                      Export paying clients with their service, assignment,
                      conversion value and conversion date.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-border-soft bg-white p-4">
                    <p className="text-xs font-semibold text-muted">
                      Converted
                    </p>

                    <p className="mt-1 text-2xl font-black text-secondary">
                      {convertedLeads.length}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-primary/20 bg-primary-soft p-4">
                    <p className="text-xs font-semibold text-primary-dark">
                      Revenue
                    </p>

                    <p className="mt-1 wrap-break-word text-lg font-black text-primary-dark">
                      ₹{formatCurrency(totalRevenue)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={exportConvertedLeads}
                  disabled={convertedLeads.length === 0}
                  className="btn-secondary mt-5 w-full"
                >
                  <Download size={18} />
                  Export Converted Leads
                </button>
              </article>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
