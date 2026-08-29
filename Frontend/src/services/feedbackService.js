import api from "./api";

export const submitFeedback = (sessionId, payload) =>
  api.post(`/feedback/${sessionId}`, payload).then(r => r.data);

export const getMyFeedbackHistory = () =>
  api.get("/feedback/student").then(r => r.data);