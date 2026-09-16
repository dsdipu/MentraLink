import { useEffect, useState } from "react";
import { getSessions } from "../services/sessionService";

const STATUS_COLORS = {
  UPCOMING: "bg-blue-100 text-blue-700",
  ONGOING: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const AdminSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSessions().then(setSessions).finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">All Sessions</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Title</th>
              <th className="p-3">Mentor</th>
              <th className="p-3">Semester</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s._id} className="border-t">
                <td className="p-3">{new Date(s.date).toLocaleDateString()}</td>
                <td className="p-3">#{s.sessionNumber} {s.title}</td>
                <td className="p-3">{s.mentor?.user?.name || "-"}</td>
                <td className="p-3">{s.semester?.name || "-"}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[s.status] || ""}`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr><td colSpan={5} className="p-4 text-center text-gray-400">No sessions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSessions;