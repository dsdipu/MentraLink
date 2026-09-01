import { useState, useEffect } from "react";
import axios from "axios";
import { Users, GraduationCap, UsersRound, CalendarDays } from "lucide-react";

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
        const response = await axios.get(
          "http://localhost:5000/api/dashboard/admin",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = response.data;
        setStats({
          totalStudents: data.totalStudents ?? 0,
          totalMentors: data.totalMentors ?? 0,
          totalGroups: data.activeGroups ?? 0,
          totalSessions: data.totalSessions ?? 0,
        });
      } catch (err) {
        setError("Could not load dashboard stats");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const cards = [
    {
      label: "Total Students",
      value: stats.totalStudents,
      icon: GraduationCap,
      iconBg: "bg-[#E7F0FF]",
      iconColor: "text-[#1877F2]",
    },
    {
      label: "Total Mentors",
      value: stats.totalMentors,
      icon: Users,
      iconBg: "bg-[#E9F8EF]",
      iconColor: "text-[#31A24C]",
    },
    {
      label: "Active Groups",
      value: stats.totalGroups,
      icon: UsersRound,
      iconBg: "bg-[#FFF1E6]",
      iconColor: "text-[#F7923F]",
    },
    {
      label: "Total Sessions",
      value: stats.totalSessions,
      icon: CalendarDays,
      iconBg: "bg-[#F3E8FF]",
      iconColor: "text-[#9333EA]",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of your mentorship program
        </p>
      </div>

      {error && (
        <p className="text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2.5 mb-5 text-sm">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-[104px] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-full ${c.iconBg} flex items-center justify-center shrink-0`}
                >
                  <Icon size={22} className={c.iconColor} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {c.value}
                  </p>
                  <p className="text-sm text-gray-500">{c.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
