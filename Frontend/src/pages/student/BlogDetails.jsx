import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBlogById, toggleLike, getComments, addComment, deleteComment } from "../../services/blogService";
import BlogContent from "../../components/BlogContent";
import useAuth from "../../hooks/useAuth";
import { Heart, Trash2 } from "lucide-react";

const BlogDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [liking, setLiking] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([getBlogById(id), getComments(id)])
      .then(([b, c]) => {
        setBlog(b);
        setComments(c);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const hasLiked = blog?.likes?.some((likeId) => likeId === user?.id);

  const handleToggleLike = async () => {
    setLiking(true);
    try {
      const res = await toggleLike(id);
      setBlog((b) => ({
        ...b,
        likes: res.liked
          ? [...(b.likes || []), user.id]
          : (b.likes || []).filter((likeId) => likeId !== user.id),
      }));
    } finally {
      setLiking(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setPosting(true);
    try {
      const comment = await addComment(id, commentText.trim());
      setComments((c) => [comment, ...c]);
      setCommentText("");
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    await deleteComment(id, commentId);
    setComments((c) => c.filter((cm) => cm._id !== commentId));
  };

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

      <div className="mt-6 pt-4 border-t flex items-center gap-2">
        <button
          onClick={handleToggleLike}
          disabled={liking}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition ${
            hasLiked ? "bg-red-50 border-red-200 text-red-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Heart size={16} fill={hasLiked ? "currentColor" : "none"} />
          {blog.likes?.length || 0}
        </button>
        <span className="text-sm text-gray-400">{comments.length} comment{comments.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="mt-4">
        <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={posting || !commentText.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
          >
            Post
          </button>
        </form>

        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c._id} className="flex justify-between items-start bg-gray-50 rounded-md p-3">
              <div>
                <p className="text-sm font-medium">{c.author?.name || "Unknown"}</p>
                <p className="text-sm text-gray-600">{c.text}</p>
              </div>
              {(c.author?._id === user?.id) && (
                <button onClick={() => handleDeleteComment(c._id)} className="text-gray-400 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          {comments.length === 0 && <p className="text-sm text-gray-400">No comments yet — be the first.</p>}
        </div>
      </div>
    </div>
  );
};

export default BlogDetails;