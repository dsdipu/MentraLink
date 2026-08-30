import { useEffect, useState } from "react";
import { getSessions } from "../../services/sessionService";
import { getSessionAttendance, markAttendance } from "../../services/attendanceService";

const Attendance = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [roster, setRoster] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { getSessions().then(setSessions); }, []);

  useEffect(() => {
    if (!selectedId) return;
    getSessionAttendance(selectedId).then(setRoster);
  }, [selectedId]);

  const togglePresent = (studentId) => {
    setRoster((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, present: !r.present } : r)));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await markAttendance(selectedId, roster.map(({ studentId, present }) => ({ studentId, present })));
      setMessage("Attendance saved");
    } catch {
      setMessage("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Mark Attendance</h1>
      <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="border rounded-md px-3 py-2 mb-4">
        <option value="">Select a session</option>
        {sessions.map((s) => (
          <option key={s._id} value={s._id}>{s.title} — {new Date(s.date).toLocaleDateString()}</option>
        ))}
      </select>

      {selectedId && (
        <div className="bg-white rounded-lg shadow divide-y">
          {roster.map((r) => (
            <label key={r.studentId} className="p-3 flex justify-between items-center cursor-pointer">
              <span>{r.studentName}</span>
              <input type="checkbox" checked={r.present} onChange={() => togglePresent(r.studentId)} />
            </label>
          ))}
          {roster.length === 0 && <p className="p-4 text-gray-500">No students in this session.</p>}
        </div>
      )}

      {selectedId && roster.length > 0 && (
        <button onClick={handleSave} disabled={saving} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
          {saving ? "Saving..." : "Save Attendance"}
        </button>
      )}
      {message && <p className="mt-2 text-sm text-blue-600">{message}</p>}
    </div>
  );
};

export default Attendance;