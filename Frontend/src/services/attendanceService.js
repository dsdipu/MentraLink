import api from "./api";

export const getMyAttendance = () => api.get("/attendance/student").then(r => r.data);
export const getAttendanceStats = () => api.get("/attendance/student/stats").then(r => r.data);