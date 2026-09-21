import { useEffect, useState } from "react";
import { getAllStudents, updateStudent } from "../services/studentService";
import Badge from "../components/ui/Badge";
import { Search, Pencil, Check, X } from "lucide-react";

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batchFilter, setBatchFilter] = useState("");
  const [idSearch, setIdSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", studentId: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    const params = {};
    if (batchFilter) params.batch = batchFilter;
    if (idSearch) params.studentId = idSearch;
    getAllStudents(params).then(setStudents).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [batchFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    load();
  };

  const startEdit = (s) => {
    setError("");
    setEditingId(s._id);
    setEditForm({ name: s.user?.name || "", email: s.user?.email || "", studentId: s.studentId || "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setError("");
  };

  const saveEdit = async (id) => {
    setSaving(true);
    setError("");
    try {
      await updateStudent(id, editForm);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update student");
    } finally {
      setSaving(false);
    }
  };

  const batches = [...new Set(students.map((s) => s.batch).filter(Boolean))].sort();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Students</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={idSearch}
              onChange={(e) => setIdSearch(e.target.value)}
              placeholder="Search by student ID"
              className="border rounded-md pl-8 pr-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="text-sm bg-gray-800 text-white px-3 py-2 rounded-md">Search</button>
        </form>

        <select
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">All batches</option>
          {batches.map((b) => (
            <option key={b} value={b}>Batch {b}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Student ID</th>
                <th className="p-3">Batch</th>
                <th className="p-3">Email</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const isEditing = editingId === s._id;
                return (
                  <tr key={s._id} className="border-t">
                    {isEditing ? (
                      <>
                        <td className="p-2">
                          <input
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="border rounded-md px-2 py-1 text-sm w-full"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            value={editForm.studentId}
                            onChange={(e) => setEditForm({ ...editForm, studentId: e.target.value })}
                            className="border rounded-md px-2 py-1 text-sm w-full"
                          />
                        </td>
                        <td className="p-3">{s.batch ? <Badge tone="info">Batch {s.batch}</Badge> : "—"}</td>
                        <td className="p-2">
                          <input
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="border rounded-md px-2 py-1 text-sm w-full"
                          />
                        </td>
                        <td className="p-3">
                          <Badge tone={s.user?.isActive ? "success" : "danger"}>
                            {s.user?.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <button onClick={() => saveEdit(s._id)} disabled={saving} className="text-green-600 p-1 disabled:opacity-50">
                            <Check size={16} />
                          </button>
                          <button onClick={cancelEdit} className="text-gray-400 p-1">
                            <X size={16} />
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-3">{s.user?.name}</td>
                        <td className="p-3">{s.studentId}</td>
                        <td className="p-3">{s.batch ? <Badge tone="info">Batch {s.batch}</Badge> : "—"}</td>
                        <td className="p-3">{s.user?.email}</td>
                        <td className="p-3">
                          <Badge tone={s.user?.isActive ? "success" : "danger"}>
                            {s.user?.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <button onClick={() => startEdit(s)} className="text-gray-400 hover:text-blue-600">
                            <Pencil size={14} />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr><td colSpan={6} className="p-4 text-center text-gray-400">No students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;