import { useEffect, useState } from "react";
import { getMySessions } from "../../services/sessionService";

const statusColor = {
  upcoming: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMySessions()
      .then(setSessions)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading sessions...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">My Sessions</h1>

      {sessions.length === 0 ? (
        <p className="text-gray-500">No sessions scheduled yet.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Mentor</th>
                <th className="p-3">Topic</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s._id} className="border-t">
                  <td className="p-3">{new Date(s.date).toLocaleString()}</td>
                  <td className="p-3">{s.mentorName}</td>
                  <td className="p-3">{s.topic}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        statusColor[s.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {s.status}
                    </span>
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

export default Sessions;