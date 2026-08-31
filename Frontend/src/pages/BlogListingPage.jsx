// Frontend/src/pages/BlogListingPage.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function BlogListingPage() {
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        // TODO: backend Blog CRUD API confirm hole URL bodlao
        const res = await axios.get("http://localhost:5000/api/blogs");
        setBlogs(res.data.blogs || []);
      } catch (err) {
        setError("Could not load blogs (API not confirmed yet)");
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Blogs</h1>
      {error && <p className="text-orange-500 mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {blogs.map((blog) => (
          <Link
            key={blog._id}
            to={`/blogs/${blog._id}`}
            className="bg-white rounded-lg shadow p-4 block hover:shadow-md transition"
          >
            <h3 className="font-semibold text-gray-800">{blog.title}</h3>
            <p className="text-xs text-gray-400 mb-1">{blog.category}</p>
            <p className="text-sm text-gray-600 line-clamp-2">{blog.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default BlogListingPage;