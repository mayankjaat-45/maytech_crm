"use client";

import AdminShell from "@/components/admin/AdminShell";
import { API } from "@/lib/api";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  Phone,
  Save,
  Send,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Link
            href="/admin/leads"
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to Leads
          </Link>

          <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
            Lead Detail
          </p>

          <h1 className="mt-2 text-3xl font-black md:text-4xl">{lead.phone}</h1>

          <p className="mt-2 text-sm text-slate-400">
            Update call result, requirement and follow-up details.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
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

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <aside className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-white/4 p-6">
            <h2 className="mb-5 text-lg font-black">Lead Information</h2>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-slate-500">Phone Number</p>
                <p className="mt-1 font-bold text-white">{lead.phone}</p>
              </div>

              <div>
                <p className="text-slate-500">Source</p>
                <p className="mt-1 font-bold text-white">
                  {formatLabel(lead.source)}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Assigned To</p>
                <p className="mt-1 font-bold text-white">
                  {lead.assignedTo?.name || "Not Assigned"}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Added By</p>
                <p className="mt-1 font-bold text-white">
                  {lead.addedBy?.name || "—"}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Finder Note</p>
                <p className="mt-1 rounded-2xl bg-slate-950 p-3 text-slate-300">
                  {lead.note || "No note added"}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Created At</p>
                <p className="mt-1 font-bold text-white">
                  {new Date(lead.createdAt).toLocaleString("en-IN")}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Last Contacted</p>
                <p className="mt-1 font-bold text-white">
                  {lead.lastContactedAt
                    ? new Date(lead.lastContactedAt).toLocaleString("en-IN")
                    : "Not contacted yet"}
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
          className="rounded-3xl border border-white/10 bg-white/4 p-6"
        >
          <h2 className="mb-6 text-xl font-black">Update After Call</h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">
                Call Status
              </label>

              <select
                name="callStatus"
                value={form.callStatus}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none"
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
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none"
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
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none"
              >
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
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">
                Follow-up Date
              </label>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3">
                <Calendar size={18} className="text-slate-500" />
                <input
                  type="date"
                  name="followUpDate"
                  value={form.followUpDate}
                  onChange={handleChange}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">
                Estimated Budget
              </label>

              <input
                type="number"
                name="estimatedBudget"
                value={form.estimatedBudget}
                onChange={handleChange}
                placeholder="Example: 20000"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">
                Converted Amount
              </label>

              <input
                type="number"
                name="convertedAmount"
                value={form.convertedAmount}
                onChange={handleChange}
                placeholder="Example: 18000"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-600"
              />
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
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-600"
                />
              </div>
            ) : null}

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-300">
                Requirement Note
              </label>

              <textarea
                name="requirementNote"
                value={form.requirementNote}
                onChange={handleChange}
                rows={6}
                placeholder="Example: Client wants a business website with WhatsApp button, enquiry form and SEO setup..."
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300 disabled:opacity-60 md:w-auto"
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
    </AdminShell>
  );
}
