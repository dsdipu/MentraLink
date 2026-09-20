import api from "./api";

export const getMyProfile = () => api.get("/students/me").then((r) => r.data);
export const updateMyProfile = (payload) => api.put("/students/me", payload).then((r) => r.data);
export const getAllStudents = (params) => api.get("/students", { params }).then((r) => r.data.students);

export const uploadMyPhoto = (file) => {
  const formData = new FormData();
  formData.append("photo", file);
  return api.post("/students/me/photo", formData).then((r) => r.data);
};
export const removeMyPhoto = () => api.delete("/students/me/photo").then((r) => r.data);