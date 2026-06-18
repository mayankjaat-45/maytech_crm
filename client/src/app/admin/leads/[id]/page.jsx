"use client";

import AdminShell from "@/components/admin/AdminShell";
import { API } from "@/lib/api";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  FileText,
  Loader2,
  Phone,
  Save,
  Send,
  Tag,
  Trash2,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const formatLabel = (value) => {
  if (!value) return "—";
  return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatDateForInput = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().split("T")[0];
};

const formatDateTime = (dateValue) => {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN");
};

const statusBadge = (status) => {
  const base = "rounded-full px-3 py-1 text-[11px] font-black";

  if (status === "interested") {
    return `${base} bg-emerald-400/10 text-emerald-300`;
  }

  if (status === "converted") {
    return `${base} bg-cyan-400/10 text-cyan-300`;
  }

  if (status === "lost") {
    return `${base} bg-red-400/10 text-red-300`;
  }

  if (status === "follow_up") {
    return `${base} bg-yellow-400/10 text-yellow-300`;
  }

  if (status === "proposal_sent") {
    return `${base} bg-blue-400/10 text-blue-300`;
  }

  return `${base} bg-white/10 text-slate-300`;
};

const InfoItem = ({ label, value, icon: Icon }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        {Icon ? <Icon size={14} className="text-cyan-300" /> : null}
        {label}
      </div>

      <p className="wrap-break-word text-sm font-bold text-white">{value}</p>
    </div>
  );
};

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id;

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    callStatus: "not_called",
    leadStatus: "new",
    serviceRequired: "not_sure",
    requirementNote: "",
    estimatedBudget: "",
    convertedAmount: "",
    lostReason: "",
    followUpDate: "",
  });

  const revenueSummary = useMemo(() => {
    const estimated = Number(form.estimatedBudget || 0);
    const converted = Number(form.convertedAmount || 0);

    return {
      estimated,
      converted,
      difference: estimated - converted,
    };
  }, [form.estimatedBudget, form.convertedAmount]);

  const fetchLead = async () => {
    try {
      setLoading(true);

      const { data } = await API.get(`/api/leads/${leadId}`);

      setLead(data.lead);

      setForm({
        callStatus: data.lead.callStatus || "not_called",
        leadStatus: data.lead.leadStatus || "new",
        serviceRequired: data.lead.serviceRequired || "not_sure",
        requirementNote: data.lead.requirementNote || "",
        estimatedBudget: data.lead.estimatedBudget || "",
        convertedAmount: data.lead.convertedAmount || "",
        lostReason: data.lead.lostReason || "",
        followUpDate: formatDateForInput(data.lead.followUpDate),
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch lead");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leadId) {
      fetchLead();
    }
  }, [leadId]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const payload = {
        ...form,
        estimatedBudget: Number(form.estimatedBudget || 0),
        convertedAmount: Number(form.convertedAmount || 0),
        followUpDate: form.followUpDate || null,
      };

      const { data } = await API.put(`/api/leads/${leadId}`, payload);

      setLead(data.lead);

      toast.success("Lead updated successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update lead");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this lead?",
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/api/leads/${leadId}`);

      toast.success("Lead deleted successfully");

      router.push("/admin/leads");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete lead");
    }
  };

  if (loading) {
    return (
      <AdminShell>
        <div className="flex h-[70vh] items-center justify-center">
          <Loader2 className="animate-spin text-cyan-400" size={34} />
        </div>
      </AdminShell>
    );
  }

  if (!lead) {
    return (
      <AdminShell>
        <div className="rounded-3xl border border-white/10 bg-white/4 p-10 text-center text-slate-400">
          Lead not found.
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <Toaster position="top-right" />

      <div className="mx-auto max-w-7xl">
        <div className="mb-6 overflow-hidden rounded-3xl border border-cyan-400/20 bg-linear-to-br from-cyan-400/15 via-white/4 to-slate-950 p-5 md:mb-8 md:p-7">
          <Link
            href="/admin/leads"
            className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to Leads
          </Link>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                <Phone size={14} />
                Lead Detail
              </div>

              <h1 className="text-3xl font-black text-white md:text-5xl">
                {lead.phone}
              </h1>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className={statusBadge(form.leadStatus)}>
                  {formatLabel(form.leadStatus)}
                </span>

                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-black text-slate-300">
                  {formatLabel(form.callStatus)}
                </span>

                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-black text-slate-300">
                  {formatLabel(lead.source)}
                </span>
              </div>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Update call result, requirement, follow-up date, budget and
                conversion details.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              <a
                href={`tel:${lead.phone}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
              >
                <Phone size={18} />
                Call
              </a>

              <a
                href={`https://wa.me/91${lead.phone}`}
                target="_blank"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-emerald-300"
              >
                <Send size={18} />
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <aside className="space-y-5">
            <div className="rounded-3xl border border-white/10 bg-white/4 p-5 md:p-6">
              <h2 className="mb-5 text-lg font-black">Lead Information</h2>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <InfoItem
                  label="Phone Number"
                  value={lead.phone}
                  icon={Phone}
                />

                <InfoItem
                  label="Source"
                  value={formatLabel(lead.source)}
                  icon={Tag}
                />

                <InfoItem
                  label="Assigned To"
                  value={lead.assignedTo?.name || "Not Assigned"}
                  icon={UserRound}
                />

                <InfoItem
                  label="Added By"
                  value={lead.addedBy?.name || "—"}
                  icon={UserRound}
                />

                <InfoItem
                  label="Created At"
                  value={formatDateTime(lead.createdAt)}
                  icon={Clock}
                />

                <InfoItem
                  label="Last Contacted"
                  value={
                    lead.lastContactedAt
                      ? formatDateTime(lead.lastContactedAt)
                      : "Not contacted yet"
                  }
                  icon={Clock}
                />
              </div>

              <div className="mt-4 rounded-2xl bg-slate-950 p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Finder Note
                </p>

                <p className="text-sm leading-6 text-slate-300">
                  {lead.note || "No note added"}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/4 p-5">
              <h3 className="text-lg font-black">Revenue Summary</h3>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-950 p-4">
                  <p className="text-xs text-slate-500">Estimated</p>
                  <p className="mt-1 text-lg font-black text-white">
                    ₹{revenueSummary.estimated.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-950 p-4">
                  <p className="text-xs text-slate-500">Converted</p>
                  <p className="mt-1 text-lg font-black text-emerald-300">
                    ₹{revenueSummary.converted.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleDelete}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-3 text-sm font-black text-red-300 hover:bg-red-400/20"
            >
              <Trash2 size={18} />
              Delete Lead
            </button>
          </aside>

          <form
            onSubmit={handleUpdate}
            className="rounded-3xl border border-white/10 bg-white/4 p-4 shadow-2xl shadow-black/20 md:p-6"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                <CheckCircle2 size={24} />
              </div>

              <div>
                <h2 className="text-xl font-black">Update After Call</h2>
                <p className="text-sm text-slate-400">
                  Keep the lead status accurate after every interaction.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-300">
                  Call Status
                </label>

                <select
                  name="callStatus"
                  value={form.callStatus}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-sm font-bold outline-none focus:border-cyan-400/50 md:py-3"
                >
                  <option value="not_called">Not Called</option>
                  <option value="called">Called</option>
                  <option value="not_picked">Not Picked</option>
                  <option value="busy">Busy</option>
                  <option value="wrong_number">Wrong Number</option>
                  <option value="whatsapp_sent">WhatsApp Sent</option>
                  <option value="meeting_scheduled">Meeting Scheduled</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-300">
                  Lead Status
                </label>

                <select
                  name="leadStatus"
                  value={form.leadStatus}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-sm font-bold outline-none focus:border-cyan-400/50 md:py-3"
                >
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
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-300">
                  Service Required
                </label>

                <select
                  name="serviceRequired"
                  value={form.serviceRequired}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-sm font-bold outline-none focus:border-cyan-400/50 md:py-3"
                >
                  <option value="not_sure">Not Sure</option>
                  <option value="website_development">
                    Website Development
                  </option>
                  <option value="website_redesign">Website Redesign</option>
                  <option value="seo">SEO</option>
                  <option value="google_ads">Google Ads</option>
                  <option value="landing_page">Landing Page</option>
                  <option value="ecommerce_website">Ecommerce Website</option>
                  <option value="portfolio_website">Portfolio Website</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-300">
                  Follow-up Date
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 focus-within:border-cyan-400/50 md:py-3">
                  <Calendar size={18} className="text-slate-500" />
                  <input
                    type="date"
                    name="followUpDate"
                    value={form.followUpDate}
                    onChange={handleChange}
                    className="w-full bg-transparent text-sm font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-300">
                  Estimated Budget
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 focus-within:border-cyan-400/50 md:py-3">
                  <CircleDollarSign size={18} className="text-slate-500" />
                  <input
                    type="number"
                    name="estimatedBudget"
                    value={form.estimatedBudget}
                    onChange={handleChange}
                    placeholder="Example: 20000"
                    className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-300">
                  Converted Amount
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 focus-within:border-cyan-400/50 md:py-3">
                  <CircleDollarSign size={18} className="text-slate-500" />
                  <input
                    type="number"
                    name="convertedAmount"
                    value={form.convertedAmount}
                    onChange={handleChange}
                    placeholder="Example: 18000"
                    className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>

              {form.leadStatus === "lost" ? (
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-slate-300">
                    Lost Reason
                  </label>

                  <textarea
                    name="lostReason"
                    value={form.lostReason}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Example: Budget issue / already has developer / not interested"
                    className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-sm outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                  />
                </div>
              ) : null}

              <div className="md:col-span-2">
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-300">
                  <FileText size={16} className="text-cyan-300" />
                  Requirement Note
                </label>

                <textarea
                  name="requirementNote"
                  value={form.requirementNote}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Example: Client wants a business website with WhatsApp button, enquiry form and SEO setup..."
                  className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-sm outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-4 text-sm font-black text-slate-950 shadow-lg shadow-cyan-950/40 hover:bg-cyan-300 disabled:opacity-60 md:w-auto md:py-3"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </AdminShell>
  );
}
