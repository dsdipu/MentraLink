import api from "./api";

export const getDashboard = () => 
  api.get("/dashboard/mentor").then((r) => r.data);

export const getMyProfile = () =>
  api.get("/mentors/me").then((r) => r.data);

export const updateMyProfile = (payload) =>
  api.put("/mentors/me", payload).then((r) => r.data);

export const getMyStudents = () => 
  api.get("/mentors/me/students").then((r) => r.data.students);

// Get all mentors
export const getAllMentors = () =>
  api.get("/mentors").then((r) => r.data.mentors);

