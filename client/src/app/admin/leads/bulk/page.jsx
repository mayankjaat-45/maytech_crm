"use client";

import AdminShell from "@/components/admin/AdminShell";
import { API } from "@/lib/api";
import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function BulkUploadLeadsPage() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    numbersText: "",
    source: "google_maps",
    note: "",
    assignedTo: "",
  });

  const numbers = useMemo(() => {
    return form.numbersText
      .split(/[\n, ]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }, [form.numbersText]);

  const uniqueNumbers = useMemo(() => {
    return [...new Set(numbers)];
  }, [numbers]);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get("/auth/users");
      setUsers(data.users || []);
    } catch (error) {
      console.log(error?.response?.data || error.message);
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (uniqueNumbers.length === 0) {
      toast.error("Please paste at least one number");
      return;
    }

    try {
      setSaving(true);

      const { data } = await API.post("/leads/bulk", {
        numbers: uniqueNumbers,
        source: form.source,
        note: form.note,
        assignedTo: form.assignedTo || null,
      });

      toast.success(
        `Created: ${data.created}, Duplicates: ${data.duplicates}, Invalid: ${data.invalid}`,
      );

      setTimeout(() => {
        router.push("/admin/leads");
      }, 900);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Bulk upload failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>
      <Toaster position="top-right" />

      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
          Bulk Upload
        </p>
        <h1 className="mt-2 text-3xl font-black md:text-4xl">
          Upload Multiple Numbers
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Paste numbers from Google Maps, referrals, WhatsApp or any other
          source.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/4 p-6"
        >
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">
                Paste Numbers *
              </label>

              <textarea
                name="numbersText"
                value={form.numbersText}
                onChange={handleChange}
                rows={12}
                placeholder={`9876543210
9876543211
9876543212

You can also paste comma separated numbers.`}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-600"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
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
                  Assigned To
                </label>

                <select
                  name="assignedTo"
                  value={form.assignedTo}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none"
                >
                  <option value="">Not Assigned</option>

                  {loadingUsers ? (
                    <option disabled>Loading users...</option>
                  ) : (
                    users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} - {user.role.replace("_", " ")}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">
                Common Note
              </label>

              <textarea
                name="note"
                value={form.note}
                onChange={handleChange}
                rows={4}
                placeholder="Example: Numbers collected from Google Maps dentist listings"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-600"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300 disabled:opacity-60 md:w-auto"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Upload size={18} />
              )}
              {saving ? "Uploading..." : "Upload Numbers"}
            </button>
          </div>
        </form>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-white/4 p-6">
            <h2 className="text-lg font-black">Upload Summary</h2>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-slate-950 p-4">
                <p className="text-sm text-slate-400">Total Found</p>
                <p className="mt-1 text-3xl font-black">{numbers.length}</p>
              </div>

              <div className="rounded-2xl bg-slate-950 p-4">
                <p className="text-sm text-slate-400">Unique Numbers</p>
                <p className="mt-1 text-3xl font-black">
                  {uniqueNumbers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-6">
            <h3 className="font-black text-cyan-300">Format Example</h3>

            <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-300">
              {`9876543210
9876543211
9876543212`}
            </pre>

            <p className="mt-4 text-sm text-slate-400">
              You can paste numbers line by line, comma separated, or space
              separated.
            </p>
          </div>
        </aside>
      </div>
    </AdminShell>
  );
}
