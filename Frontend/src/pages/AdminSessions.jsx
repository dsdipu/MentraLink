import { useEffect, useState } from "react";
import { getSessions } from "../services/sessionService";
import StatCard from "../components/ui/StatCard";
import { ListChecks, CheckCircle2, Clock } from "lucide-react";

const STATUS_COLORS = {
  UPCOMING: "bg-blue-100 text-blue-700",
  ONGOING: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const FILTERS = ["ALL", "UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"];

const AdminSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    getSessions().then(setSessions).finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  const completedCount = sessions.filter((s) => s.status === "COMPLETED").length;
  const upcomingCount = sessions.filter((s) => s.status === "UPCOMING").length;

  const filtered = filter === "ALL" ? sessions : sessions.filter((s) => s.status === filter);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">All Sessions</h1>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatCard icon={ListChecks} label="Total Sessions" value={sessions.length} tone="brand" />
        <StatCard icon={CheckCircle2} label="Completed" value={completedCount} tone="blue" />
        <StatCard icon={Clock} label="Upcoming" value={upcomingCount} tone="gold" />
      </div>

      <div className="flex gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              filter === f
                ? "bg-brand-navy text-white border-brand-navy"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

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
            {filtered.map((s) => (
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
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="p-4 text-center text-gray-400">No sessions found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSessions;