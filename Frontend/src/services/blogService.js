import api from "./api";

export const getBlogs = () => api.get("/blogs").then((r) => r.data.blogs);
export const getBlogById = (id) => api.get(`/blogs/${id}`).then((r) => r.data.blog);
export const createBlog = (payload) => api.post("/blogs", payload).then((r) => r.data.blog);
export const updateBlog = (id, payload) => api.put(`/blogs/${id}`, payload).then((r) => r.data.blog);
export const deleteBlog = (id) => api.delete(`/blogs/${id}`).then((r) => r.data);
export const toggleLike = (blogId) => api.post(`/blogs/${blogId}/like`).then((r) => r.data);
export const getComments = (blogId) => api.get(`/blogs/${blogId}/comments`).then((r) => r.data.comments);
export const addComment = (blogId, text) => api.post(`/blogs/${blogId}/comments`, { text }).then((r) => r.data.comment);
export const deleteComment = (blogId, commentId) => api.delete(`/blogs/${blogId}/comments/${commentId}`).then((r) => r.data);

export const uploadBlogImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return api.post("/blogs/upload-image", formData).then((r) => r.data.url);
};