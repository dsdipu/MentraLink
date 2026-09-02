import api from "./api";

export const getSemesters = () => api.get("/semesters").then((r) => r.data.semesters);
export const createSemester = (payload) =>
  api.post("/semesters", payload).then((r) => r.data.semester);
export const updateSemester = (id, payload) =>
  api.put(`/semesters/${id}`, payload).then((r) => r.data.semester);
export const deleteSemester = (id) =>
  api.delete(`/semesters/${id}`).then((r) => r.data);