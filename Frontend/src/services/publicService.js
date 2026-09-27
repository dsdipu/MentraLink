import api from "./api";

export const getPublicStats = () => api.get("/dashboard/public").then((r) => r.data);
export const getTopMentors = (limit = 6) =>
  api.get(`/dashboard/public/top-mentors?limit=${limit}`).then((r) => r.data.mentors);
