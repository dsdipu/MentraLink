// Frontend/src/pages/BlogCreatePage.jsx
import { useState } from "react";
import axios from "axios";

function BlogCreatePage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      // TODO: backend Blog CRUD API confirm hole URL/field bodlao
      await axios.post(
        "http://localhost:5000/api/blogs",
        { title, category, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Blog published!");
      setTitle("");
      setCategory("");
      setContent("");
    } catch (err) {
      setError(err.response?.data?.message || "Blog publish failed");
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Write a Blog</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-600 mb-2">{success}</p>}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md font-medium"
        >
          Publish
        </button>
      </form>
    </div>
  );
}

export default BlogCreatePage;