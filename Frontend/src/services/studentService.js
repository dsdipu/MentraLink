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


export const updateStudent = (id, payload) => api.put(`/students/${id}`, payload).then((r) => r.data.student);

// Student: the mentor of my active group (name, email, phone, rating)
export const getMyMentor = () => api.get("/mentors/my-mentor").then((r) => r.data);

// Admin: create one student (temporary credentials unless a password is given)
export const createStudent = (payload) => api.post("/students", payload).then((r) => r.data);
// Admin: create many students from an ID range, e.g. 262034001 .. 262034035
export const bulkCreateStudents = (payload) => api.post("/students/bulk", payload).then((r) => r.data);
export const getBulkConfig = () => api.get("/students/bulk/config").then((r) => r.data);
