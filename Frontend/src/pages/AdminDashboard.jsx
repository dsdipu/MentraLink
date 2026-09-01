// Frontend/src/pages/AdminDashboard.jsx
import { useState, useEffect } from "react";
import axios from "axios";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalMentors: 0,
    totalGroups: 0,
    totalSessions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // TODO: backend-e admin dashboard summary API confirm hole eta bodlao
        const response = await axios.get("http://localhost:5000/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(response.data?.stats ?? stats);
      } catch (err) {
        setError("Could not load dashboard stats (API not confirmed yet)");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const cards = [
    { label: "Total Students", value: stats.totalStudents },
    { label: "Total Mentors", value: stats.totalMentors },
    { label: "Total Groups", value: stats.totalGroups },
    { label: "Total Sessions", value: stats.totalSessions },
  ];

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>
      {error && <p className="text-orange-500 mb-4">{error}</p>}
      {loading ? (
        <p className="text-gray-500">Loading stats...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-sm text-gray-500">{c.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;