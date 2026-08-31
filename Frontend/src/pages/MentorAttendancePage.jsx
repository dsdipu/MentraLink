// Frontend/src/pages/MentorAttendancePage.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import AttendanceMarking from "../components/AttendanceMarking";

function MentorAttendancePage() {
  const [sessionId] = useState(""); // TODO: session select theke value boshao
  const [students, setStudents] = useState([]);
  const [existingAttendance, setExistingAttendance] = useState([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    // TODO: ekhane apni students list fetch korar API call boshaben
    // example: axios.get(`/api/group/students?sessionId=${sessionId}`)
  }, [sessionId]);

  const handleAttendanceSubmit = async (payload) => {
    // payload = [{ session, student, status }, ...] — component theke ashe
    setError("");
    try {
      const records = payload.map((p) => ({
        student: p.student,
        status: p.status,
      }));

      const response = await axios.post(
        "http://localhost:5000/api/attendance/mark",
        {
          sessionId: payload[0]?.session,
          records,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Attendance saved:", response.data);
      setExistingAttendance(response.data.attendance);
    } catch (err) {
      setError(err.response?.data?.message || "Attendance save failed");
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Mentor Attendance</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <AttendanceMarking
        sessionId={sessionId}
        students={students}
        existingAttendance={existingAttendance}
        onSubmit={handleAttendanceSubmit}
      />
    </div>
  );
}

export default MentorAttendancePage;