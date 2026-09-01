import api from "./api";

// Student: their assigned mentor (with currentSemesterId)
export const getMyMentor = () => api.get("/students/me/mentor").then((r) => r.data);

// Student: their past evaluation submissions (for duplicate-prevention check)
export const getMyEvaluations = () => api.get("/evaluations/me").then((r) => r.data);

// Student: check/submit semester evaluation of their mentor
export const getEvaluationStatus = (semesterId) =>
  api.get(`/evaluations/status?semesterId=${semesterId}`).then((r) => r.data);
export const submitEvaluation = (payload) =>
  api.post("/evaluations", payload).then((r) => r.data);

// Mentor: their own aggregated rating
export const getMentorRating = () => api.get("/evaluations/mentor/rating").then((r) => r.data);