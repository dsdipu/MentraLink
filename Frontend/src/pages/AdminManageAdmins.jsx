import { useEffect, useState } from "react";
import { getAdmins, createAdmin, updateAdmin, toggleAdminStatus } from "../services/adminService";
import useAuth from "../hooks/useAuth";

const emptyForm = { name: "", email: "", password: "" };

const AdminManageAdmins = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => getAdmins().then(setAdmins).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const startEdit = (admin) => {
    setForm({ name: admin.name, email: admin.email, password: "" });
    setEditingId(admin._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await updateAdmin(editingId, { name: form.name, email: form.email });
      } else {
        await createAdmin(form);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save admin");
    }
  };

  const handleToggle = async (admin) => {
    if (admin._id === user?.id) return; // safety net matches backend guard
    try {
      await toggleAdminStatus(admin._id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update admin status");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Manage Admins</h1>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ New Admin"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-6 space-y-3 max-w-sm">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <input
            required placeholder="Full name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
          />
          <input
            required type="email" placeholder="Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
          />
          {!editingId && (
            <input
              required type="password" placeholder="Password" minLength={6} value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            />
          )}
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
            {editingId ? "Update Admin" : "Create Admin"}
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow divide-y">
        {admins.map((a) => (
          <div key={a._id} className="p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">
                {a.name} {a._id === user?.id && <span className="text-xs text-gray-400">(you)</span>}
              </p>
              <p className="text-sm text-gray-500">{a.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded-full ${a.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {a.isActive ? "Active" : "Inactive"}
              </span>
              <button onClick={() => startEdit(a)} className="text-sm text-blue-600 hover:underline">Edit</button>
              {a._id !== user?.id && (
                <button onClick={() => handleToggle(a)} className="text-sm text-red-500 hover:underline">
                  {a.isActive ? "Deactivate" : "Activate"}
                </button>
              )}
            </div>
          </div>
        ))}
        {admins.length === 0 && <p className="p-4 text-gray-500">No admins found.</p>}
      </div>
    </div>
  );
};

export default AdminManageAdmins;