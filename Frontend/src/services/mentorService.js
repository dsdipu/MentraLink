import api from "./api";

export const getDashboard = () => api.get("/mentor/dashboard").then((r) => r.data);
export const getMyProfile = () => api.get("/mentor/profile").then((r) => r.data);
export const updateMyProfile = (payload) =>
  api.put("/mentor/profile", payload).then((r) => r.data);
export const getMyStudents = () => api.get("/mentor/students").then((r) => r.data);