// Frontend/src/components/AttendanceMarking.jsx
import { useState } from "react";
import PropTypes from "prop-types";

const STATUS_OPTIONS = ["PRESENT", "ABSENT"];

function AttendanceMarking({ sessionId, students, existingAttendance, onSubmit }) {
  // build initial map: studentId -> status
  const initialMap = {};
  students.forEach((s) => {
    const existing = existingAttendance?.find((a) => a.student === s._id);
    initialMap[s._id] = existing ? existing.status : "PRESENT";
  });

  const [attendanceMap, setAttendanceMap] = useState(initialMap);
  const [submitting, setSubmitting] = useState(false);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const payload = students.map((s) => ({
      session: sessionId,
      student: s._id,
      status: attendanceMap[s._id],
    }));
    try {
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Mark Attendance</h2>

      <div className="divide-y divide-gray-200">
        {students.map((s) => (
          <div key={s._id} className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">{s.user?.name || "Unnamed Student"}</p>
              <p className="text-sm text-gray-500">
                {s.studentId} · {s.department} · {s.batch}
              </p>
            </div>

            <div className="flex gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatusChange(s._id, status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${
                    attendanceMap[s._id] === status
                      ? status === "PRESENT"
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-red-500 text-white border-red-500"
                      : "bg-white text-gray-600 border-gray-300"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || students.length === 0}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md font-medium disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Attendance"}
      </button>
    </div>
  );
}

AttendanceMarking.propTypes = {
  sessionId: PropTypes.string.isRequired,
  students: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      studentId: PropTypes.string.isRequired,
      department: PropTypes.string.isRequired,
      batch: PropTypes.string.isRequired,
      user: PropTypes.shape({
        name: PropTypes.string,
      }),
    })
  ).isRequired,
  existingAttendance: PropTypes.arrayOf(
    PropTypes.shape({
      student: PropTypes.string,
      status: PropTypes.oneOf(STATUS_OPTIONS),
    })
  ),
  onSubmit: PropTypes.func.isRequired,
};

AttendanceMarking.defaultProps = {
  existingAttendance: [],
};

export default AttendanceMarking;