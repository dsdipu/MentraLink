import api from "./api";

export const requestOtp = (email) => api.post("/otp/request", { email }).then((r) => r.data);
export const verifyOtp = (email, code) => api.post("/otp/verify", { email, code }).then((r) => r.data);