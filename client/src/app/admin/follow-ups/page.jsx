"use client";

import AdminShell from "@/components/admin/AdminShell";
import { API } from "@/lib/api";
import {
  CalendarClock,
  CalendarDays,
  Eye,
  Loader2,
  Phone,
  RefreshCcw,
  Send,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const followUpTypes = [
  {
    label: "Today",
    value: "today",
    description: "Calls scheduled for today",
  },
  {
    label: "Pending",
    value: "pending",
    description: "Overdue follow-up calls",
  },
  {
    label: "Upcoming",
    value: "upcoming",
    description: "Future follow-up calls",
  },
];

const formatLabel = (value) => {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatDate = (dateValue) => {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

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

const leadStatusBadge = (status) => {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black";

  switch (status) {
    case "interested":
      return `${base} bg-success-soft text-success`;

    case "follow_up":
      return `${base} bg-warning-soft text-warning`;

    case "proposal_sent":
    case "contacted":
    case "requirement_asked":
      return `${base} bg-info-soft text-info`;

    case "lost":
    case "not_interested":
    case "invalid_number":
      return `${base} bg-danger-soft text-danger`;

    case "converted":
      return `${base} bg-primary-soft text-primary-dark`;

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

export default function FollowUpsPage() {
  const [type, setType] = useState("today");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowUps = async () => {
    try {
      setLoading(true);

      const { data } = await API.get("/api/leads/follow-ups", {
        params: { type },
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
    fetchFollowUps();
  }, [type]);

  const activeType =
    followUpTypes.find((item) => item.value === type) || followUpTypes[0];

  return (
    <AdminShell>
      <div className="mx-auto w-full max-w-350">
        {/* Page header */}
        <header className="mb-6 overflow-hidden rounded-3xl border border-primary/20 bg-[linear-gradient(135deg,var(--bg-warm)_0%,var(--bg-card)_58%,var(--secondary-soft)_100%)] p-5 shadow-[var(--shadow-card) md:mb-8 md:p-7">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-primary-dark">
                <CalendarClock size={14} />
                Follow-ups
              </div>

              <h1 className="mt-4 text-2xl font-black tracking-tight text-secondary md:text-4xl">
                Follow-up Calls
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted md:text-base">
                Track today&apos;s calls, pending follow-ups and upcoming lead
                conversations.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchFollowUps}
              disabled={loading}
              className="btn-secondary w-full md:w-auto"
            >
              <RefreshCcw size={17} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </header>

        {/* Follow-up tabs */}
        <section className="mb-6 grid grid-cols-3 gap-2 rounded-[22px] border border-border-soft bg-white p-2 shadow-[var(--shadow-card) md:gap-3 md:p-3">
          {followUpTypes.map((item) => {
            const active = type === item.value;

            return (
              <button
                type="button"
                key={item.value}
                onClick={() => setType(item.value)}
                disabled={loading && type === item.value}
                className={`rounded-2xl px-3 py-3 text-center transition-all duration-200 md:px-5 md:py-4 ${
                  active
                    ? "bg-primary text-white shadow-[0_12px_28px_rgba(255,153,0,0.24)]"
                    : "border border-transparent bg-bg-soft text-secondary hover:border-primary/20 hover:bg-primary-soft"
                }`}
              >
                <span className="block text-xs font-black md:text-sm">
                  {item.label}
                </span>

                <span
                  className={`mt-1 hidden text-[11px] sm:block ${
                    active ? "text-white/75" : "text-muted"
                  }`}
                >
                  {item.description}
                </span>
              </button>
            );
          })}
        </section>

        {/* Follow-up leads */}
        <section className="overflow-hidden rounded-3xl border border-border-soft bg-white shadow-(--shadow-card)">
          <div className="flex flex-col gap-4 border-b border-border-soft p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
                <CalendarClock size={23} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-dark">
                  {activeType.label}
                </p>

                <h2 className="mt-1 text-lg font-black text-secondary md:text-xl">
                  {formatLabel(type)} Follow-ups
                </h2>

                <p className="mt-1 text-sm text-muted">
                  {activeType.description}
                </p>
              </div>
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
                  Loading follow-ups...
                </p>
              </div>
            </div>
          ) : leads.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
                <CalendarClock size={28} />
              </div>

              <h3 className="mt-4 text-lg font-black text-secondary">
                No {type} follow-ups
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
                There are currently no leads in the{" "}
                {formatLabel(type).toLowerCase()} follow-up list.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="grid gap-4 bg-bg-soft p-4 md:hidden">
                {leads.map((lead) => (
                  <article
                    key={lead._id}
                    className="group relative overflow-hidden rounded-[22px] border border-border-soft bg-white p-4 shadow-[var(--shadow-card)"
                  >
                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary-soft transition-transform duration-300 group-hover:scale-110" />

                    <div className="relative">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-soft">
                            Lead Phone
                          </p>

                          <h3 className="mt-1 wrap-break-word text-xl font-black text-secondary">
                            {lead.phone}
                          </h3>
                        </div>

                        <span className={leadStatusBadge(lead.leadStatus)}>
                          {formatLabel(lead.leadStatus)}
                        </span>
                      </div>

                      <div className="mt-4 rounded-2xl border border-primary/15 bg-bg-warm p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-primary-dark">
                          Requirement
                        </p>

                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
                          {lead.requirementNote || lead.note || "No note added"}
                        </p>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-border-soft bg-bg-soft p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-soft">
                            Follow-up Date
                          </p>

                          <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-secondary">
                            <CalendarDays
                              size={14}
                              className="shrink-0 text-primary-dark"
                            />

                            <span>{formatDate(lead.followUpDate)}</span>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-border-soft bg-bg-soft p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-soft">
                            Call Status
                          </p>

                          <div className="mt-2">
                            <span className={callStatusBadge(lead.callStatus)}>
                              {formatLabel(lead.callStatus)}
                            </span>
                          </div>
                        </div>

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
                            Assigned To
                          </p>

                          <div className="mt-1 flex items-center gap-1.5">
                            <UserRound
                              size={14}
                              className="shrink-0 text-primary-dark"
                            />

                            <p className="truncate text-sm font-bold text-secondary">
                              {lead.assignedTo?.name || "Not Assigned"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <a
                          href={`tel:${lead.phone}`}
                          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border border-border-soft bg-white px-2 text-xs font-black text-secondary transition hover:border-primary/30 hover:bg-primary-soft"
                          aria-label={`Call ${lead.phone}`}
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
                          aria-label={`WhatsApp ${lead.phone}`}
                        >
                          <Send size={15} />
                          WA
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

              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-262.5 text-left text-sm">
                  <thead className="border-b border-border-soft bg-secondary-soft">
                    <tr className="text-xs uppercase tracking-wider text-secondary">
                      <th className="px-5 py-4 font-black">Phone</th>
                      <th className="px-5 py-4 font-black">Follow-up Date</th>
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
                          <p className="font-black text-secondary">
                            {lead.phone}
                          </p>

                          <p className="mt-1 line-clamp-1 max-w-60 text-xs text-soft">
                            {lead.requirementNote || lead.note || "No note"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 font-bold text-secondary">
                            <CalendarDays
                              size={16}
                              className="shrink-0 text-primary-dark"
                            />

                            {formatDate(lead.followUpDate)}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className={callStatusBadge(lead.callStatus)}>
                            {formatLabel(lead.callStatus)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className={leadStatusBadge(lead.leadStatus)}>
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
