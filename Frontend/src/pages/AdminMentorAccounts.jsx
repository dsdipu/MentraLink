import { useEffect, useState } from "react";
import { UserPlus, X } from "lucide-react";
import { createMentor, getAllMentors } from "../services/mentorService";
import { getBulkConfig } from "../services/studentService";
import Badge from "../components/ui/Badge";
import { STUDENT_ID_PATTERN } from "../utils/credentials";

const inputClass =
  "w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

const emptyForm = { name: "", mentorStudentId: "", email: "", department: "", expertise: "" };

const AdminMentorAccounts = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [domain, setDomain] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);

  const load = () =>
    getAllMentors()
      .then(setMentors)
      .catch((err) => setError(err.response?.data?.message || "Failed to load mentors"))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
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
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create mentor");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full min-w-0">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Mentor Accounts</h1>
          <p className="mt-1 text-sm text-gray-500">Create mentor accounts and see who is registered.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm((v) => !v);
            setCreated(null);
            setError("");
          }}
          className="inline-flex items-center gap-2 rounded-md bg-gray-800 px-3 py-2 text-sm text-white hover:bg-gray-900"
        >
          <UserPlus size={15} /> Add mentor
        </button>
      </div>

      {showForm && (
        <div className="mb-5 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Add a mentor</h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100"
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
              onChange={(e) =>
                setForm({ ...form, mentorStudentId: e.target.value.replace(/\D/g, "").slice(0, 9) })
              }
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
              The temporary password is the student ID. The mentor must choose their own strong
              password at first login.
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
      )}

      {!showForm && error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Loading mentors...</p>
      ) : mentors.length === 0 ? (
        <p className="text-sm text-gray-500">No mentors yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Student ID</th>
                <th className="p-3">Email</th>
                <th className="p-3">Department</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {mentors.map((mentor) => (
                <tr key={mentor._id} className="border-t">
                  <td className="p-3 font-medium">{mentor.user?.name}</td>
                  <td className="p-3">{mentor.mentorStudentId || "-"}</td>
                  <td className="p-3 text-gray-600">{mentor.user?.email}</td>
                  <td className="p-3">{mentor.department}</td>
                  <td className="p-3">
                    <Badge tone={mentor.user?.isActive && mentor.status === "ACTIVE" ? "success" : "neutral"}>
                      {mentor.user?.isActive && mentor.status === "ACTIVE" ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminMentorAccounts;
