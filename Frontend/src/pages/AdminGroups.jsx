import { useEffect, useState } from "react";
import { getGroups } from "../services/groupService";
import { getSemesters } from "../services/semesterService";
import Badge from "../components/ui/Badge";

const AdminGroups = () => {
  const [groups, setGroups] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [semesterFilter, setSemesterFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    Promise.all([getGroups(), getSemesters()])
      .then(([g, s]) => {
        setGroups(g);
        setSemesters(s);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  const filtered = groups.filter((g) => {
    if (semesterFilter && g.semester?._id !== semesterFilter) return false;
    if (statusFilter && g.status !== statusFilter) return false;
    return true;
  });

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
            <option key={s._id} value={s._id}>{s.name} ({s.academicYear})</option>
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
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Group</th>
              <th className="p-3">Semester</th>
              <th className="p-3">Mentor</th>
              <th className="p-3">Students</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => (
              <tr key={g._id} className="border-t">
                <td className="p-3 font-medium">{g.name}</td>
                <td className="p-3">{g.semester?.name} ({g.semester?.academicYear})</td>
                <td className="p-3">{g.mentor?.user?.name || <span className="text-orange-500">Not assigned</span>}</td>
                <td className="p-3">{g.students?.length || 0}</td>
                <td className="p-3">
                  <Badge tone={g.status === "ACTIVE" ? "success" : "neutral"}>{g.status}</Badge>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="p-4 text-center text-gray-400">No groups match this filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminGroups;