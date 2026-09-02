import api from "./api";

export const getDashboard = () => api.get("/mentor/dashboard").then((r) => r.data);
export const getMyProfile = () => api.get("/mentors/me").then((r) => r.data);
export const updateMyProfile = (payload) =>
  api.put("/mentors/me", payload).then((r) => r.data);
export const getMyStudents = () => api.get("/mentor/students").then((r) => r.data);