import api from "./api";

export const getBlogs = () => api.get("/blogs").then((r) => r.data.blogs);
export const getBlogById = (id) => api.get(`/blogs/${id}`).then((r) => r.data.blog);
export const createBlog = (payload) => api.post("/blogs", payload).then((r) => r.data.blog);
export const updateBlog = (id, payload) => api.put(`/blogs/${id}`, payload).then((r) => r.data.blog);
export const deleteBlog = (id) => api.delete(`/blogs/${id}`).then((r) => r.data);