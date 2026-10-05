import { useState } from "react";
import PropTypes from "prop-types";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { applyGroupRanges, setGroupRanges } from "../services/groupService";

const idOnly = (value) => value.replace(/\D/g, "").slice(0, 9);
const sizeOf = (range) =>
  /^\d{9}$/.test(range.start) && /^\d{9}$/.test(range.end) && range.end >= range.start
    ? Number(range.end) - Number(range.start) + 1
    : 0;

const ResultSummary = ({ result, onMove, moving }) => {
  const assigned = result.assigned.length + result.moved.length;
  return (
    <div className="mt-3 space-y-2 rounded-md bg-gray-50 p-3 text-sm">
      <p className="text-gray-700">
        <span className="font-semibold text-green-700">{assigned}</span> student
        {assigned === 1 ? "" : "s"} assigned now
        {result.alreadyIn > 0 ? `, ${result.alreadyIn} already in this section` : ""}.
      </p>

      {result.withoutAccount > 0 && (
        <p className="text-xs text-gray-500">
          {result.withoutAccount} ID{result.withoutAccount === 1 ? "" : "s"} in this range{" "}
          {result.withoutAccount === 1 ? "has" : "have"} no account yet. They join automatically when
          the account is created or approved.
        </p>
      )}

      {result.batchMismatch.length > 0 && (
        <p className="text-xs text-amber-700">
          Skipped (different batch from this semester): {result.batchMismatch.join(", ")}
        </p>
      )}

      {result.conflicts.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-2">
          <p className="text-xs font-medium text-amber-800">
            {result.conflicts.length} student{result.conflicts.length === 1 ? " is" : "s are"} already in
            another section:
          </p>
          <ul className="mt-1 max-h-28 overflow-y-auto text-xs text-amber-800">
            {result.conflicts.map((c) => (
              <li key={c.studentId}>
                {c.studentId}
                {c.name ? ` (${c.name})` : ""} in {c.currentSection}
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={moving}
            onClick={onMove}
            className="mt-2 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {moving ? "Moving..." : "Move them to this section"}
          </button>
        </div>
      )}
    </div>
  );
};

ResultSummary.propTypes = {
  result: PropTypes.object.isRequired,
  onMove: PropTypes.func.isRequired,
  moving: PropTypes.bool,
};

// Student-ID ranges of one section. Saved once, they stay valid for the whole semester:
// everyone inside a range is assigned now, and new students join automatically.
function SectionRanges({ section, onChanged }) {
  const saved = section.studentIdRanges || [];
  const [editing, setEditing] = useState(false);
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const startEdit = () => {
    setRows(saved.length ? saved.map((r) => ({ ...r })) : [{ start: "", end: "" }]);
    setError("");
    setResult(null);
    setEditing(true);
  };

  const updateRow = (index, field, value) =>
    setRows((current) => current.map((row, i) => (i === index ? { ...row, [field]: idOnly(value) } : row)));

  const run = async (action) => {
    setBusy(true);
    setError("");
    try {
      const data = await action();
      setResult(data.result);
      setEditing(false);
      onChanged();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const save = (moveExisting = false) => {
    const cleaned = rows.filter((row) => row.start || row.end);
    if (cleaned.some((row) => sizeOf(row) === 0)) {
      setError("Every range needs a 9-digit start ID and an end ID that is not smaller than the start");
      return;
    }
    run(() => setGroupRanges(section._id, cleaned, moveExisting));
  };

  const totalIds = (editing ? rows : saved).reduce((sum, row) => sum + sizeOf(row), 0);

  return (
    <div className="mt-5 rounded-md border border-blue-100 bg-blue-50/40 p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-gray-800">Student ID ranges (auto-assign)</p>
          <p className="text-xs text-gray-500">
            Students in these ranges are assigned to this section automatically, for the whole semester.
          </p>
        </div>

        {!editing && (
          <div className="flex gap-2">
            {saved.length > 0 && (
              <button
                type="button"
                disabled={busy}
                onClick={() => run(() => applyGroupRanges(section._id))}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                title="Assign everyone who is inside the saved ranges"
              >
                <RefreshCw size={13} className={busy ? "animate-spin" : ""} /> Apply now
              </button>
            )}
            <button
              type="button"
              onClick={startEdit}
              className="rounded-md bg-gray-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-900"
            >
              {saved.length ? "Edit ranges" : "Set ranges"}
            </button>
          </div>
        )}
      </div>

      {!editing && saved.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {saved.map((range) => (
            <span
              key={`${range.start}-${range.end}`}
              className="rounded-full bg-white px-3 py-1 text-xs font-medium text-blue-700 shadow-sm ring-1 ring-blue-100"
            >
              {range.start} – {range.end} <span className="text-gray-400">({sizeOf(range)})</span>
            </span>
          ))}
        </div>
      )}

      {!editing && saved.length === 0 && !result && (
        <p className="mt-2 text-xs text-gray-400">
          No range yet. Example: 262034001 – 262034017 for this section.
        </p>
      )}

      {editing && (
        <div className="mt-3 space-y-2">
          {rows.map((row, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                inputMode="numeric"
                value={row.start}
                onChange={(e) => updateRow(index, "start", e.target.value)}
                placeholder="From, e.g. 262034001"
                className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-400">–</span>
              <input
                inputMode="numeric"
                value={row.end}
                onChange={(e) => updateRow(index, "end", e.target.value)}
                placeholder="To, e.g. 262034017"
                className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
                className="shrink-0 rounded-md p-2 text-gray-400 hover:bg-white hover:text-red-600"
                aria-label="Remove range"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setRows((current) => [...current, { start: "", end: "" }])}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
          >
            <Plus size={14} /> Add another range
          </button>

          {totalIds > 0 && <p className="text-xs text-gray-500">{totalIds} IDs in total.</p>}
          {rows.every((row) => !row.start && !row.end) && saved.length > 0 && (
            <p className="text-xs text-amber-700">
              Saving with no range removes the rule. Students already in this section stay.
            </p>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              disabled={busy}
              onClick={() => save(false)}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {busy ? "Saving..." : "Save and assign"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!editing && error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {result && (
        <ResultSummary
          result={result}
          moving={busy}
          onMove={() => run(() => setGroupRanges(section._id, saved, true))}
        />
      )}
    </div>
  );
}

SectionRanges.propTypes = {
  section: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    studentIdRanges: PropTypes.arrayOf(
      PropTypes.shape({ start: PropTypes.string, end: PropTypes.string })
    ),
  }).isRequired,
  onChanged: PropTypes.func.isRequired,
};

export default SectionRanges;
