import { useEffect, useState } from "react";
import { getMyAttendance, getAttendanceStats } from "../../services/attendanceService";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { CheckCircle2, XCircle, Percent, ClipboardCheck } from "lucide-react";

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyAttendance(), getAttendanceStats()])
      .then(([recordsData, statsData]) => {
        setRecords(recordsData);
        setStats(statsData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading attendance...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">My Attendance</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard icon={CheckCircle2} label="Present" value={stats?.present ?? 0} tone="brand" />
        <StatCard icon={XCircle} label="Absent" value={stats?.absent ?? 0} tone="gold" />
        <StatCard icon={Percent} label="Attendance" value={`${stats?.percentage ?? 0}%`} tone="blue" />
      </div>

      {records.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No attendance records yet"
          description="Records appear here once your mentor marks attendance for a completed session."
        />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Session</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="p-3">{r.session?.date ? new Date(r.session.date).toLocaleDateString() : "-"}</td>
                  <td className="p-3">{r.session?.title || "-"}</td>
                  <td className="p-3">
                    <Badge tone={r.status === "PRESENT" ? "success" : "danger"}>{r.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Attendance;