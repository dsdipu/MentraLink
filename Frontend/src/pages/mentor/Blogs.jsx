import { useEffect, useState } from "react";
import { getBlogs, createBlog, updateBlog, deleteBlog } from "../../services/blogService";
import useAuth from "../../hooks/useAuth";

const emptyForm = { title: "", category: "", content: "", images: [""], links: [{ label: "", url: "" }] };

const Blogs = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = creating, else id being edited
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const load = () => getBlogs().then(setBlogs);
  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const startEdit = (blog) => {
    setForm({
      title: blog.title || "",
      category: blog.category || "",
      content: blog.content || "",
      images: blog.images?.length ? blog.images : [""],
      links: blog.links?.length ? blog.links : [{ label: "", url: "" }],
    });
    setEditingId(blog._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this blog post?")) return;
    try {
      await deleteBlog(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete blog");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      ...form,
      images: form.images.map((i) => i.trim()).filter(Boolean),
      links: form.links.filter((l) => l.url.trim()),
    };
    try {
      if (editingId) {
        await updateBlog(editingId, payload);
      } else {
        await createBlog(payload);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save blog");
    }
  };

  // --- dynamic images ---
  const setImageAt = (idx, value) => {
    const next = [...form.images];
    next[idx] = value;
    setForm({ ...form, images: next });
  };
  const addImageField = () => setForm({ ...form, images: [...form.images, ""] });
  const removeImageField = (idx) =>
    setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });

  // --- dynamic links ---
  const setLinkAt = (idx, key, value) => {
    const next = [...form.links];
    next[idx] = { ...next[idx], [key]: value };
    setForm({ ...form, links: next });
  };
  const addLinkField = () => setForm({ ...form, links: [...form.links, { label: "", url: "" }] });
  const removeLinkField = (idx) =>
    setForm({ ...form, links: form.links.filter((_, i) => i !== idx) });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Blogs</h1>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
        >
          {showForm ? "Cancel" : "+ New Post"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-4 space-y-3">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
          />

          <select
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="">Select category</option>
            <option value="EXPERIENCE">Experience</option>
            <option value="TECH">Tech</option>
            <option value="CAREER_TIPS">Career Tips</option>
            <option value="SESSION_RECAP">Session Recap</option>
            <option value="OTHER">Other</option>
          </select>

          <textarea
            required
            placeholder="Content"
            rows={4}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
          />

          {/* Images */}
          <div>
            <label className="block text-sm font-medium mb-1">Images (URL)</label>
            {form.images.map((img, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  placeholder="https://example.com/image.jpg"
                  value={img}
                  onChange={(e) => setImageAt(idx, e.target.value)}
                  className="flex-1 border rounded-md px-3 py-2"
                />
                {form.images.length > 1 && (
                  <button type="button" onClick={() => removeImageField(idx)} className="text-red-500 px-2">
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addImageField} className="text-sm text-blue-600">
              + Add image
            </button>
          </div>

          {/* Links */}
          <div>
            <label className="block text-sm font-medium mb-1">Links</label>
            {form.links.map((link, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  placeholder="Label (optional)"
                  value={link.label}
                  onChange={(e) => setLinkAt(idx, "label", e.target.value)}
                  className="w-1/3 border rounded-md px-3 py-2"
                />
                <input
                  placeholder="https://example.com"
                  value={link.url}
                  onChange={(e) => setLinkAt(idx, "url", e.target.value)}
                  className="flex-1 border rounded-md px-3 py-2"
                />
                {form.links.length > 1 && (
                  <button type="button" onClick={() => removeLinkField(idx)} className="text-red-500 px-2">
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addLinkField} className="text-sm text-blue-600">
              + Add link
            </button>
          </div>

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">
            {editingId ? "Update Post" : "Publish"}
          </button>
        </form>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {blogs.map((b) => {
          const isOwner = b.author?._id === user?.id || b.author === user?.id;
          return (
            <div key={b._id} className="bg-white rounded-lg shadow p-4">
              <span className="text-xs text-blue-600 uppercase">{b.category}</span>
              <h2 className="font-medium mt-1">{b.title}</h2>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{b.excerpt || b.content}</p>

              {b.images?.length > 0 && (
                <div className="flex gap-2 mt-2 overflow-x-auto">
                  {b.images.map((img, i) => (
                    <img key={i} src={img} alt="" className="h-16 w-16 object-cover rounded-md" />
                  ))}
                </div>
              )}

              {b.links?.length > 0 && (
                <ul className="mt-2 text-xs text-blue-600 space-y-1">
                  {b.links.map((l, i) => (
                    <li key={i}>
                      <a href={l.url} target="_blank" rel="noreferrer">{l.label || l.url}</a>
                    </li>
                  ))}
                </ul>
              )}

              {isOwner && (
                <div className="flex gap-3 mt-3">
                  <button onClick={() => startEdit(b)} className="text-sm text-blue-600">Edit</button>
                  <button onClick={() => handleDelete(b._id)} className="text-sm text-red-500">Delete</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Blogs;