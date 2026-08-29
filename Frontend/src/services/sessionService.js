import api from "./api";

export const getMySessions = () => api.get("/sessions/student").then(r => r.data);
export const getNextSession = () => api.get("/sessions/next").then(r => r.data);