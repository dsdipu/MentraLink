import { useEffect, useState } from "react";
import { getBlogs, createBlog } from "../../services/blogService";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", category: "", content: "" });
  const [error, setError] = useState("");

  const load = () => getBlogs().then(setBlogs);
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createBlog(form);
      setForm({ title: "", category: "", content: "" });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to publish blog");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Blogs</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
          {showForm ? "Cancel" : "+ New Post"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-4 rounded-lg shadow mb-4 space-y-3">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border rounded-md px-3 py-2" />
          <input required placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border rounded-md px-3 py-2" />
          <textarea required placeholder="Content" rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full border rounded-md px-3 py-2" />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">Publish</button>
        </form>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {blogs.map((b) => (
          <div key={b._id} className="bg-white rounded-lg shadow p-4">
            <span className="text-xs text-blue-600 uppercase">{b.category}</span>
            <h2 className="font-medium mt-1">{b.title}</h2>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{b.excerpt || b.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blogs;