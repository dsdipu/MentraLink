import api from "./api";

export const getGroups = () => api.get("/groups").then((r) => r.data.groups);
export const createGroup = (payload) =>
  api.post("/groups", payload).then((r) => r.data.group);
export const updateGroup = (id, payload) =>
  api.put(`/groups/${id}`, payload).then((r) => r.data.group);
export const assignMentor = (id, mentorId) =>
  api.patch(`/groups/${id}/assign-mentor`, { mentorId }).then((r) => r.data.group);
export const assignStudents = (id, studentIds) =>
  api.patch(`/groups/${id}/assign-students`, { studentIds }).then((r) => r.data.group);
export const unassignStudent = (id, studentId) =>
  api
    .patch(`/groups/${id}/unassign-student`, { studentId })
    .then((r) => r.data.group);
// Student-ID ranges of a section, e.g. [{ start: "262034001", end: "262034017" }]
export const setGroupRanges = (id, ranges, moveExisting = false) =>
  api.put(`/groups/${id}/ranges`, { ranges, moveExisting }).then((r) => r.data);
export const applyGroupRanges = (id, moveExisting = false) =>
  api.post(`/groups/${id}/apply-ranges`, { moveExisting }).then((r) => r.data);
export const deleteGroup = (id) =>
  api.delete(`/groups/${id}`).then((r) => r.data);

export const getAllMentors = () => api.get("/mentors").then((r) => r.data.mentors);
export const getAllStudents = () => api.get("/students").then((r) => r.data.students);