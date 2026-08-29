import api from "./api";

export const getBlogs = () => api.get("/blogs").then(r => r.data);
export const getBlogById = (id) => api.get(`/blogs/${id}`).then(r => r.data);