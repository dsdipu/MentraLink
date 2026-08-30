import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBlogs } from "../../services/blogService";


const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogs()
      .then(setBlogs)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading blogs...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Blogs</h1>

      {blogs.length === 0 ? (
        <p className="text-gray-500">No blog posts yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {blogs.map((b) => (
            <Link
              key={b._id}
              to={`/student/blogs/${b._id}`}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition"
            >
              <p className="text-xs text-blue-600 mb-1">{b.category}</p>
              <h2 className="font-medium mb-1">{b.title}</h2>
              <p className="text-sm text-gray-500 line-clamp-2">{b.excerpt}</p>
              <p className="text-xs text-gray-400 mt-2">By {b.authorName}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Blogs;