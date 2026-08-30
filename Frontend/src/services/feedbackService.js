import api from "./api";

// Student: submit feedback for a completed session
export const submitFeedback = (sessionId, payload) =>
  api.post("/feedback", { sessionId, ...payload }).then((r) => r.data);

// Student: their own feedback submission history (for duplicate-prevention check)
export const getMyFeedbackHistory = () =>
  api.get("/feedback/me").then((r) => r.data);

// Mentor: feedback summary for a specific session
export const getSessionFeedback = (sessionId) =>
  api.get(`/feedback/session/${sessionId}`).then((r) => r.data);