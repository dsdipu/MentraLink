import api from "./api";

export const getMyEvaluations = () => api.get("/evaluations/me").then((r) => r.data.evaluations);
export const getEvaluationStatus = (sessionId) =>
  api.get(`/evaluations/status?sessionId=${sessionId}`).then((r) => r.data);
export const submitEvaluation = (sessionId, payload) =>
  api.post("/evaluations", { sessionId, ...payload }).then((r) => r.data);
export const getMentorRating = () => api.get("/evaluations/mentor/me").then((r) => r.data);
export const getMyMentorEvaluations = () => api.get("/evaluations/mentor/me/list").then((r) => r.data.evaluations);
export const getAllMentorRatings = () => api.get("/evaluations/all").then((r) => r.data.mentors);