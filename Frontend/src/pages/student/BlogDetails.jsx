import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBlogById } from "../../services/blogService";
import BlogContent from "../../components/BlogContent";

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogById(id).then(setBlog).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!blog) return <p>Blog not found.</p>;

  return (
    <div className="max-w-2xl bg-white p-6 rounded-lg shadow">
      {blog.coverImage && (
        <img src={blog.coverImage} alt={blog.title} className="w-full rounded-lg mb-4" />
      )}

      <p className="text-xs text-blue-600 mb-2">{blog.category}</p>
      <h1 className="text-2xl font-semibold mb-2">{blog.title}</h1>
      <p className="text-xs text-gray-400 mb-4">By {blog.author?.name || "Unknown"}</p>

      <BlogContent content={blog.content} />

      {blog.images?.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Gallery</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {blog.images.map((img, i) => (
              <img key={i} src={img} alt="" className="w-full h-28 object-cover rounded-md" />
            ))}
          </div>
        </div>
      )}

      {blog.links?.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Links</p>
          <ul className="space-y-1">
            {blog.links.map((l, i) => (
              <li key={i}>
                <a href={l.url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm hover:underline">
                  {l.label || l.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BlogDetails;