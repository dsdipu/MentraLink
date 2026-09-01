import api from "./api";

export const loginUser = async (email, password) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data; // { token, user }
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const registerUser = async (payload) => {
  const { data } = await api.post("/auth/register", payload);
  return data; // { message, user }
};