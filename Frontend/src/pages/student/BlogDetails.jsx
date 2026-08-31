import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBlogById } from "../../services/blogService";



const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogById(id)
      .then(setBlog)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!blog) return <p>Blog not found.</p>;

  return (
    <div className="max-w-2xl bg-white p-6 rounded-lg shadow">
      <p className="text-xs text-blue-600 mb-2">{blog.category}</p>
      <h1 className="text-2xl font-semibold mb-2">{blog.title}</h1>
      <p className="text-xs text-gray-400 mb-4">By {blog.authorName}</p>
      <div className="prose text-sm whitespace-pre-line">{blog.content}</div>
    </div>
  );
};

export default BlogDetails;