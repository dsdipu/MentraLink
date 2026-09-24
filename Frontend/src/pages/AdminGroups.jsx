import { useEffect, useState } from "react";
import {
  getGroups,
  updateGroup,
  getAllMentors,
  getAllStudents,
} from "../services/groupService";
import { getSemesters } from "../services/semesterService";
import Badge from "../components/ui/Badge";

const AdminGroups = () => {
  const [groups, setGroups] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [semesterFilter, setSemesterFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingGroup, setEditingGroup] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [editForm, setEditForm] = useState({
    name: "",
    semester: "",
    mentor: "",
    status: "ACTIVE",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getGroups(),
      getSemesters(),
      getAllMentors(),
      getAllStudents(),
    ])
      .then(([g, s, m, st]) => {
        setGroups(g);
        setSemesters(s);
        setMentors(m);
        setStudents(st);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  const filtered = groups.filter((g) => {
    if (semesterFilter && g.semester?._id !== semesterFilter) return false;
    if (statusFilter && g.status !== statusFilter) return false;
    return true;
  });

  const openEditModal = (group) => {
    setEditingGroup(group);
    setEditForm({
      name: group.name || "",
      semester: group.semester?._id || "",
      mentor: group.mentor?._id || "",
      status: group.status || "ACTIVE",
    });
    setError("");
  };

  const closeEditModal = () => {
    if (saving) return;

    setEditingGroup(null);
    setError("");
  };

  const handleSave = async () => {
    if (!editForm.name.trim()) {
      setError("Group name is required.");
      return;
    }

    if (!editForm.semester) {
      setError("Please select a semester.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const updated = await updateGroup(editingGroup._id, {
        name: editForm.name.trim(),
        semester: editForm.semester,
        mentor: editForm.mentor || null,
        status: editForm.status,
      });

      setGroups((prev) =>
        prev.map((group) =>
          group._id === updated._id ? updated : group
        )
      );

      setEditingGroup(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update group."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Groups</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={semesterFilter}
          onChange={(e) => setSemesterFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">All semesters</option>

          {semesters.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name} ({s.academicYear})
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Group</th>
                <th className="p-3">Semester</th>
                <th className="p-3">Mentor</th>
                <th className="p-3">Students</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((g) => (
                <tr key={g._id} className="border-t">
                  <td className="p-3 font-medium">
                    {g.name}
                  </td>

                  <td className="p-3">
                    {g.semester?.name} ({g.semester?.academicYear})
                  </td>

                  <td className="p-3">
                    {g.mentor?.user?.name || (
                      <span className="text-orange-500">
                        Not assigned
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    {g.students?.length || 0}
                  </td>

                  <td className="p-3">
                    <Badge
                      tone={
                        g.status === "ACTIVE"
                          ? "success"
                          : "neutral"
                      }
                    >
                      {g.status}
                    </Badge>
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => openEditModal(g)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-4 text-center text-gray-400"
                  >
                    No groups match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingGroup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              Edit Group
            </h2>

            {error && (
              <p className="text-red-500 text-sm mb-4">
                {error}
              </p>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Group Name
                </label>

                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      name: e.target.value,
                    })
                  }
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Enter group name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Semester
                </label>

                <select
                  value={editForm.semester}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      semester: e.target.value,
                    })
                  }
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">Select semester</option>

                  {semesters.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.academicYear})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Mentor
                </label>

                <select
                  value={editForm.mentor}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      mentor: e.target.value,
                    })
                  }
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">Not assigned</option>

                  {mentors.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.user?.name || "Unnamed mentor"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Status
                </label>

                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      status: e.target.value,
                    })
                  }
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeEditModal}
                disabled={saving}
                className="px-4 py-2 border rounded-md disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGroups;