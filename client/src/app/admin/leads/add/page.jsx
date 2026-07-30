"use client";

import AdminShell from "@/components/admin/AdminShell";
import { API } from "@/lib/api";
import {
  ArrowLeft,
  CheckCircle2,
  Info,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Save,
  Send,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const cleanPhone = (phone) => {
  return String(phone || "").replace(/\D/g, "");
};

const getWhatsAppNumber = (phone) => {
  const cleanedPhone = cleanPhone(phone);

  if (!cleanedPhone) {
    return "";
  }

  if (cleanedPhone.startsWith("91") && cleanedPhone.length > 10) {
    return cleanedPhone;
  }

  return `91${cleanedPhone}`;
};

const formatLabel = (value) => {
  if (!value) {
    return "N/A";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const createWhatsAppLink = ({
  memberPhone,
  leadPhone,
  source,
  note,
  leadId,
}) => {
  const whatsappNumber = getWhatsAppNumber(memberPhone);

  const crmBaseUrl =
    process.env.NEXT_PUBLIC_CRM_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  const crmUrl = `${crmBaseUrl}/admin/leads/${leadId}`;

  const message = [
    "New lead assigned to you",
    "",
    `Phone: ${leadPhone}`,
    `Source: ${formatLabel(source)}`,
    `Note: ${note || "N/A"}`,
    "",
    "Open CRM lead:",
    crmUrl,
  ].join("\n");

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
};

const ToastContainer = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: "var(--secondary)",
          color: "#ffffff",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "14px",
          boxShadow: "var(--shadow-medium)",
        },
        success: {
          iconTheme: {
            primary: "var(--primary)",
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
};

export default function AddLeadPage() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    phone: "",
    source: "google_maps",
    note: "",
    assignedTo: "",
  });

  const selectedUser = useMemo(() => {
    return users.find((user) => user._id === form.assignedTo) || null;
  }, [users, form.assignedTo]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);

      const { data } = await API.get("/api/auth/users");

      setUsers(data?.users || []);
    } catch (error) {
      console.log("USERS ERROR:", error?.response?.data || error?.message);

      toast.error(error?.response?.data?.message || "Failed to load users");

      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanedLeadPhone = cleanPhone(form.phone);

    if (!cleanedLeadPhone) {
      toast.error("Phone number is required");
      return;
    }

    if (cleanedLeadPhone.length < 10) {
      toast.error("Enter a valid phone number");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        phone: cleanedLeadPhone,
        source: form.source,
        note: form.note.trim(),
        assignedTo: form.assignedTo || null,
      };

      const { data } = await API.post("/api/leads", payload);
      const createdLead = data?.lead;

      if (!createdLead) {
        throw new Error("Lead was created but response data is missing");
      }

      toast.success("Lead added successfully");

      if (selectedUser?.phone) {
        const whatsappLink = createWhatsAppLink({
          memberPhone: selectedUser.phone,
          leadPhone: createdLead.phone,
          source: createdLead.source,
          note: createdLead.note,
          leadId: createdLead._id,
        });

        window.open(whatsappLink, "_blank", "noopener,noreferrer");
      } else if (form.assignedTo) {
        toast.error("Assigned user does not have a WhatsApp number saved");
      }

      router.push("/admin/leads");
    } catch (error) {
      console.log("ADD LEAD ERROR:", error?.response?.data || error?.message);

      toast.error(error?.response?.data?.message || "Failed to add lead");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>
      <ToastContainer />

      <div className="mx-auto w-full max-w-300">
        {/* Page header */}
        <header className="mb-6 overflow-hidden rounded-3xl border border-primary/20 bg-[linear-gradient(135deg,var(--bg-warm)_0%,var(--bg-card)_58%,var(--secondary-soft)_100%)] p-5 shadow-(--shadow-card) md:mb-8 md:p-7">
          <Link
            href="/admin/leads"
            className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-muted transition hover:text-primary-dark"
          >
            <ArrowLeft size={17} />
            Back to Leads
          </Link>

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-primary-dark">
                <CheckCircle2 size={14} />
                Add Lead
              </div>

              <h1 className="text-2xl font-black tracking-tight text-secondary md:text-4xl">
                Add New Number
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted md:text-base">
                Add a phone number, source and note, then assign the lead to a
                team member. A WhatsApp notification will open automatically
                when the assigned member has a saved phone number.
              </p>
            </div>

            <div className="rounded-[22px] border border-primary/20 bg-white/85 p-4 shadow-sm backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-dark">
                Quick Flow
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-black text-secondary">
                <span>Save Lead</span>
                <span className="text-primary">→</span>
                <span>WhatsApp Opens</span>
                <span className="text-primary">→</span>
                <span>Send</span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Add lead form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-border-soft bg-white p-4 shadow-(--shadow-card) md:p-6"
          >
            <div className="mb-6 flex items-start gap-3 border-b border-border-soft pb-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
                <UserRound size={23} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-dark">
                  Lead Information
                </p>

                <h2 className="mt-1 text-xl font-black text-secondary">
                  Enter lead details
                </h2>

                <p className="mt-1 text-sm leading-6 text-muted">
                  The phone number is the only required field.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="form-label flex items-center gap-2"
                >
                  <Phone size={16} className="text-primary-dark" />
                  Phone Number
                  <span className="text-danger">*</span>
                </label>

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  inputMode="numeric"
                  autoComplete="tel"
                  required
                  className="form-input min-h-12.5 text-base font-bold md:text-sm"
                />

                <p className="mt-2 text-xs leading-5 text-soft">
                  Enter the lead&apos;s mobile number without spaces or special
                  characters.
                </p>
              </div>

              {/* Source */}
              <div>
                <label
                  htmlFor="source"
                  className="form-label flex items-center gap-2"
                >
                  <MapPin size={16} className="text-primary-dark" />
                  Lead Source
                </label>

                <select
                  id="source"
                  name="source"
                  value={form.source}
                  onChange={handleChange}
                  className="form-input min-h-12.5 font-semibold"
                >
                  <option value="google_maps">Google Maps</option>
                  <option value="referral">Referral</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="website">Website</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Note */}
              <div>
                <label
                  htmlFor="note"
                  className="form-label flex items-center gap-2"
                >
                  <MessageCircle size={16} className="text-primary-dark" />
                  Finder Note
                </label>

                <textarea
                  id="note"
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Example: Found from a Google Maps dentist listing"
                  className="form-input"
                />

                <p className="mt-2 text-xs leading-5 text-soft">
                  Add useful information about where the number was found or why
                  the business may need your service.
                </p>
              </div>

              {/* Assigned user */}
              <div>
                <label
                  htmlFor="assignedTo"
                  className="form-label flex items-center gap-2"
                >
                  <UserRound size={16} className="text-primary-dark" />
                  Assigned To
                </label>

                <div className="relative">
                  <select
                    id="assignedTo"
                    name="assignedTo"
                    value={form.assignedTo}
                    onChange={handleChange}
                    disabled={loadingUsers}
                    className="form-input min-h-12.5 font-semibold disabled:cursor-not-allowed disabled:bg-bg-soft"
                  >
                    <option value="">
                      {loadingUsers
                        ? "Loading team members..."
                        : "Not Assigned"}
                    </option>

                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} - {formatLabel(user.role)}
                        {user.phone ? ` - ${user.phone}` : ""}
                      </option>
                    ))}
                  </select>

                  {loadingUsers ? (
                    <Loader2
                      size={17}
                      className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 animate-spin text-primary"
                    />
                  ) : null}
                </div>

                {!loadingUsers && users.length === 0 ? (
                  <div className="mt-3 flex items-start gap-2 rounded-2xl border border-danger/20 bg-danger-soft p-3 text-xs font-semibold leading-5 text-danger">
                    <Info size={16} className="mt-0.5 shrink-0" />

                    <span>
                      No users were found. Check access to
                      <code className="mx-1 rounded bg-white/60 px-1 py-0.5">
                        /api/auth/users
                      </code>
                      and confirm the logged-in user has permission.
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Selected user summary */}
              {selectedUser ? (
                <section className="rounded-[22px] border border-primary/20 bg-bg-warm p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_10px_24px_rgba(255,153,0,0.24)]">
                      <UserRound size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="wrap-break-word text-sm font-black text-secondary">
                        Assigned to {selectedUser.name}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-primary-soft px-3 py-1 text-[11px] font-bold text-primary-dark">
                          {formatLabel(selectedUser.role)}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                            selectedUser.phone
                              ? "bg-success-soft text-success"
                              : "bg-warning-soft text-warning"
                          }`}
                        >
                          {selectedUser.phone
                            ? selectedUser.phone
                            : "WhatsApp not saved"}
                        </span>
                      </div>

                      {selectedUser.phone ? (
                        <p className="mt-3 text-xs leading-5 text-muted">
                          A ready-to-send WhatsApp assignment message will open
                          after the lead is saved.
                        </p>
                      ) : (
                        <p className="mt-3 text-xs font-semibold leading-5 text-warning">
                          The lead will be assigned, but the WhatsApp message
                          cannot open because this member has no saved phone
                          number.
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              ) : null}

              {/* Submit */}
              <div className="border-t border-border-soft pt-5">
                <button
                  type="submit"
                  disabled={saving || loadingUsers}
                  className="btn-primary w-full py-3.5"
                >
                  {saving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}

                  {saving ? "Saving Lead..." : "Save Lead"}
                </button>
              </div>
            </div>
          </form>

          {/* Right information column */}
          <aside className="space-y-4">
            <section className="rounded-3xl border border-border-soft bg-white p-5 shadow-(--shadow-card)">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-white">
                  <Send size={20} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-dark">
                    Assignment
                  </p>

                  <h2 className="mt-1 text-lg font-black text-secondary">
                    WhatsApp Notification
                  </h2>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-muted">
                When the assigned team member has a saved phone number, the CRM
                opens WhatsApp with a prepared lead-assignment message.
              </p>

              <div className="mt-5 overflow-hidden rounded-[20px] border border-border-soft bg-bg-soft">
                <div className="border-b border-border-soft bg-secondary-soft px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-secondary">
                    Message Preview
                  </p>
                </div>

                <div className="space-y-1 p-4 text-xs leading-6 text-muted">
                  <p className="font-black text-secondary">
                    New lead assigned to you
                  </p>

                  <div className="my-2 h-px bg-border-soft" />

                  <p>
                    <span className="font-bold text-secondary">Phone:</span>{" "}
                    {form.phone || "9876543210"}
                  </p>

                  <p>
                    <span className="font-bold text-secondary">Source:</span>{" "}
                    {formatLabel(form.source)}
                  </p>

                  <p className="wrap-break-word">
                    <span className="font-bold text-secondary">Note:</span>{" "}
                    {form.note || "N/A"}
                  </p>

                  <p>
                    <span className="font-bold text-secondary">
                      Open CRM lead:
                    </span>{" "}
                    Live link
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-primary/20 bg-bg-warm p-5 shadow-(--shadow-card)">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
                  <MessageCircle size={19} />
                </div>

                <div>
                  <p className="text-sm font-black text-secondary">
                    Free WhatsApp Method
                  </p>

                  <p className="mt-2 text-sm leading-6 text-muted">
                    This feature opens WhatsApp with a pre-filled message. The
                    user must still review the message and click Send manually.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-border-soft bg-secondary p-5 text-white shadow-[(--shadow-card)]">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                Before Saving
              </p>

              <ul className="mt-4 space-y-3 text-sm leading-6 text-white/75">
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={16}
                    className="mt-1 shrink-0 text-primary"
                  />
                  Confirm that the lead phone number is correct.
                </li>

                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={16}
                    className="mt-1 shrink-0 text-primary"
                  />
                  Add a useful finder note for the assigned member.
                </li>

                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={16}
                    className="mt-1 shrink-0 text-primary"
                  />
                  Check that the assigned member has a saved phone number.
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </AdminShell>
  );
}
