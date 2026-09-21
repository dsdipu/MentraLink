import api from "./api";

export const loginUser = async (email, password) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
};

export const forgotPassword = (email) => api.post("/auth/forgot-password", { email }).then((r) => r.data);
export const resetPassword = (email, code, newPassword) =>
  api.post("/auth/reset-password", { email, code, newPassword }).then((r) => r.data);

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// payload can be a FormData (student registration, includes ID card image)
// or a plain object (mentor registration, JSON)
export const registerUser = async (payload) => {
  const isFormData = payload instanceof FormData;
  const { data } = await api.post("/auth/register", payload, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return data;
};

export const getPendingCount = () => api.get("/auth/pending-count").then((r) => r.data.count);