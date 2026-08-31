// Frontend/src/pages/BlogDetailsPage.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function BlogDetailsPage() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        // TODO: backend Blog CRUD API confirm hole URL bodlao
        const res = await axios.get(`http://localhost:5000/api/blogs/${id}`);
        setBlog(res.data.blog);
      } catch (err) {
        setError("Could not load blog (API not confirmed yet)");
      }
    };
    fetchBlog();
  }, [id]);

  if (error) return <p className="text-orange-500 p-4">{error}</p>;
  if (!blog) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{blog.title}</h1>
      <p className="text-xs text-gray-400 mb-4">{blog.category}</p>
      <div className="prose text-gray-700 whitespace-pre-line">{blog.content}</div>
    </div>
  );
}

export default BlogDetailsPage;