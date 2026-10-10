import api from "./api";

export const getAdmins = () => api.get("/admins").then((r) => r.data.admins);
export const createAdmin = (payload) => api.post("/admins", payload).then((r) => r.data.admin);
export const updateAdmin = (id, payload) => api.put(`/admins/${id}`, payload).then((r) => r.data.admin);
export const toggleAdminStatus = (id) => api.patch(`/admins/${id}/toggle-status`).then((r) => r.data);

// Admin: security / administration audit trail
export const getAuditLogs = (params = {}) => api.get("/audit-logs", { params }).then((r) => r.data);
