import api from "./api";

// Student: submit feedback for a completed session
export const submitFeedback = (sessionId, payload) =>
  api.post("/feedback", { sessionId, ...payload }).then((r) => r.data);

// Student: their own feedback submission history (for duplicate-prevention check)
export const getMyFeedbackHistory = () =>
  api.get("/feedback/me").then((r) => r.data.feedbacks);

// Mentor: feedback summary for a specific session
export const getSessionFeedback = (sessionId) =>
  api.get(`/feedback/session/${sessionId}`).then((r) => r.data);

// Mentor: overall feedback + one row per completed session
export const getMyFeedbackOverview = () =>
  api.get("/feedback/overview").then((r) => r.data);

// Mentor: rating summary + per-question statistics (yes/no percentages) of one session
export const getSessionFeedbackSummary = (sessionId) =>
  api.get(`/feedback/session/${sessionId}/summary`).then((r) => r.data);
