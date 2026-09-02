import { useEffect, useState } from "react";
import api from "../../services/api";

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/dashboard/student");
        setData(res.data);
      } catch {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Welcome back!</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Next Session</p>
          <p className="text-lg font-medium">{data?.nextSession || "None"}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Attendance</p>
          <p className="text-lg font-medium">{data?.attendancePercent ?? "-"}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Pending Feedback</p>
          <p className="text-lg font-medium">{data?.pendingFeedback ?? 0}</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;