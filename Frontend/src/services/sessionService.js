import api from "./api";

// Student: their own sessions
export const getMySessions = () => api.get("/sessions/me").then((r) => r.data.sessions);

// Mentor: sessions they're running (shared listing endpoint)
export const getSessions = () => api.get("/sessions").then((r) => r.data.sessions);
export const getSessionById = (id) => api.get(`/sessions/${id}`).then((r) => r.data.session);
export const createSession = (payload) => api.post("/sessions", payload).then((r) => r.data.session);
export const updateSession = (id, payload) =>
  api.put(`/sessions/${id}`, payload).then((r) => r.data.session);
export const updateSessionStatus = (id, status) =>
  api.patch(`/sessions/${id}/status`, { status }).then((r) => r.data.session);