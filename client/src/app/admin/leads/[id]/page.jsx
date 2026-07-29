"use client";

import AdminShell from "@/components/admin/AdminShell";
import { API } from "@/lib/api";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  IndianRupee,
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

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatDateForInput = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().split("T")[0];
};

const formatDateTime = (dateValue) => {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getWhatsAppNumber = (phone) => {
  const cleanedPhone = String(phone || "").replace(/\D/g, "");

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

const callStatusBadge = (status) => {
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

const InfoItem = ({ label, value, icon: Icon }) => {
  return (
    <div className="rounded-2xl border border-border-soft bg-bg-soft p-4 transition hover:border-primary/25 hover:bg-primary-soft/40">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-soft">
        {Icon ? (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary-dark">
            <Icon size={14} />
          </span>
        ) : null}

        {label}
      </div>

      <p className="break-words text-sm font-bold leading-6 text-secondary">
        {value}
      </p>
    </div>
  );
};

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params?.id;

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      const fetchedLead = data?.lead;

      if (!fetchedLead) {
        setLead(null);
        return;
      }

      setLead(fetchedLead);

      setForm({
        callStatus: fetchedLead.callStatus || "not_called",
        leadStatus: fetchedLead.leadStatus || "new",
        serviceRequired: fetchedLead.serviceRequired || "not_sure",
        requirementNote: fetchedLead.requirementNote || "",
        estimatedBudget: fetchedLead.estimatedBudget || "",
        convertedAmount: fetchedLead.convertedAmount || "",
        lostReason: fetchedLead.lostReason || "",
        followUpDate: formatDateForInput(fetchedLead.followUpDate),
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch lead");
      setLead(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leadId) {
      fetchLead();
    }
  }, [leadId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      const payload = {
        ...form,
        estimatedBudget: Number(form.estimatedBudget || 0),
        convertedAmount: Number(form.convertedAmount || 0),
        followUpDate: form.followUpDate || null,
        lostReason: form.leadStatus === "lost" ? form.lostReason : "",
      };

      const { data } = await API.put(`/api/leads/${leadId}`, payload);

      setLead(data?.lead || lead);
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

    if (!confirmDelete) {
      return;
    }

    try {
      setDeleting(true);

      await API.delete(`/api/leads/${leadId}`);

      toast.success("Lead deleted successfully");
      router.push("/admin/leads");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete lead");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <AdminShell>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
              <Loader2 className="animate-spin text-primary" size={30} />
            </div>

            <p className="text-sm font-semibold text-muted">
              Loading lead details...
            </p>
          </div>
        </div>
      </AdminShell>
    );
  }

  if (!lead) {
    return (
      <AdminShell>
        <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
          <div className="w-full rounded-[24px] border border-border-soft bg-white p-8 text-center shadow-[var(--shadow-card)] md:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
              <Phone size={28} />
            </div>

            <h1 className="mt-5 text-2xl font-black text-secondary">
              Lead not found
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted">
              This lead may have been removed or the link may be incorrect.
            </p>

            <Link href="/admin/leads" className="btn-primary mt-6">
              <ArrowLeft size={17} />
              Back to Leads
            </Link>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "var(--secondary)",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "14px",
          },
        }}
      />

      <div className="mx-auto w-full max-w-[1400px]">
        {/* Lead header */}
        <header className="mb-6 overflow-hidden rounded-[24px] border border-primary/20 bg-[linear-gradient(135deg,var(--bg-warm)_0%,var(--bg-card)_55%,var(--secondary-soft)_100%)] p-5 shadow-[var(--shadow-card)] md:mb-8 md:p-7">
          <Link
            href="/admin/leads"
            className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-muted transition hover:text-primary-dark"
          >
            <ArrowLeft size={17} />
            Back to Leads
          </Link>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-primary-dark">
                <Phone size={14} />
                Lead Detail
              </div>

              <h1 className="break-words text-3xl font-black tracking-tight text-secondary md:text-5xl">
                {lead.phone}
              </h1>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className={statusBadge(form.leadStatus)}>
                  {formatLabel(form.leadStatus)}
                </span>

                <span className={callStatusBadge(form.callStatus)}>
                  {formatLabel(form.callStatus)}
                </span>

                <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-[11px] font-black text-white">
                  {formatLabel(lead.source)}
                </span>
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-muted md:text-base">
                Update the call result, service requirement, follow-up date,
                budget and conversion details.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              <a
                href={`tel:${lead.phone}`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-border-soft bg-white px-5 text-sm font-bold text-secondary shadow-sm transition hover:border-primary/30 hover:bg-primary-soft"
              >
                <Phone size={18} />
                Call
              </a>

              <a
                href={`https://wa.me/${getWhatsAppNumber(lead.phone)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-secondary px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(35,47,62,0.2)] transition hover:bg-secondary-dark"
              >
                <Send size={18} />
                WhatsApp
              </a>
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          {/* Left information column */}
          <aside className="space-y-5">
            <section className="rounded-[24px] border border-border-soft bg-white p-5 shadow-[var(--shadow-card)] md:p-6">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-dark">
                  Overview
                </p>

                <h2 className="mt-2 text-lg font-black text-secondary">
                  Lead Information
                </h2>
              </div>

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

              <div className="mt-4 rounded-2xl border border-primary/15 bg-bg-warm p-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-primary-dark">
                  Finder Note
                </p>

                <p className="break-words text-sm leading-6 text-muted">
                  {lead.note || "No note added"}
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-primary/20 bg-bg-warm p-5 shadow-[var(--shadow-card)">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_10px_24px_rgba(255,153,0,0.25)]">
                  <IndianRupee size={21} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-dark">
                    Financials
                  </p>

                  <h3 className="mt-1 text-lg font-black text-secondary">
                    Revenue Summary
                  </h3>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border-soft bg-white p-4">
                  <p className="text-xs font-semibold text-muted">Estimated</p>

                  <p className="mt-1 wrap-break-word text-lg font-black text-secondary">
                    ₹{revenueSummary.estimated.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="rounded-2xl border border-primary/20 bg-primary-soft p-4">
                  <p className="text-xs font-semibold text-primary-dark">
                    Converted
                  </p>

                  <p className="mt-1 wrap-break-word text-lg font-black text-primary-dark">
                    ₹{revenueSummary.converted.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="col-span-2 rounded-2xl border border-border-soft bg-secondary-soft p-4">
                  <p className="text-xs font-semibold text-muted">
                    Estimated difference
                  </p>

                  <p
                    className={`mt-1 wrap-break-word text-lg font-black ${
                      revenueSummary.difference < 0
                        ? "text-danger"
                        : "text-secondary"
                    }`}
                  >
                    ₹
                    {Math.abs(revenueSummary.difference).toLocaleString(
                      "en-IN",
                    )}
                  </p>
                </div>
              </div>
            </section>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="btn-danger w-full py-3.5"
            >
              {deleting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Trash2 size={18} />
              )}

              {deleting ? "Deleting..." : "Delete Lead"}
            </button>
          </aside>

          {/* Update form */}
          <form
            onSubmit={handleUpdate}
            className="rounded-3xl border border-border-soft bg-white p-4 shadow-(--shadow-card) md:p-6"
          >
            <div className="mb-6 flex items-center gap-3 border-b border-border-soft pb-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
                <CheckCircle2 size={24} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-dark">
                  Lead Progress
                </p>

                <h2 className="mt-1 text-xl font-black text-secondary">
                  Update After Call
                </h2>

                <p className="mt-1 text-sm text-muted">
                  Keep the lead information accurate after every interaction.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="callStatus" className="form-label">
                  Call Status
                </label>

                <select
                  id="callStatus"
                  name="callStatus"
                  value={form.callStatus}
                  onChange={handleChange}
                  className="form-input min-h-12.5 font-semibold"
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
                <label htmlFor="leadStatus" className="form-label">
                  Lead Status
                </label>

                <select
                  id="leadStatus"
                  name="leadStatus"
                  value={form.leadStatus}
                  onChange={handleChange}
                  className="form-input min-h-12.5 font-semibold"
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
                <label htmlFor="serviceRequired" className="form-label">
                  Service Required
                </label>

                <select
                  id="serviceRequired"
                  name="serviceRequired"
                  value={form.serviceRequired}
                  onChange={handleChange}
                  className="form-input min-h-12.5 font-semibold"
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
                <label htmlFor="followUpDate" className="form-label">
                  Follow-up Date
                </label>

                <div className="flex min-h-12.5 items-center gap-3 rounded-[14px] border border-border-soft bg-white px-4 transition hover:border-border-medium focus-within:border-primary focus-within:shadow-[0_0_0_4px_rgba(255,153,0,0.14)]">
                  <Calendar size={18} className="shrink-0 text-primary-dark" />

                  <input
                    id="followUpDate"
                    type="date"
                    name="followUpDate"
                    value={form.followUpDate}
                    onChange={handleChange}
                    className="w-full bg-transparent text-sm font-semibold text-main outline-none color-light"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="estimatedBudget" className="form-label">
                  Estimated Budget
                </label>

                <div className="flex min-h-12.5 items-center gap-3 rounded-[14px] border border-border-soft bg-white px-4 transition hover:border-border-medium focus-within:border-primary focus-within:shadow-[0_0_0_4px_rgba(255,153,0,0.14)]">
                  <IndianRupee
                    size={18}
                    className="shrink-0 text-primary-dark"
                  />

                  <input
                    id="estimatedBudget"
                    type="number"
                    name="estimatedBudget"
                    min="0"
                    value={form.estimatedBudget}
                    onChange={handleChange}
                    placeholder="Example: 20000"
                    className="w-full bg-transparent text-sm font-semibold text-main outline-none placeholder:text-soft"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="convertedAmount" className="form-label">
                  Converted Amount
                </label>

                <div className="flex min-h-12.5 items-center gap-3 rounded-[14px] border border-border-soft bg-white px-4 transition hover:border-border-medium focus-within:border-primary focus-within:shadow-[0_0_0_4px_rgba(255,153,0,0.14)]">
                  <IndianRupee
                    size={18}
                    className="shrink-0 text-primary-dark"
                  />

                  <input
                    id="convertedAmount"
                    type="number"
                    name="convertedAmount"
                    min="0"
                    value={form.convertedAmount}
                    onChange={handleChange}
                    placeholder="Example: 18000"
                    className="w-full bg-transparent text-sm font-semibold text-main outline-none placeholder:text-soft"
                  />
                </div>
              </div>

              {form.leadStatus === "lost" && (
                <div className="md:col-span-2">
                  <label htmlFor="lostReason" className="form-label">
                    Lost Reason
                  </label>

                  <textarea
                    id="lostReason"
                    name="lostReason"
                    value={form.lostReason}
                    onChange={handleChange}
                    rows={3}
                    required
                    placeholder="Example: Budget issue, already has a developer, or not interested"
                    className="form-input"
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label
                  htmlFor="requirementNote"
                  className="form-label flex items-center gap-2"
                >
                  <FileText size={16} className="text-primary-dark" />
                  Requirement Note
                </label>

                <textarea
                  id="requirementNote"
                  name="requirementNote"
                  value={form.requirementNote}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Example: Client wants a business website with a WhatsApp button, enquiry form and SEO setup..."
                  className="form-input"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t border-border-soft pt-6">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full py-3.5 md:w-auto"
              >
                {saving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}

                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminShell>
  );
}
