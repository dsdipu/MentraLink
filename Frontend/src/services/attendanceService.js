import api from "./api";

// Student: their own attendance records list
export const getMyAttendance = () =>
  api.get("/attendance/me").then((r) => r.data.records);

// Student: their own attendance summary stats (percentage, attended/total)
export const getAttendanceStats = () =>
  api.get("/attendance/me/stats").then((r) => r.data);

// Mentor: attendance sheet (roster) for a specific session
export const getSessionAttendance = (sessionId) =>
  api.get(`/attendance/session/${sessionId}`).then((r) => r.data.records);

// Mentor: submit attendance records for a session
export const markAttendance = (sessionId, records) =>
  api.post(`/attendance/mark`, { sessionId, records }).then((r) => r.data);