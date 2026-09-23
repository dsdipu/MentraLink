import { useEffect, useRef, useState } from "react";
import { getBlogs, createBlog, updateBlog, deleteBlog, uploadBlogImage } from "../../services/blogService";
import { previewText } from "../../utils/blogPreview";
import useAuth from "../../hooks/useAuth";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { Newspaper, Heart } from "lucide-react";

const emptyForm = { title: "", category: "", content: "", coverImage: "", images: [""], links: [{ label: "", url: "" }] };

const Blogs = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const contentRef = useRef(null);

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
      coverImage: blog.coverImage || "",
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

  const handleInsertImageAtCursor = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadBlogImage(file);
      const textarea = contentRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const insertText = `\n![image](${url})\n`;
      const newContent = form.content.slice(0, start) + insertText + form.content.slice(end);
      setForm((f) => ({ ...f, content: newContent }));
      requestAnimationFrame(() => {
        textarea.focus();
        const pos = start + insertText.length;
        textarea.setSelectionRange(pos, pos);
      });
    } catch (err) {
      alert(err.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleUploadToGallerySlot = async (idx, file) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadBlogImage(file);
      setImageAt(idx, url);
    } catch (err) {
      alert(err.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleUploadCoverImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadBlogImage(file);
      setForm((f) => ({ ...f, coverImage: url }));
    } catch (err) {
      alert(err.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const setImageAt = (idx, value) => {
    setForm((f) => {
      const next = [...f.images];
      next[idx] = value;
      return { ...f, images: next };
    });
  };
  const addImageField = () => setForm({ ...form, images: [...form.images, ""] });
  const removeImageField = (idx) => setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });

  const setLinkAt = (idx, key, value) => {
    setForm((f) => {
      const next = [...f.links];
      next[idx] = { ...next[idx], [key]: value };
      return { ...f, links: next };
    });
  };
  const addLinkField = () => setForm({ ...form, links: [...form.links, { label: "", url: "" }] });
  const removeLinkField = (idx) => setForm({ ...form, links: form.links.filter((_, i) => i !== idx) });

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
        <Card className="mb-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {uploading && <p className="text-blue-500 text-sm">Uploading image...</p>}

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

            <div>
              <label className="block text-sm font-medium mb-1">Cover image</label>
              <div className="flex items-center gap-3">
                {form.coverImage && <img src={form.coverImage} alt="cover" className="h-16 w-16 object-cover rounded-md" />}
                <input type="file" accept="image/*" onChange={(e) => handleUploadCoverImage(e.target.files[0])} className="text-sm" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium">Content</label>
                <label className="text-xs text-blue-600 cursor-pointer hover:underline">
                  📷 Insert image here
                  <input type="file" accept="image/*" className="hidden" onChange={handleInsertImageAtCursor} />
                </label>
              </div>
              <textarea
                ref={contentRef}
                required
                placeholder="Write your blog... place your cursor where you want an image and click 'Insert image here'"
                rows={10}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full border rounded-md px-3 py-2 font-mono text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                Tip: click into the text where you want a picture to appear, then click "Insert image here" above.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Gallery images (optional, shown at the end of the post)</label>
              {form.images.map((img, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  {img && <img src={img} alt="" className="h-10 w-10 object-cover rounded-md" />}
                  <input
                    placeholder="Image URL"
                    value={img}
                    onChange={(e) => setImageAt(idx, e.target.value)}
                    className="flex-1 border rounded-md px-3 py-2 text-sm"
                  />
                  <label className="text-xs text-blue-600 cursor-pointer hover:underline whitespace-nowrap">
                    Upload
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadToGallerySlot(idx, e.target.files[0])} />
                  </label>
                  {form.images.length > 1 && (
                    <button type="button" onClick={() => removeImageField(idx)} className="text-red-500 px-2">✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addImageField} className="text-sm text-blue-600">+ Add image slot</button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Links</label>
              {form.links.map((link, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    placeholder="Label (optional)"
                    value={link.label}
                    onChange={(e) => setLinkAt(idx, "label", e.target.value)}
                    className="w-1/3 border rounded-md px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="https://example.com"
                    value={link.url}
                    onChange={(e) => setLinkAt(idx, "url", e.target.value)}
                    className="flex-1 border rounded-md px-3 py-2 text-sm"
                  />
                  {form.links.length > 1 && (
                    <button type="button" onClick={() => removeLinkField(idx)} className="text-red-500 px-2">✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addLinkField} className="text-sm text-blue-600">+ Add link</button>
            </div>

            <button type="submit" disabled={uploading} className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50">
              {editingId ? "Update Post" : "Publish"}
            </button>
          </form>
        </Card>
      )}

      {blogs.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="No blog posts yet"
          description="Publish your first post to start sharing with students."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {blogs.map((b) => {
            const isOwner = b.author?._id === user?.id || b.author === user?.id;
            return (
              <Card key={b._id} padded={false} className="overflow-hidden">
                {b.coverImage && <img src={b.coverImage} alt="" className="w-full h-32 object-cover" />}
                <div className="p-4">
                  <Badge tone="brand" className="mb-2">{b.category}</Badge>
                  <h2 className="font-medium text-brand-navy">{b.title}</h2>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{previewText(b.content)}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Heart size={12} />
                      {b.likes?.length || 0}
                    </span>
                    {isOwner && (
                      <div className="flex gap-3">
                        <button onClick={() => startEdit(b)} className="text-sm text-blue-600">Edit</button>
                        <button onClick={() => handleDelete(b._id)} className="text-sm text-red-500">Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Blogs;