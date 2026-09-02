import api from "./api";

export const getMyProfile = () => api.get("/students/me").then((r) => r.data);
export const updateMyProfile = (payload) =>
  api.put("/students/me", payload).then((r) => r.data);