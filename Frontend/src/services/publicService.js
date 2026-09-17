import api from "./api";

export const getPublicStats = () => api.get("/dashboard/public").then((r) => r.data);