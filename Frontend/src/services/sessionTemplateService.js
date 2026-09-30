import api from "./api";

export const getSessionTemplates = (params) =>
  api.get("/session-templates", { params }).then((r) => r.data.templates);

export const getMyMentorSessionTemplates = () =>
  api.get("/session-templates/mentor/me").then((r) => r.data.templates);

export const getSessionTemplateById = (id) =>
  api.get(`/session-templates/${id}`).then((r) => r.data.template);

export const createSessionTemplate = (payload) =>
  api.post("/session-templates", payload).then((r) => r.data.template);

export const updateSessionTemplate = (id, payload) =>
  api.put(`/session-templates/${id}`, payload).then((r) => r.data.template);

export const deleteSessionTemplate = (id) =>
  api.delete(`/session-templates/${id}`).then((r) => r.data);
