"use client";

import AdminShell from "@/components/admin/AdminShell";
import { API } from "@/lib/api";
import {
  CheckCircle2,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Save,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const cleanPhone = (phone) => {
  return String(phone || "").replace(/\D/g, "");
};

const formatLabel = (value) => {
  if (!value) return "N/A";
  return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const createWhatsAppLink = ({
  memberPhone,
  leadPhone,
  source,
  note,
  leadId,
}) => {
  const cleanedMemberPhone = cleanPhone(memberPhone);

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

  return `https://wa.me/91${cleanedMemberPhone}?text=${encodeURIComponent(
    message,
  )}`;
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
    return users.find((user) => user._id === form.assignedTo);
  }, [users, form.assignedTo]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);

      const { data } = await API.get("/api/auth/users");

      setUsers(data.users || []);
    } catch (error) {
      console.log("USERS ERROR:", error?.response?.data || error.message);
      toast.error(error?.response?.data?.message || "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        phone: form.phone.trim(),
        source: form.source,
        note: form.note.trim(),
        assignedTo: form.assignedTo || null,
      };

      const { data } = await API.post("/api/leads", payload);

      toast.success("Lead added successfully");

      if (selectedUser?.phone) {
        const whatsappLink = createWhatsAppLink({
          memberPhone: selectedUser.phone,
          leadPhone: data.lead.phone,
          source: data.lead.source,
          note: data.lead.note,
          leadId: data.lead._id,
        });

        window.open(whatsappLink, "_blank");
      } else if (form.assignedTo) {
        toast.error("Assigned user does not have WhatsApp number saved");
      }

      router.push("/admin/leads");
    } catch (error) {
      console.log("ADD LEAD ERROR:", error?.response?.data || error.message);
      toast.error(error?.response?.data?.message || "Failed to add lead");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>
      <Toaster position="top-right" />

      <div className="mx-auto max-w-5xl">
        <div className="mb-6 overflow-hidden rounded-3xl border border-cyan-400/20 bg-linear-to-br from-cyan-400/15 via-white/4 to-slate-950 p-5 md:mb-8 md:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                <CheckCircle2 size={14} />
                Add Lead
              </div>

              <h1 className="text-2xl font-black text-white md:text-4xl">
                Add New Number
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Add phone number, source, note and assign it to a team member.
                If the member has WhatsApp number saved, notification message
                will open automatically.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Quick Flow
              </p>
              <p className="mt-2 text-sm font-bold text-white">
                Save Lead → WhatsApp Opens → Send
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-white/10 bg-white/4 p-4 shadow-2xl shadow-black/20 md:p-6"
          >
            <div className="space-y-5">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-300">
                  <Phone size={16} className="text-cyan-300" />
                  Phone Number *
                </label>

                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  inputMode="numeric"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-base font-bold text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50 md:py-3 md:text-sm"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Only phone number is required to create a basic lead.
                </p>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-300">
                  <MapPin size={16} className="text-cyan-300" />
                  Source
                </label>

                <select
                  name="source"
                  value={form.source}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-sm font-bold text-white outline-none focus:border-cyan-400/50 md:py-3"
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

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-300">
                  <MessageCircle size={16} className="text-cyan-300" />
                  Note
                </label>

                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Example: Found from Google Maps dentist listing"
                  className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-300">
                  <UserRound size={16} className="text-cyan-300" />
                  Assigned To
                </label>

                <select
                  name="assignedTo"
                  value={form.assignedTo}
                  onChange={handleChange}
                  disabled={loadingUsers}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-sm font-bold text-white outline-none disabled:cursor-not-allowed disabled:opacity-60 md:py-3"
                >
                  <option value="">
                    {loadingUsers ? "Loading users..." : "Not Assigned"}
                  </option>

                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} - {user.role?.replace("_", " ")}
                      {user.phone ? ` - ${user.phone}` : ""}
                    </option>
                  ))}
                </select>

                {!loadingUsers && users.length === 0 ? (
                  <p className="mt-2 text-xs text-red-300">
                    No users found. Check /api/auth/users permission.
                  </p>
                ) : null}
              </div>

              {selectedUser ? (
                <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-300">
                      <UserRound size={20} />
                    </div>

                    <div>
                      <p className="text-sm font-black text-emerald-300">
                        Assigned to {selectedUser.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-300">
                        Role: {formatLabel(selectedUser.role)}
                      </p>

                      <p className="mt-1 text-xs text-slate-300">
                        WhatsApp: {selectedUser.phone || "Not saved"}
                      </p>

                      {!selectedUser.phone ? (
                        <p className="mt-2 text-xs font-bold text-yellow-300">
                          WhatsApp notification will not open because phone is
                          missing.
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-4 text-sm font-black text-slate-950 shadow-lg shadow-cyan-950/40 transition hover:bg-cyan-300 disabled:opacity-60 md:py-3"
              >
                {saving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {saving ? "Saving..." : "Save Lead"}
              </button>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/4 p-5">
              <h2 className="text-lg font-black text-white">
                WhatsApp Notification
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                If assigned user has a WhatsApp number, CRM will open WhatsApp
                with a ready message after saving the lead.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-300">
                <p className="font-black text-cyan-300">Message Preview</p>
                <p className="mt-3">New lead assigned to you</p>
                <p>Phone: {form.phone || "9876543210"}</p>
                <p>Source: {formatLabel(form.source)}</p>
                <p>Note: {form.note || "N/A"}</p>
                <p>Open CRM lead: live link</p>
              </div>
            </div>

            <div className="rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-5">
              <p className="text-sm font-black text-yellow-300">
                Free WhatsApp Method
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                This opens WhatsApp with a pre-filled message. You still need to
                click Send manually.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </AdminShell>
  );
}
