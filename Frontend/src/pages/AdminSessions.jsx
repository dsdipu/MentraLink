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

const formatFilterName = (filter) => {
  if (filter === "ALL") return "All";
  return filter.charAt(0) + filter.slice(1).toLowerCase();
};

const AdminSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    getSessions()
      .then(setSessions)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-gray-500">Loading sessions...</p>
      </div>
    );
  }

  const completedCount = sessions.filter(
    (session) => session.status === "COMPLETED"
  ).length;

  const upcomingCount = sessions.filter(
    (session) => session.status === "UPCOMING"
  ).length;

  const filtered =
    filter === "ALL"
      ? sessions
      : sessions.filter((session) => session.status === filter);

  return (
    <div className="w-full min-w-0">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
          All Sessions
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          View all mentorship sessions and their current status.
        </p>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon={ListChecks}
          label="Total Sessions"
          value={sessions.length}
          tone="brand"
        />

        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={completedCount}
          tone="blue"
        />

        <StatCard
          icon={Clock}
          label="Upcoming"
          value={upcomingCount}
          tone="gold"
        />
      </div>

      <div className="mb-4 min-w-0 overflow-x-auto pb-1">
        <div className="flex w-max gap-2">
          {FILTERS.map((filterOption) => (
            <button
              key={filterOption}
              type="button"
              onClick={() => setFilter(filterOption)}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition ${
                filter === filterOption
                  ? "border-brand-navy bg-brand-navy text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {formatFilterName(filterOption)}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-lg bg-white shadow sm:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
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
              {filtered.map((session) => (
                <tr key={session._id} className="border-t">
                  <td className="whitespace-nowrap p-3">
                    {new Date(session.date).toLocaleDateString()}
                  </td>

                  <td className="max-w-[280px] p-3">
                    <p className="truncate">
                      #{session.sessionNumber} {session.title}
                    </p>
                  </td>

                  <td className="max-w-[180px] p-3">
                    <p className="truncate">
                      {session.mentor?.user?.name || "-"}
                    </p>
                  </td>

                  <td className="max-w-[180px] p-3">
                    <p className="truncate">
                      {session.semester?.name || "-"}
                    </p>
                  </td>

                  <td className="p-3">
                    <span
                      className={`inline-block whitespace-nowrap rounded-full px-2 py-1 text-xs ${
                        STATUS_COLORS[session.status] || ""
                      }`}
                    >
                      {session.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-6 text-center text-gray-400"
                  >
                    No sessions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 sm:hidden">
        {filtered.map((session) => (
          <div
            key={session._id}
            className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500">
                  Session {session.sessionNumber || "-"}
                </p>

                <h2 className="mt-1 break-words text-base font-semibold text-gray-900">
                  {session.title || "Untitled Session"}
                </h2>
              </div>

              <span
                className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
                  STATUS_COLORS[session.status] ||
                  "bg-gray-100 text-gray-700"
                }`}
              >
                {session.status || "UNKNOWN"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 border-t border-gray-100 pt-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Date
                </p>
                <p className="mt-0.5 break-words text-sm text-gray-700">
                  {session.date
                    ? new Date(session.date).toLocaleDateString()
                    : "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Mentor
                </p>
                <p className="mt-0.5 break-words text-sm text-gray-700">
                  {session.mentor?.user?.name || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Semester
                </p>
                <p className="mt-0.5 break-words text-sm text-gray-700">
                  {session.semester?.name || "-"}
                </p>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white px-5 py-10 text-center">
            <p className="text-sm text-gray-400">
              No sessions found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSessions;