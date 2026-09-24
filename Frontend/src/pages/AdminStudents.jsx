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
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    studentId: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);

    const params = {};

    if (batchFilter) {
      params.batch = batchFilter;
    }

    if (idSearch) {
      params.studentId = idSearch;
    }

    getAllStudents(params)
      .then(setStudents)
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            "Failed to load students"
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [batchFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    load();
  };

  const startEdit = (student) => {
    setError("");
    setEditingId(student._id);

    setEditForm({
      name: student.user?.name || "",
      email: student.user?.email || "",
      studentId: student.studentId || "",
    });
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
      setError(
        err.response?.data?.message ||
          "Failed to update student"
      );
    } finally {
      setSaving(false);
    }
  };

  const batches = [
    ...new Set(
      students
        .map((student) => student.batch)
        .filter(Boolean)
    ),
  ].sort();

  return (
    <div className="w-full min-w-0">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
          Students
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          View and manage student information.
        </p>
      </div>

      <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
        <form
          onSubmit={handleSearchSubmit}
          className="flex min-w-0 gap-2"
        >
          <div className="relative min-w-0 flex-1 sm:flex-none">
            <Search
              size={15}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={idSearch}
              onChange={(e) =>
                setIdSearch(e.target.value)
              }
              placeholder="Search by student ID"
              className="w-full rounded-md border px-3 py-2 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-56"
            />
          </div>

          <button
            type="submit"
            className="shrink-0 rounded-md bg-gray-800 px-3 py-2 text-sm text-white hover:bg-gray-900"
          >
            Search
          </button>
        </form>

        <select
          value={batchFilter}
          onChange={(e) =>
            setBatchFilter(e.target.value)
          }
          className="w-full rounded-md border px-3 py-2 text-sm sm:w-auto"
        >
          <option value="">All batches</option>

          {batches.map((batch) => (
            <option key={batch} value={batch}>
              Batch {batch}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="mb-3 text-sm text-red-500">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <p className="text-sm text-gray-500">
            Loading students...
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-lg bg-white shadow sm:block">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Student ID</th>
                  <th className="p-3">Batch</th>
                  <th className="p-3"></th>
                </tr>
              </thead>

              <tbody>
                {students.map((student) => {
                  const isEditing =
                    editingId === student._id;

                  return (
                    <tr
                      key={student._id}
                      className="border-t"
                    >
                      {isEditing ? (
                        <>
                          <td className="p-2">
                            <input
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  name: e.target.value,
                                })
                              }
                              className="w-full rounded-md border px-2 py-1 text-sm"
                            />
                          </td>

                          <td className="p-2">
                            <input
                              value={
                                editForm.studentId
                              }
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  studentId:
                                    e.target.value,
                                })
                              }
                              className="w-full rounded-md border px-2 py-1 text-sm"
                            />
                          </td>

                          <td className="p-3">
                            {student.batch ? (
                              <Badge tone="info">
                                Batch {student.batch}
                              </Badge>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td className="p-2 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() =>
                                saveEdit(student._id)
                              }
                              disabled={saving}
                              className="p-1 text-green-600 disabled:opacity-50"
                            >
                              <Check size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="p-1 text-gray-400"
                            >
                              <X size={16} />
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-3 font-medium text-gray-800">
                            {student.user?.name || "—"}
                          </td>

                          <td className="p-3">
                            {student.studentId || "—"}
                          </td>

                          <td className="p-3">
                            {student.batch ? (
                              <Badge tone="info">
                                Batch {student.batch}
                              </Badge>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() =>
                                startEdit(student)
                              }
                              className="text-gray-400 hover:text-blue-600"
                            >
                              <Pencil size={14} />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}

                {students.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-6 text-center text-gray-400"
                    >
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 sm:hidden">
            {students.map((student) => {
              const isEditing =
                editingId === student._id;

              return (
                <div
                  key={student._id}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                          Name
                        </label>

                        <input
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              name: e.target.value,
                            })
                          }
                          className="w-full rounded-md border px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                          Student ID
                        </label>

                        <input
                          value={
                            editForm.studentId
                          }
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              studentId:
                                e.target.value,
                            })
                          }
                          className="w-full rounded-md border px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            saveEdit(student._id)
                          }
                          disabled={saving}
                          className="flex items-center gap-1 rounded-md bg-green-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                        >
                          <Check size={15} />
                          Save
                        </button>

                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="flex items-center gap-1 rounded-md border px-3 py-2 text-sm text-gray-600"
                        >
                          <X size={15} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-words font-semibold text-gray-900">
                          {student.user?.name ||
                            "Unnamed student"}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          ID:{" "}
                          {student.studentId || "—"}
                        </p>

                        <div className="mt-2">
                          {student.batch ? (
                            <Badge tone="info">
                              Batch {student.batch}
                            </Badge>
                          ) : (
                            <span className="text-sm text-gray-400">
                              Batch not available
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          startEdit(student)
                        }
                        className="shrink-0 text-gray-400 hover:text-blue-600"
                      >
                        <Pencil size={15} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {students.length === 0 && (
              <div className="rounded-lg border border-dashed border-gray-300 bg-white px-5 py-10 text-center">
                <p className="text-sm text-gray-400">
                  No students found.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminStudents;