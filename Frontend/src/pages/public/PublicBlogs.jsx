import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBlogs } from "../../services/blogService";
import { previewText } from "../../utils/blogPreview";

const PublicBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogs().then(setBlogs).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-display text-4xl text-brand-navy mb-2">The Blog</h1>
      <p className="text-gray-500 mb-10">Stories, tips, and session recaps from mentors and students.</p>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : blogs.length === 0 ? (
        <p className="text-gray-400">No posts yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((b) => (
            <Link key={b._id} to={`/blogs/${b._id}`} className="group">
              {b.coverImage && (
                <img src={b.coverImage} alt="" className="w-full h-44 object-cover rounded-xl mb-3" />
              )}
              <p className="text-xs text-brand-blue mb-1">{b.category}</p>
              <p className="font-medium text-brand-navy group-hover:underline">{b.title}</p>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{previewText(b.content)}</p>
              <p className="text-xs text-gray-400 mt-2">By {b.author?.name || "Unknown"}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicBlogs;