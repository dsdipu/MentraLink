import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBlogs } from "../../services/blogService";
import { previewText } from "../../utils/blogPreview";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { Newspaper, Heart } from "lucide-react";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogs().then(setBlogs).finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading blogs...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Blogs</h1>

      {blogs.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="No blog posts yet"
          description="Mentors and students haven't published anything here yet — check back soon."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {blogs.map((b) => (
            <Link key={b._id} to={`/student/blogs/${b._id}`}>
              <Card padded={false} className="overflow-hidden h-full hover:shadow-md transition">
                {b.coverImage && (
                  <img src={b.coverImage} alt="" className="w-full h-32 object-cover" />
                )}
                <div className="p-4">
                  <Badge tone="brand" className="mb-2">{b.category}</Badge>
                  <h2 className="font-medium mb-1 text-brand-navy">{b.title}</h2>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{previewText(b.content)}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">By {b.author?.name || "Unknown"}</p>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Heart size={12} />
                      {b.likes?.length || 0}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Blogs;