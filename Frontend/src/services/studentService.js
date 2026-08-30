import api from "./api";

export const getMyProfile = () => api.get("/student/profile").then((r) => r.data);
export const updateMyProfile = (payload) =>
  api.put("/student/profile", payload).then((r) => r.data);