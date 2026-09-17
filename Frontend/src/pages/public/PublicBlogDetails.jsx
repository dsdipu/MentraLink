import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getBlogById } from "../../services/blogService";
import BlogContent from "../../components/BlogContent";

const PublicBlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogById(id).then(setBlog).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="max-w-2xl mx-auto px-6 py-16 text-gray-400">Loading...</p>;
  if (!blog) return <p className="max-w-2xl mx-auto px-6 py-16 text-gray-400">Blog not found.</p>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      {blog.coverImage && (
        <img src={blog.coverImage} alt={blog.title} className="w-full rounded-xl mb-6" />
      )}

      <p className="text-xs text-brand-blue mb-2">{blog.category}</p>
      <h1 className="font-display text-3xl text-brand-navy mb-2">{blog.title}</h1>
      <p className="text-sm text-gray-400 mb-8">By {blog.author?.name || "Unknown"}</p>

      <BlogContent content={blog.content} />

      {blog.images?.length > 0 && (
        <div className="mt-8">
          <p className="text-sm font-medium text-gray-600 mb-2">Gallery</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {blog.images.map((img, i) => (
              <img key={i} src={img} alt="" className="w-full h-28 object-cover rounded-md" />
            ))}
          </div>
        </div>
      )}

      {blog.links?.length > 0 && (
        <div className="mt-8">
          <p className="text-sm font-medium text-gray-600 mb-2">Links</p>
          <ul className="space-y-1">
            {blog.links.map((l, i) => (
              <li key={i}>
                <a href={l.url} target="_blank" rel="noreferrer" className="text-brand-blue text-sm hover:underline">
                  {l.label || l.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-12 bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-gray-600 mb-4">Want to join a session, give feedback, or write your own post?</p>
        <Link to="/register" className="bg-brand-gradient text-white px-6 py-2.5 rounded-full font-medium hover:opacity-90 transition inline-block">
          Create an account
        </Link>
      </div>
    </div>
  );
};

export default PublicBlogDetails;