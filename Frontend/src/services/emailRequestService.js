import api from "./api";

export const submitEmailRequest = (payload) => api.post("/email-requests", payload).then((r) => r.data);
export const getEmailRequests = () => api.get("/email-requests").then((r) => r.data);
export const updateEmailRequestStatus = (id, status) =>
  api.patch(`/email-requests/${id}/status`, { status }).then((r) => r.data);