import { useEffect, useState } from "react";
import {
  getSemesters,
  createSemester,
  updateSemester,
  deleteSemester,
} from "../services/semesterService";

const emptyForm = {
  name: "",
  academicYear: "",
  batch: "",
  startDate: "",
  endDate: "",
  status: "UPCOMING",
};

const Semesters = () => {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);

    getSemesters()
      .then(setSemesters)
      .catch((err) => {
        setError(
          err.response?.data?.message || "Failed to load semesters"
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEdit = (semester) => {
    setEditingId(semester._id);

    setForm({
      name: semester.name || "",
      academicYear: semester.academicYear || "",
      batch: semester.batch || "",
      startDate: semester.startDate?.slice(0, 10) || "",
      endDate: semester.endDate?.slice(0, 10) || "",
      status: semester.status || "UPCOMING",
    });

    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const payload = {
        ...form,
        batch: form.batch.trim(),
      };

      if (editingId) {
        await updateSemester(editingId, payload);
      } else {
        await createSemester(payload);
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save semester"
      );
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this semester?")) return;

    try {
      await deleteSemester(id);
      load();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete semester"
      );
    }
  };

  if (loading) {
    return <p>Loading semesters...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Semesters
        </h1>

        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingId(null);
              setForm(emptyForm);
              setError("");
            } else {
              openCreate();
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ New Semester"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 rounded-lg shadow mb-4 space-y-3"
        >
          {error && (
            <p className="text-red-500 text-sm">
              {error}
            </p>
          )}

          <input
            required
            placeholder="Name (e.g. Fall 2026)"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2"
          />

          <input
            required
            placeholder="Academic Year (e.g. 2026)"
            name="academicYear"
            value={form.academicYear}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2"
          />

          <input
            required
            placeholder="Batch (e.g. 262)"
            name="batch"
            value={form.batch}
            onChange={handleChange}
            maxLength={3}
            className="w-full border rounded-md px-3 py-2"
          />

          <div className="flex gap-3">
            <input
              required
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="flex-1 border rounded-md px-3 py-2"
            />

            <input
              required
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              className="flex-1 border rounded-md px-3 py-2"
            />
          </div>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="UPCOMING">Upcoming</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {editingId ? "Update" : "Create"}
          </button>
        </form>
      )}

      {error && !showForm && (
        <p className="text-red-500 text-sm mb-4">
          {error}
        </p>
      )}

      <div className="bg-white rounded-lg shadow divide-y">
        {semesters.map((semester) => (
          <div
            key={semester._id}
            className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
          >
            <div>
              <p className="font-medium text-gray-900">
                {semester.name}{" "}
                <span className="text-sm text-gray-500">
                  ({semester.academicYear})
                </span>
              </p>

              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                <p className="text-sm text-gray-500">
                  Batch:{" "}
                  <span className="font-medium text-gray-700">
                    {semester.batch || "Not set"}
                  </span>
                </p>

                <p className="text-sm text-gray-500">
                  {new Date(
                    semester.startDate
                  ).toLocaleDateString()}{" "}
                  —{" "}
                  {new Date(
                    semester.endDate
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  semester.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : semester.status === "COMPLETED"
                    ? "bg-gray-100 text-gray-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {semester.status}
              </span>

              <button
                onClick={() => openEdit(semester)}
                className="text-sm text-blue-600 hover:underline"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(semester._id)}
                className="text-sm text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {semesters.length === 0 && (
          <p className="p-4 text-gray-500">
            No semesters yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default Semesters;