import api from "./api";

export const getProfile = () => api.get("/student/profile").then((r) => r.data);
export const updateProfile = (payload) =>
  api.put("/student/profile", payload).then((r) => r.data);