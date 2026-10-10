import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  uploadBlogImage,
} from "../../services/blogService";
import { previewText } from "../../utils/blogPreview";
import useAuth from "../../hooks/useAuth";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { safeUrl } from "../../utils/safeUrl";
import {
  Newspaper,
  Heart,
  Share2,
  Check,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  ImagePlus,
  Eraser,
} from "lucide-react";

const emptyForm = {
  title: "",
  category: "",
  content: "",
  coverImage: "",
  images: [""],
  links: [{ label: "", url: "" }],
};

const Blogs = () => {
  const { user } = useAuth();

  const [blogs, setBlogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const contentRef = useRef(null);

  const load = async () => {
    try {
      const data = await getBlogs();
      setBlogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load blogs");
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (showForm && contentRef.current) {
      contentRef.current.innerHTML = form.content || "";
    }
  }, [showForm, editingId]);

  const resetForm = () => {
    setForm({
      ...emptyForm,
      images: [""],
      links: [{ label: "", url: "" }],
    });
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
      links: blog.links?.length
        ? blog.links
        : [{ label: "", url: "" }],
    });

    setEditingId(blog._id);
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this blog post?")) return;

    try {
      await deleteBlog(id);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete blog");
    }
  };

  const handleShare = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/blogs/${id}`;

    try {
      await navigator.clipboard.writeText(url);

      setCopiedId(id);

      setTimeout(() => {
        setCopiedId((current) =>
          current === id ? null : current
        );
      }, 2000);
    } catch {
      window.prompt("Copy this link to share:", url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      ...form,
      images: form.images
        .map((image) => image.trim())
        .filter(Boolean),
      links: form.links.filter(
        (link) => link.url.trim()
      ),
    };

    try {
      if (editingId) {
        await updateBlog(editingId, payload);
      } else {
        await createBlog(payload);
      }

      resetForm();
      await load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save blog"
      );
    }
  };

  const syncEditorContent = () => {
    if (!contentRef.current) return;

    setForm((prev) => ({
      ...prev,
      content: contentRef.current.innerHTML,
    }));
  };

  const runEditorCommand = (command, value = null) => {
    if (!contentRef.current) return;

    contentRef.current.focus();

    document.execCommand(command, false, value);

    syncEditorContent();
  };

  const handleCreateLink = () => {
    if (!contentRef.current) return;

    contentRef.current.focus();

    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      alert("Please select the text where you want to add a link.");
      return;
    }

    const selectedText = selection.toString().trim();

    if (!selectedText) {
      alert("Please select some text first.");
      return;
    }

    const url = window.prompt(
      "Enter the URL:",
      "https://"
    );

    if (!url) return;

    document.execCommand("createLink", false, url);

    const links = contentRef.current.querySelectorAll("a");

    links.forEach((link) => {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });

    syncEditorContent();
  };

  const handleInsertImageAtCursor = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);

    try {
      const url = await uploadBlogImage(file);

      if (!contentRef.current) return;

      contentRef.current.focus();

      const imageHtml = `
        <img
          src="${url}"
          alt="Blog image"
          style="max-width:100%;border-radius:12px;margin:16px 0;"
        />
      `;

      document.execCommand(
        "insertHTML",
        false,
        imageHtml
      );

      syncEditorContent();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Image upload failed"
      );
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
      alert(
        err.response?.data?.message ||
          "Image upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleUploadCoverImage = async (file) => {
    if (!file) return;

    setUploading(true);

    try {
      const url = await uploadBlogImage(file);

      setForm((prev) => ({
        ...prev,
        coverImage: url,
      }));
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Image upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  const setImageAt = (idx, value) => {
    setForm((prev) => {
      const next = [...prev.images];
      next[idx] = value;

      return {
        ...prev,
        images: next,
      };
    });
  };

  const addImageField = () => {
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ""],
    }));
  };

  const removeImageField = (idx) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter(
        (_, index) => index !== idx
      ),
    }));
  };

  const setLinkAt = (idx, key, value) => {
    setForm((prev) => {
      const next = [...prev.links];

      next[idx] = {
        ...next[idx],
        [key]: value,
      };

      return {
        ...prev,
        links: next,
      };
    });
  };

  const addLinkField = () => {
    setForm((prev) => ({
      ...prev,
      links: [
        ...prev.links,
        {
          label: "",
          url: "",
        },
      ],
    }));
  };

  const removeLinkField = (idx) => {
    setForm((prev) => ({
      ...prev,
      links: prev.links.filter(
        (_, index) => index !== idx
      ),
    }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">
          Blogs
        </h1>

        <button
          type="button"
          onClick={() =>
            showForm
              ? resetForm()
              : setShowForm(true)
          }
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
        >
          {showForm ? "Cancel" : "+ New Post"}
        </button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <form
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            {error && (
              <p className="text-red-500 text-sm">
                {error}
              </p>
            )}

            {uploading && (
              <p className="text-blue-500 text-sm">
                Uploading image...
              </p>
            )}

            <input
              required
              placeholder="Title"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              className="w-full border rounded-md px-3 py-2"
            />

            <select
              required
              value={form.category}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">
                Select category
              </option>
              <option value="EXPERIENCE">
                Experience
              </option>
              <option value="TECH">
                Tech
              </option>
              <option value="CAREER_TIPS">
                Career Tips
              </option>
              <option value="SESSION_RECAP">
                Session Recap
              </option>
              <option value="OTHER">
                Other
              </option>
            </select>

            <div>
              <label className="block text-sm font-medium mb-1">
                Cover image
              </label>

              <div className="flex items-center gap-3">
                {form.coverImage && (
                  <img
                    src={form.coverImage}
                    alt="cover"
                    className="h-16 w-16 object-cover rounded-md"
                  />
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleUploadCoverImage(
                      e.target.files?.[0]
                    )
                  }
                  className="text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Content
              </label>

              {/* sticky: stays visible at the top of the screen while you scroll through a long post.
                  top-16 on mobile leaves room for the layout's own sticky header. */}
              <div
                role="toolbar"
                aria-label="Text formatting"
                className="sticky top-16 lg:top-0 z-20 flex flex-wrap items-center gap-1 rounded-t-md border border-gray-300 bg-gray-50 p-2 shadow-sm"
              >
                {[
                  { title: "Bold", icon: Bold, run: () => runEditorCommand("bold") },
                  { title: "Italic", icon: Italic, run: () => runEditorCommand("italic") },
                  { title: "Underline", icon: Underline, run: () => runEditorCommand("underline") },
                  "divider",
                  { title: "Bullet list", icon: List, run: () => runEditorCommand("insertUnorderedList") },
                  { title: "Numbered list", icon: ListOrdered, run: () => runEditorCommand("insertOrderedList") },
                  "divider",
                  { title: "Insert link", icon: Link2, run: handleCreateLink },
                ].map((item, index) =>
                  item === "divider" ? (
                    <span key={`divider-${index}`} className="mx-1 h-6 w-px bg-gray-300" />
                  ) : (
                    <button
                      key={item.title}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={item.run}
                      className="rounded p-2 text-gray-700 hover:bg-gray-200"
                      title={item.title}
                      aria-label={item.title}
                    >
                      <item.icon size={18} />
                    </button>
                  )
                )}

                <label
                  className="cursor-pointer rounded p-2 text-gray-700 hover:bg-gray-200"
                  title="Insert image"
                  aria-label="Insert image"
                >
                  <ImagePlus size={18} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleInsertImageAtCursor}
                  />
                </label>

                <span className="mx-1 h-6 w-px bg-gray-300" />

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => runEditorCommand("removeFormat")}
                  className="rounded p-2 text-gray-700 hover:bg-gray-200"
                  title="Remove formatting"
                  aria-label="Remove formatting"
                >
                  <Eraser size={18} />
                </button>

                {uploading && (
                  <span className="ml-auto text-xs text-blue-500">Uploading image...</span>
                )}
              </div>

              <div
                ref={contentRef}
                contentEditable
                suppressContentEditableWarning
                onInput={syncEditorContent}
                className="min-h-[260px] w-full rounded-b-md border border-t-0 border-gray-300 bg-white px-4 py-3 text-sm leading-7 outline-none focus:border-blue-500 [&_a]:text-blue-600 [&_a]:underline [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1"
              />

              <p className="mt-1 text-xs text-gray-400">
                Select text and use the toolbar to
                format it. You can add links, bullet
                points, numbered lists, and images
                inside the content.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Gallery images (optional, shown at
                the end of the post)
              </label>

              {form.images.map((img, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 mb-2"
                >
                  {img && (
                    <img
                      src={img}
                      alt=""
                      className="h-10 w-10 object-cover rounded-md"
                    />
                  )}

                  <input
                    placeholder="Image URL"
                    value={img}
                    onChange={(e) =>
                      setImageAt(
                        idx,
                        e.target.value
                      )
                    }
                    className="flex-1 border rounded-md px-3 py-2 text-sm"
                  />

                  <label className="text-xs text-blue-600 cursor-pointer hover:underline whitespace-nowrap">
                    Upload

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleUploadToGallerySlot(
                          idx,
                          e.target.files?.[0]
                        )
                      }
                    />
                  </label>

                  {form.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeImageField(idx)
                      }
                      className="text-red-500 px-2"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addImageField}
                className="text-sm text-blue-600"
              >
                + Add image slot
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Links
              </label>

              {form.links.map((link, idx) => (
                <div
                  key={idx}
                  className="flex gap-2 mb-2"
                >
                  <input
                    placeholder="Label (optional)"
                    value={link.label}
                    onChange={(e) =>
                      setLinkAt(
                        idx,
                        "label",
                        e.target.value
                      )
                    }
                    className="w-1/3 border rounded-md px-3 py-2 text-sm"
                  />

                  <input
                    placeholder="https://example.com"
                    value={link.url}
                    onChange={(e) =>
                      setLinkAt(
                        idx,
                        "url",
                        e.target.value
                      )
                    }
                    className="flex-1 border rounded-md px-3 py-2 text-sm"
                  />

                  {form.links.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeLinkField(idx)
                      }
                      className="text-red-500 px-2"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addLinkField}
                className="text-sm text-blue-600"
              >
                + Add link
              </button>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {editingId
                ? "Update Post"
                : "Publish"}
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
          {blogs.map((blog) => {
            const isOwner =
              blog.author?._id === user?.id ||
              blog.author === user?.id;

            return (
              <Link
                key={blog._id}
                to={`/mentor/blogs/${blog._id}`}
                className="block"
              >
                <Card
                  padded={false}
                  className="overflow-hidden h-full hover:shadow-md transition"
                >
                  {blog.coverImage && (
                    <img
                      src={safeUrl(blog.coverImage)}
                      alt=""
                      className="w-full h-32 object-cover"
                    />
                  )}

                  <div className="p-4">
                    <Badge
                      tone="brand"
                      className="mb-2"
                    >
                      {blog.category}
                    </Badge>

                    <h2 className="font-medium text-brand-navy">
                      {blog.title}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {previewText(blog.content)}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Heart size={12} />
                        {blog.likes?.length || 0}
                      </span>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) =>
                            handleShare(
                              e,
                              blog._id
                            )
                          }
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-green"
                        >
                          {copiedId ===
                          blog._id ? (
                            <>
                              <Check size={12} />
                              Copied
                            </>
                          ) : (
                            <>
                              <Share2 size={12} />
                              Share
                            </>
                          )}
                        </button>

                        {isOwner && (
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                startEdit(blog);
                              }}
                              className="text-sm text-blue-600"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDelete(
                                  blog._id
                                );
                              }}
                              className="text-sm text-red-500"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Blogs;