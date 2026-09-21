import api from "./api";

export const getDashboard = () => api.get("/dashboard/mentor").then((r) => r.data);
export const getMyProfile = () => api.get("/mentors/me").then((r) => r.data);
export const updateMyProfile = (payload) => api.put("/mentors/me", payload).then((r) => r.data);
export const getMyStudents = () => api.get("/mentors/me/students").then((r) => r.data.students);
export const getAllMentors = () => api.get("/mentors").then((r) => r.data.mentors);

export const uploadMyPhoto = (file) => {
  const formData = new FormData();
  formData.append("photo", file);
  return api.post("/mentors/me/photo", formData).then((r) => r.data);
};
export const removeMyPhoto = () => api.delete("/mentors/me/photo").then((r) => r.data);


export const updateMentor = (id, payload) => api.put(`/mentors/${id}`, payload).then((r) => r.data.mentor);