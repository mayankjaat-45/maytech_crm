"use client";

import AdminShell from "@/components/admin/AdminShell";
import { API } from "@/lib/api";
import { Download, FileDown, Loader2, RefreshCcw, Search } from "lucide-react";
import { useEffect, useState } from "react";

const formatLabel = (value) => {
  if (!value) return "";
  return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatDate = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-IN");
};

const escapeCsvValue = (value) => {
  if (value === null || value === undefined) return "";

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

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};

export default function ReportsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    leadStatus: "",
    serviceRequired: "",
  });

  const fetchLeads = async () => {
    try {
      setLoading(true);

      const { data } = await API.get("/api/leads", {
        params: {
          search: filters.search || undefined,
          leadStatus: filters.leadStatus || undefined,
          serviceRequired: filters.serviceRequired || undefined,
          limit: 1000,
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

  const handleFilter = (e) => {
    e.preventDefault();
    fetchLeads();
  };

  const exportAllLeads = () => {
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
    const convertedLeads = leads.filter(
      (lead) => lead.leadStatus === "converted",
    );

    const rows = [
      [
        "Phone",
        "Service Required",
        "Assigned To",
        "Estimated Budget",
        "Converted Amount",
        "Converted At",
        "Requirement Note",
      ],
      ...convertedLeads.map((lead) => [
        lead.phone,
        formatLabel(lead.serviceRequired),
        lead.assignedTo?.name || "Not Assigned",
        lead.estimatedBudget || 0,
        lead.convertedAmount || 0,
        formatDate(lead.convertedAt || lead.updatedAt),
        lead.requirementNote || "",
      ]),
    ];

    downloadCsv("maytech-crm-converted-leads.csv", rows);
  };

  const totalRevenue = leads.reduce(
    (sum, lead) => sum + Number(lead.convertedAmount || 0),
    0,
  );

  const convertedCount = leads.filter(
    (lead) => lead.leadStatus === "converted",
  ).length;

  return (
    <AdminShell>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
            Reports
          </p>

          <h1 className="mt-2 text-3xl font-black md:text-4xl">Lead Reports</h1>

          <p className="mt-2 text-sm text-slate-400">
            Export leads and converted clients as CSV files.
          </p>
        </div>

        <button
          onClick={fetchLeads}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
        >
          <RefreshCcw size={17} />
          Refresh
        </button>
      </div>

      <section className="mb-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-white/4 p-6">
          <p className="text-sm font-semibold text-slate-400">Total Leads</p>
          <h2 className="mt-2 text-4xl font-black">{leads.length}</h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/4 p-6">
          <p className="text-sm font-semibold text-slate-400">
            Converted Leads
          </p>
          <h2 className="mt-2 text-4xl font-black">{convertedCount}</h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/4 p-6">
          <p className="text-sm font-semibold text-slate-400">Revenue</p>
          <h2 className="mt-2 text-4xl font-black">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/4 p-6">
          <p className="text-sm font-semibold text-slate-400">Export Ready</p>
          <h2 className="mt-2 text-4xl font-black">CSV</h2>
        </div>
      </section>

      <form
        onSubmit={handleFilter}
        className="mb-6 grid gap-3 rounded-3xl border border-white/10 bg-white/4 p-4 lg:grid-cols-[1fr_220px_260px_auto]"
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
          value={filters.leadStatus}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, leadStatus: e.target.value }))
          }
          className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="interested">Interested</option>
          <option value="follow_up">Follow Up</option>
          <option value="proposal_sent">Proposal Sent</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </select>

        <select
          value={filters.serviceRequired}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              serviceRequired: e.target.value,
            }))
          }
          className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none"
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

        <button className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950">
          Filter
        </button>
      </form>

      <section className="rounded-3xl border border-white/10 bg-white/4 p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
            <FileDown size={24} />
          </div>

          <div>
            <h2 className="text-xl font-black">Export Data</h2>
            <p className="text-sm text-slate-400">
              Download filtered lead data for backup or reporting.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportAllLeads}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300"
            >
              <Download size={18} />
              Export All Leads
            </button>

            <button
              onClick={exportConvertedLeads}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
            >
              <Download size={18} />
              Export Converted Leads
            </button>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
