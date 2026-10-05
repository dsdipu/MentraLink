import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Download, X } from "lucide-react";
import {
  bulkCreateStudents,
  createStudent,
  getBulkConfig,
} from "../services/studentService";
import {
  MAX_BULK,
  STUDENT_ID_PATTERN,
  countRange,
  credentialsToCsv,
  downloadTextFile,
} from "../utils/credentials";

const inputClass =
  "w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

const PanelShell = ({ title, onClose, children }) => (
  <div className="mb-5 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <button
        type="button"
        onClick={onClose}
        className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        aria-label="Close"
      >
        <X size={18} />
      </button>
    </div>
    {children}
  </div>
);

PanelShell.propTypes = {
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
};

const TempPasswordNote = () => (
  <p className="rounded-md bg-blue-50 p-3 text-xs text-blue-800">
    Login email is the student ID plus the university domain, and the temporary password is the
    student ID. Students are asked to choose their own strong password the first time they log in.
  </p>
);

// ---------------- one student ----------------
export function AddStudentPanel({ onClose, onDone }) {
  const [form, setForm] = useState({ name: "", studentId: "", email: "", department: "" });
  const [domain, setDomain] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);

  useEffect(() => {
    getBulkConfig().then((c) => setDomain(c.emailDomain || "")).catch(() => {});
  }, []);

  const suggestedEmail =
    STUDENT_ID_PATTERN.test(form.studentId) && domain ? `${form.studentId}${domain}` : "";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!STUDENT_ID_PATTERN.test(form.studentId)) {
      setError("Student ID must be exactly 9 digits");
      return;
    }

    setSaving(true);
    try {
      const result = await createStudent({
        name: form.name.trim(),
        studentId: form.studentId,
        email: form.email.trim() || undefined,
        department: form.department.trim(),
      });
      setCreated(result.temporaryCredentials);
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create student");
    } finally {
      setSaving(false);
    }
  };

  if (created) {
    return (
      <PanelShell title="Student created" onClose={onClose}>
        <div className="space-y-1 rounded-md bg-green-50 p-3 text-sm text-green-800">
          <p>
            <span className="font-medium">Login email:</span> {created.email}
          </p>
          <p>
            <span className="font-medium">Temporary password:</span> {created.password}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreated(null);
            setForm({ name: "", studentId: "", email: "", department: "" });
          }}
          className="mt-3 text-sm text-blue-600 hover:underline"
        >
          Add another student
        </button>
      </PanelShell>
    );
  }

  return (
    <PanelShell title="Add a student" onClose={onClose}>
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
          value={form.studentId}
          onChange={(e) => setForm({ ...form, studentId: e.target.value.replace(/\D/g, "").slice(0, 9) })}
          placeholder="Student ID (9 digits)"
          className={inputClass}
        />
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder={suggestedEmail ? `Email (default: ${suggestedEmail})` : "Email (optional)"}
          className={inputClass}
        />
        <input
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
          placeholder="Department (optional)"
          maxLength={100}
          className={inputClass}
        />
        <div className="sm:col-span-2">
          <TempPasswordNote />
        </div>
        {error && <p className="text-sm text-red-500 sm:col-span-2">{error}</p>}
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900 disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create student"}
          </button>
        </div>
      </form>
    </PanelShell>
  );
}

AddStudentPanel.propTypes = { onClose: PropTypes.func.isRequired, onDone: PropTypes.func.isRequired };

// ---------------- many students from an ID range ----------------
const ResultList = ({ title, rows, tone }) =>
  rows.length > 0 && (
    <details className="rounded-md border border-gray-200 bg-white">
      <summary className={`cursor-pointer px-3 py-2 text-sm font-medium ${tone}`}>
        {title} ({rows.length})
      </summary>
      <div className="max-h-48 overflow-y-auto border-t border-gray-100 px-3 py-2 text-xs text-gray-600">
        {rows.map((row) => (
          <div key={row.studentId} className="flex justify-between gap-3 py-0.5">
            <span>{row.studentId}</span>
            <span className="truncate text-gray-400">{row.email || row.reason}</span>
          </div>
        ))}
      </div>
    </details>
  );

ResultList.propTypes = {
  title: PropTypes.string.isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  tone: PropTypes.string,
};

