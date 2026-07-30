"use client";

import AdminShell from "@/components/admin/AdminShell";
import { API } from "@/lib/api";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardPaste,
  FileText,
  Info,
  Loader2,
  MapPin,
  Send,
  Upload,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const formatLabel = (value) => {
  if (!value) {
    return "N/A";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const cleanNumber = (value) => {
  return String(value || "").replace(/\D/g, "");
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
      .split(/[\n,\s;]+/)
      .map((item) => cleanNumber(item))
      .filter(Boolean);
  }, [form.numbersText]);

  const uniqueNumbers = useMemo(() => {
    return [...new Set(numbers)];
  }, [numbers]);

  const duplicateCount = numbers.length - uniqueNumbers.length;

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

    if (uniqueNumbers.length === 0) {
      toast.error("Please paste at least one phone number");
      return;
    }

    try {
      setSaving(true);

      const { data } = await API.post("/api/leads/bulk", {
        numbers: uniqueNumbers,
        source: form.source,
        note: form.note.trim(),
        assignedTo: form.assignedTo || null,
      });

      toast.success(
        `Created: ${data?.created || 0}, Duplicates: ${
          data?.duplicates || 0
        }, Invalid: ${data?.invalid || 0}`,
      );

      setTimeout(() => {
        router.push("/admin/leads");
      }, 900);
    } catch (error) {
      console.log(
        "BULK UPLOAD ERROR:",
        error?.response?.data || error?.message,
      );

      toast.error(error?.response?.data?.message || "Bulk upload failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>
      <ToastContainer />

      <div className="mx-auto w-full max-w-312.5">
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
                <Upload size={14} />
                Bulk Upload
              </div>

              <h1 className="text-2xl font-black tracking-tight text-secondary md:text-4xl">
                Upload Multiple Numbers
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted md:text-base">
                Paste phone numbers collected from Google Maps, referrals,
                WhatsApp or any other source and create multiple leads at once.
              </p>
            </div>

            <div className="rounded-[22px] border border-primary/20 bg-white/85 p-4 shadow-sm backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-dark">
                Upload Flow
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-black text-secondary">
                <span>Paste Numbers</span>
                <span className="text-primary">→</span>
                <span>Remove Duplicates</span>
                <span className="text-primary">→</span>
                <span>Create Leads</span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* Upload form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-border-soft bg-white p-4 shadow-(--shadow-card) md:p-6"
          >
            <div className="mb-6 flex items-start gap-3 border-b border-border-soft pb-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
                <ClipboardPaste size={23} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-dark">
                  Lead Numbers
                </p>

                <h2 className="mt-1 text-xl font-black text-secondary">
                  Paste your phone numbers
                </h2>

                <p className="mt-1 text-sm leading-6 text-muted">
                  Numbers can be separated by lines, spaces, commas or
                  semicolons.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Numbers */}
              <div>
                <label
                  htmlFor="numbersText"
                  className="form-label flex items-center gap-2"
                >
                  <Users size={16} className="text-primary-dark" />
                  Paste Numbers
                  <span className="text-danger">*</span>
                </label>

                <textarea
                  id="numbersText"
                  name="numbersText"
                  value={form.numbersText}
                  onChange={handleChange}
                  rows={12}
                  required
                  placeholder={`9876543210
9876543211
9876543212

You can also paste comma-separated numbers.`}
                  className="form-input min-h-70 font-mono text-sm leading-7"
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-secondary-soft px-3 py-1 text-[11px] font-bold text-secondary">
                    Total found: {numbers.length}
                  </span>

                  <span className="rounded-full bg-primary-soft px-3 py-1 text-[11px] font-bold text-primary-dark">
                    Unique: {uniqueNumbers.length}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                      duplicateCount > 0
                        ? "bg-warning-soft text-warning"
                        : "bg-success-soft text-success"
                    }`}
                  >
                    Duplicates: {duplicateCount}
                  </span>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {/* Source */}
                <div>
                  <label
                    htmlFor="source"
                    className="form-label flex items-center gap-2"
                  >
                    <MapPin size={16} className="text-primary-dark" />
                    Source
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

                {/* Assignment */}
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
                      No team members were found.
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Note */}
              <div>
                <label
                  htmlFor="note"
                  className="form-label flex items-center gap-2"
                >
                  <FileText size={16} className="text-primary-dark" />
                  Common Note
                </label>

                <textarea
                  id="note"
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Example: Numbers collected from Google Maps dentist listings"
                  className="form-input"
                />

                <p className="mt-2 text-xs leading-5 text-soft">
                  This note will be added to every lead created through this
                  upload.
                </p>
              </div>

              {/* Selected member */}
              {selectedUser ? (
                <section className="rounded-[22px] border border-primary/20 bg-bg-warm p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_10px_24px_rgba(255,153,0,0.24)]">
                      <UserRound size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="wrap-break-word text-sm font-black text-secondary">
                        Leads will be assigned to {selectedUser.name}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-primary-soft px-3 py-1 text-[11px] font-bold text-primary-dark">
                          {formatLabel(selectedUser.role)}
                        </span>

                        {selectedUser.phone ? (
                          <span className="rounded-full bg-success-soft px-3 py-1 text-[11px] font-bold text-success">
                            {selectedUser.phone}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </section>
              ) : null}

              {/* Submit */}
              <div className="border-t border-border-soft pt-5">
                <button
                  type="submit"
                  disabled={saving || uniqueNumbers.length === 0}
                  className="btn-primary w-full py-3.5 md:w-auto"
                >
                  {saving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Upload size={18} />
                  )}

                  {saving
                    ? "Uploading Numbers..."
                    : `Upload ${uniqueNumbers.length || ""} ${
                        uniqueNumbers.length === 1 ? "Number" : "Numbers"
                      }`}
                </button>
              </div>
            </div>
          </form>

          {/* Summary sidebar */}
          <aside className="space-y-5">
            <section className="rounded-3xl border border-border-soft bg-white p-5 shadow-(--shadow-card)">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-white">
                  <Users size={20} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-dark">
                    Current List
                  </p>

                  <h2 className="mt-1 text-lg font-black text-secondary">
                    Upload Summary
                  </h2>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border-soft bg-bg-soft p-4">
                  <p className="text-xs font-semibold text-muted">
                    Total Found
                  </p>

                  <p className="mt-2 text-3xl font-black text-secondary">
                    {numbers.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-primary/20 bg-primary-soft p-4">
                  <p className="text-xs font-semibold text-primary-dark">
                    Unique
                  </p>

                  <p className="mt-2 text-3xl font-black text-primary-dark">
                    {uniqueNumbers.length}
                  </p>
                </div>

                <div className="col-span-2 rounded-2xl border border-warning/20 bg-warning-soft p-4">
                  <p className="text-xs font-semibold text-warning">
                    Duplicate entries removed
                  </p>

                  <p className="mt-2 text-2xl font-black text-warning">
                    {duplicateCount}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-primary/20 bg-bg-warm p-5 shadow-(--shadow-card)">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
                  <ClipboardPaste size={19} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary-dark">
                    Accepted Format
                  </p>

                  <h3 className="mt-1 font-black text-secondary">
                    Format Example
                  </h3>
                </div>
              </div>

              <pre className="mt-5 overflow-x-auto rounded-2xl border border-border-soft bg-white p-4 font-mono text-xs leading-7 text-secondary">
                {`9876543210
9876543211
9876543212`}
              </pre>

              <p className="mt-4 text-sm leading-6 text-muted">
                Paste numbers line by line, comma-separated, space-separated or
                semicolon-separated.
              </p>
            </section>

            <section className="rounded-3xl border border-border-soft bg-secondary p-5 text-white shadow-(--shadow-card)">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                Before Uploading
              </p>

              <div className="mt-4 space-y-3 text-sm leading-6 text-white/75">
                <div className="flex items-start gap-2">
                  <CheckCircle2
                    size={16}
                    className="mt-1 shrink-0 text-primary"
                  />
                  Duplicate numbers in the pasted list are removed
                  automatically.
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2
                    size={16}
                    className="mt-1 shrink-0 text-primary"
                  />
                  Existing CRM numbers may be reported as duplicates by the
                  server.
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2
                    size={16}
                    className="mt-1 shrink-0 text-primary"
                  />
                  The selected source, note and team member apply to every
                  created lead.
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AdminShell>
  );
}
