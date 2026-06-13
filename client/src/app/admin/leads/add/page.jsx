"use client";

import AdminShell from "@/components/admin/AdminShell";
import { API } from "@/lib/api";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

  const crmUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/admin/leads/${leadId}`
      : "";

  const message = encodeURIComponent(
    `New lead assigned to you\n\nPhone: ${leadPhone}\nSource: ${formatLabel(
      source,
    )}\nNote: ${note || "N/A"}\n\nOpen CRM:\n${crmUrl}`,
  );

  return `https://wa.me/91${cleanedMemberPhone}?text=${message}`;
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

      const assignedUser = users.find((user) => user._id === form.assignedTo);

      if (assignedUser?.phone) {
        const whatsappLink = createWhatsAppLink({
          memberPhone: assignedUser.phone,
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

      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
          Add Lead
        </p>

        <h1 className="mt-2 text-3xl font-black md:text-4xl">Add New Number</h1>

        <p className="mt-2 text-sm text-slate-400">
          Add only phone number, source, note and assign to team member.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl rounded-3xl border border-white/10 bg-white/4 p-6"
      >
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-300">
              Phone Number *
            </label>

            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="9876543210"
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-300">
              Source
            </label>

            <select
              name="source"
              value={form.source}
              onChange={handleChange}
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none"
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
            <label className="mb-2 block text-sm font-bold text-slate-300">
              Note
            </label>

            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows={4}
              placeholder="Example: Found from Google Maps dentist listing"
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-300">
              Assigned To
            </label>

            <select
              name="assignedTo"
              value={form.assignedTo}
              onChange={handleChange}
              disabled={loadingUsers}
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
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

            {form.assignedTo ? (
              <p className="mt-2 text-xs text-emerald-300">
                Selected user ID: {form.assignedTo}
              </p>
            ) : null}

            {!loadingUsers && users.length === 0 ? (
              <p className="mt-2 text-xs text-red-300">
                No users found. Check /api/auth/users permission.
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300 disabled:opacity-60"
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
    </AdminShell>
  );
}