export function BulkStudentsPanel({ onClose, onDone }) {
  const [startId, setStartId] = useState("");
  const [endId, setEndId] = useState("");
  const [department, setDepartment] = useState("");
  const [domain, setDomain] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    getBulkConfig().then((c) => setDomain(c.emailDomain || "")).catch(() => {});
  }, []);

  const count = countRange(startId, endId);
  const rangeProblem =
    startId.length === 9 && endId.length === 9
      ? count === null
        ? "Start ID must not be greater than end ID"
        : count > MAX_BULK
          ? `A single request can create at most ${MAX_BULK} accounts`
          : ""
      : "";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (count === null || count > MAX_BULK) {
      setError(rangeProblem || "Enter a valid start and end ID (9 digits each)");
      return;
    }
    if (!domain.trim()) {
      setError("Email domain is required (for example @diu.edu.bd)");
      return;
    }

    setSaving(true);
    try {
      const data = await bulkCreateStudents({
        startId,
        endId,
        department: department.trim(),
        emailDomain: domain.trim(),
      });
      setResult(data);
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create accounts");
    } finally {
      setSaving(false);
    }
  };

  if (result) {
    const { summary } = result;
    return (
      <PanelShell title="Bulk creation finished" onClose={onClose}>
        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ["Requested", summary.requested, "text-gray-800"],
            ["Created", summary.created, "text-green-700"],
            ["Skipped (already exist)", summary.skipped, "text-amber-700"],
            ["Failed", summary.failed, "text-red-600"],
          ].map(([label, value, tone]) => (
            <div key={label} className="rounded-md bg-gray-50 p-3 text-center">
              <p className={`text-xl font-semibold ${tone}`}>{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <ResultList title="Created accounts" rows={result.created} tone="text-green-700" />
          <ResultList title="Skipped, already registered" rows={result.skipped} tone="text-amber-700" />
          <ResultList title="Failed" rows={result.failed} tone="text-red-600" />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {result.created.length > 0 && (
            <button
              type="button"
              onClick={() =>
                downloadTextFile(`student-credentials-${startId}-${endId}.csv`, credentialsToCsv(result.created))
              }
              className="inline-flex items-center gap-2 rounded-md bg-gray-800 px-3 py-2 text-sm text-white hover:bg-gray-900"
            >
              <Download size={15} /> Download credentials (CSV)
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setStartId("");
              setEndId("");
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            Create another range
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-400">{result.note}</p>
      </PanelShell>
    );
  }

  return (
    <PanelShell title="Create students from an ID range" onClose={onClose}>
      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
        <input
          required
          inputMode="numeric"
          value={startId}
          onChange={(e) => setStartId(e.target.value.replace(/\D/g, "").slice(0, 9))}
          placeholder="From ID, e.g. 262034001"
          className={inputClass}
        />
        <input
          required
          inputMode="numeric"
          value={endId}
          onChange={(e) => setEndId(e.target.value.replace(/\D/g, "").slice(0, 9))}
          placeholder="To ID, e.g. 262034035"
          className={inputClass}
        />
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="Email domain, e.g. @diu.edu.bd"
          className={inputClass}
        />
        <input
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="Department (optional)"
          maxLength={100}
          className={inputClass}
        />

        <div className="space-y-2 sm:col-span-2">
          {count !== null && !rangeProblem && (
            <p className="text-sm text-gray-700">
              Up to <span className="font-semibold">{count}</span> account{count === 1 ? "" : "s"} will be
              created. IDs that are already registered are skipped automatically.
            </p>
          )}
          {rangeProblem && <p className="text-sm text-red-500">{rangeProblem}</p>}
          <TempPasswordNote />
        </div>

        {error && <p className="text-sm text-red-500 sm:col-span-2">{error}</p>}
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving || !!rangeProblem}
            className="rounded-md bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900 disabled:opacity-60"
          >
            {saving ? "Creating accounts..." : count ? `Create ${count} account${count === 1 ? "" : "s"}` : "Create accounts"}
          </button>
        </div>
      </form>
    </PanelShell>
  );
}

BulkStudentsPanel.propTypes = { onClose: PropTypes.func.isRequired, onDone: PropTypes.func.isRequired };
