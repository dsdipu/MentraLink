import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { X } from "lucide-react";
import { createMentor } from "../services/mentorService";
import { getBulkConfig } from "../services/studentService";
import { STUDENT_ID_PATTERN } from "../utils/credentials";

const inputClass =
  "w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

const emptyForm = { name: "", mentorStudentId: "", email: "", department: "", expertise: "" };

// Creates a mentor account (temporary password = student ID, changed at first login).
// Lives on the Mentor Assignment page, right next to where mentors are assigned.
function AddMentorPanel({ onClose, onDone }) {
  const [form, setForm] = useState(emptyForm);
  const [domain, setDomain] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);

  useEffect(() => {
    getBulkConfig().then((c) => setDomain(c.emailDomain || "")).catch(() => {});
  }, []);

  const suggestedEmail =
    STUDENT_ID_PATTERN.test(form.mentorStudentId) && domain ? `${form.mentorStudentId}${domain}` : "";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!STUDENT_ID_PATTERN.test(form.mentorStudentId)) {
      setError("Student ID must be exactly 9 digits");
      return;
    }

    setSaving(true);
    try {
      const result = await createMentor({
        name: form.name.trim(),
        mentorStudentId: form.mentorStudentId,
        email: form.email.trim() || undefined,
        department: form.department.trim(),
        expertise: form.expertise.trim() || undefined,
      });
      setCreated(result.temporaryCredentials);
      setForm(emptyForm);
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create mentor");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Create a mentor account</h2>
          <p className="mt-1 text-sm text-gray-500">
            After creating, pick them in "Assign Mentor" on any section below.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      {created && (
        <div className="mb-4 space-y-1 rounded-md bg-green-50 p-3 text-sm text-green-800">
          <p className="font-medium">Mentor created</p>
          <p>Login email: {created.email}</p>
          <p>Temporary password: {created.password}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Full name"
          maxLength={80}
          className={inputClass}
        />
        <input
          required
          inputMode="numeric"
          value={form.mentorStudentId}
          onChange={(e) => setForm({ ...form, mentorStudentId: e.target.value.replace(/\D/g, "").slice(0, 9) })}
          placeholder="Student ID (9 digits)"
          className={inputClass}
        />
        <input
          required
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
          placeholder="Department"
          maxLength={100}
          className={inputClass}
        />
        <input
          value={form.expertise}
          onChange={(e) => setForm({ ...form, expertise: e.target.value })}
          placeholder="Expertise (optional)"
          maxLength={150}
          className={inputClass}
        />
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder={suggestedEmail ? `Email (default: ${suggestedEmail})` : "Email (optional)"}
          className={`${inputClass} sm:col-span-2`}
        />
        <p className="rounded-md bg-blue-50 p-3 text-xs text-blue-800 sm:col-span-2">
          The temporary password is the student ID. The mentor must choose their own strong password at
          first login.
        </p>
        {error && <p className="text-sm text-red-500 sm:col-span-2">{error}</p>}
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900 disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create mentor"}
          </button>
        </div>
      </form>
    </div>
  );
}

AddMentorPanel.propTypes = { onClose: PropTypes.func.isRequired, onDone: PropTypes.func.isRequired };

export default AddMentorPanel;
