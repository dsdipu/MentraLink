import { useEffect, useState } from "react";
import { getMyMentorSessions, getSessionById } from "../../services/sessionService";
import { getSessionAttendance, markAttendance } from "../../services/attendanceService";
import AttendanceMarking from "../../components/AttendanceMarking";
import EmptyState from "../../components/ui/EmptyState";
import { ClipboardCheck } from "lucide-react";

const Attendance = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [students, setStudents] = useState([]);
  const [existingAttendance, setExistingAttendance] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getMyMentorSessions({ status: "COMPLETED" }).then(setSessions);
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setMessage("");
    setLoadingRoster(true);
    Promise.all([getSessionById(selectedId), getSessionAttendance(selectedId)])
      .then(([session, records]) => {
        setStudents(session.group?.students || []);
        setExistingAttendance(
          records.map((r) => ({ student: r.student?._id || r.student, status: r.status }))
        );
      })
      .finally(() => setLoadingRoster(false));
  }, [selectedId]);

  const handleSubmit = async (payload) => {
    setMessage("");
    try {
      await markAttendance(
        selectedId,
        payload.map(({ student, status }) => ({ student, status }))
      );
      setMessage("Attendance saved successfully.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save attendance");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Mark Attendance</h1>
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="border rounded-md px-3 py-2 mb-4"
      >
        <option value="">Select a completed session</option>
        {sessions.map((s) => (
          <option key={s._id} value={s._id}>
            #{s.sessionNumber} {s.title} — {new Date(s.date).toLocaleDateString()}
          </option>
        ))}
      </select>

      {message && <p className="mb-3 text-sm text-blue-600">{message}</p>}

      {!selectedId && (
        <EmptyState
          icon={ClipboardCheck}
          title="Select a session"
          description="Pick a completed session above to mark attendance for its students."
        />
      )}

      {selectedId && loadingRoster && <p className="text-gray-500">Loading roster...</p>}

      {selectedId && !loadingRoster && students.length === 0 && (
        <p className="text-gray-500">This session's group has no students yet.</p>
      )}

      {selectedId && !loadingRoster && students.length > 0 && (
        <AttendanceMarking
          sessionId={selectedId}
          students={students}
          existingAttendance={existingAttendance}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default Attendance;