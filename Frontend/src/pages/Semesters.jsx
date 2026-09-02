import { useEffect, useState } from "react";
import { getSemesters, createSemester, updateSemester, deleteSemester } from "../services/semesterService";

const emptyForm = { name: "", academicYear: "", startDate: "", endDate: "", status: "UPCOMING" };

const Semesters = () => {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const load = () => getSemesters().then(setSemesters).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (s) => {
    setEditingId(s._id);
    setForm({
      name: s.name,
      academicYear: s.academicYear,
      startDate: s.startDate?.slice(0, 10) || "",
      endDate: s.endDate?.slice(0, 10) || "",
      status: s.status,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await updateSemester(editingId, form);
      } else {
        await createSemester(form);
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save semester");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this semester?")) return;
    await deleteSemester(id);
    load();
  };

  if (loading) return <p>Loading semesters...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Semesters</h1>
        <button
          onClick={() => (showForm ? setShowForm(false) : openCreate())}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ New Semester"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-4 space-y-3">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <input required placeholder="Name (e.g. Spring 2026)" name="name" value={form.name} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
          <input required placeholder="Academic Year (e.g. 2025-2026)" name="academicYear" value={form.academicYear} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
          <div className="flex gap-3">
            <input required type="date" name="startDate" value={form.startDate} onChange={handleChange} className="flex-1 border rounded-md px-3 py-2" />
            <input required type="date" name="endDate" value={form.endDate} onChange={handleChange} className="flex-1 border rounded-md px-3 py-2" />
          </div>
          <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded-md px-3 py-2">
            <option value="UPCOMING">Upcoming</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">
            {editingId ? "Update" : "Create"}
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow divide-y">
        {semesters.map((s) => (
          <div key={s._id} className="p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{s.name} <span className="text-sm text-gray-500">({s.academicYear})</span></p>
              <p className="text-sm text-gray-500">
                {new Date(s.startDate).toLocaleDateString()} — {new Date(s.endDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">{s.status}</span>
              <button onClick={() => openEdit(s)} className="text-sm text-blue-600 hover:underline">Edit</button>
              <button onClick={() => handleDelete(s._id)} className="text-sm text-red-600 hover:underline">Delete</button>
            </div>
          </div>
        ))}
        {semesters.length === 0 && <p className="p-4 text-gray-500">No semesters yet.</p>}
      </div>
    </div>
  );
};

export default Semesters;