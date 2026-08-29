import api from "./api";

export const submitEvaluation = (mentorId, payload) =>
  api.post(`/evaluations/${mentorId}`, payload).then(r => r.data);

export const getMyEvaluations = () =>
  api.get("/evaluations/student").then(r => r.data);