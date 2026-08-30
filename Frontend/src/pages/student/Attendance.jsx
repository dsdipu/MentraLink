import { useEffect, useState } from "react";
import { getMyAttendance, getAttendanceStats } from "../../services/attendanceService";

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
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-sm text-gray-500">Present</p>
          <p className="text-xl font-semibold text-green-600">{stats?.present ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-sm text-gray-500">Absent</p>
          <p className="text-xl font-semibold text-red-600">{stats?.absent ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-sm text-gray-500">Percentage</p>
          <p className="text-xl font-semibold text-blue-600">{stats?.percentage ?? 0}%</p>
        </div>
      </div>

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
                <td className="p-3">{new Date(r.date).toLocaleDateString()}</td>
                <td className="p-3">{r.sessionTopic}</td>
                <td className="p-3">
                  <span
                    className={
                      r.status === "present"
                        ? "text-green-600 font-medium"
                        : "text-red-600 font-medium"
                    }
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;