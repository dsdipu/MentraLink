import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// token expired / account deactivated -> clear the session and go back to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    // temporary password still active -> send the user to the change-password page
    if (error.response?.status === 403 && error.response?.data?.code === "PASSWORD_CHANGE_REQUIRED") {
      try {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        stored.mustChangePassword = true;
        localStorage.setItem("user", JSON.stringify(stored));
        const target = `/${String(stored.role || "student").toLowerCase()}/change-password`;
        if (window.location.pathname !== target) window.location.href = target;
      } catch {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    const isAuthAttempt = url.includes("/auth/login") || url.includes("/auth/register");
    if (error.response?.status === 401 && !isAuthAttempt && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;