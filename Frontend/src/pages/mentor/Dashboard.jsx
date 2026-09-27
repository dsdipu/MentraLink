import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboard } from "../../services/mentorService";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Mentor Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Assigned Students</p>
          <p className="text-lg font-medium">{data?.studentCount ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Upcoming Sessions</p>
          <p className="text-lg font-medium">{data?.upcomingSessions ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Average Rating</p>
          <p className="text-lg font-medium">{data?.averageRating ?? "-"}/5</p>
        </div>
        <Link
          to="/mentor/blogs"
          className="bg-white p-4 rounded-lg shadow hover:shadow-md hover:-translate-y-0.5 transition block"
        >
          <p className="text-sm text-gray-500">Total Blogs</p>
          <p className="text-lg font-medium text-brand-green">{data?.blogCount ?? 0}</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;