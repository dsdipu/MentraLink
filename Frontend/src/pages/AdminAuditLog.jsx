import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { getAuditLogs } from "../services/adminService";
import Badge from "../components/ui/Badge";

const TONES = {
  LOGIN_SUCCESS: "success",
  LOGIN_FAILED: "warning",
  ACCOUNT_LOCKED: "danger",
  PASSWORD_CHANGED: "info",
  PASSWORD_RESET: "info",
  USER_REJECTED: "danger",
  ADMIN_DEACTIVATED: "danger",
};

const label = (action) => action.toLowerCase().replace(/_/g, " ");

const formatTime = (value) =>
  new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const summarize = (details) => {
  if (!details || typeof details !== "object") return "";
  return Object.entries(details)
    .filter(([, value]) => value !== undefined && value !== null && typeof value !== "object")
    .map(([key, value]) => `${key}: ${value}`)
    .join(" · ");
};

// Who did what, and when: logins, lockouts, password changes, account creation, approvals ...
const AdminAuditLog = () => {
  const [data, setData] = useState({ logs: [], total: 0, page: 1, pages: 1, actions: [] });
  const [action, setAction] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    setError("");
    getAuditLogs({ action: action || undefined, search: query || undefined, page, limit: 25 })
      .then(setData)
      .catch((err) => setError(err.response?.data?.message || "Failed to load the audit log"))
      .finally(() => setLoading(false));
  }, [action, query, page]);

  return (
    <div className="w-full min-w-0">
      <div className="mb-5">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900 sm:text-2xl">
          <ShieldCheck size={22} className="text-brand-green" /> Audit Log
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          A record of important security and administration events. Entries are kept for one year.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by e-mail or target"
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:max-w-xs"
        />
        <select
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-md border px-3 py-2 text-sm sm:w-56"
          aria-label="Filter by event"
        >
          <option value="">All events</option>
          {data.actions.map((item) => (
            <option key={item} value={item}>
              {label(item)}
            </option>
          ))}
        </select>
        <p className="self-center text-sm text-gray-500 sm:ml-auto">{data.total} entries</p>
      </div>

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">When</th>
              <th className="p-3">Event</th>
              <th className="p-3">Who</th>
              <th className="p-3">Target</th>
              <th className="p-3">Details</th>
              <th className="p-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : data.logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No entries found.
                </td>
              </tr>
            ) : (
              data.logs.map((log) => (
                <tr key={log._id} className="border-t align-top">
                  <td className="whitespace-nowrap p-3 text-gray-600">{formatTime(log.createdAt)}</td>
                  <td className="p-3">
                    <Badge tone={TONES[log.action] || "neutral"}>{label(log.action)}</Badge>
                  </td>
                  <td className="p-3">
                    <p className="font-medium">{log.actor?.name || log.actorEmail || "-"}</p>
                    {log.actorRole && <p className="text-xs text-gray-400">{log.actorRole}</p>}
                  </td>
                  <td className="max-w-[16rem] break-words p-3 text-gray-600">{log.target || "-"}</td>
                  <td className="max-w-[16rem] break-words p-3 text-xs text-gray-500">
                    {summarize(log.details) || "-"}
                  </td>
                  <td className="whitespace-nowrap p-3 text-xs text-gray-400">{log.ip || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data.pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="inline-flex items-center gap-1 rounded-md border bg-white px-3 py-1.5 disabled:opacity-40"
          >
            <ChevronLeft size={15} /> Previous
          </button>
          <span className="text-gray-500">
            Page {data.page} of {data.pages}
          </span>
          <button
            type="button"
            disabled={page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex items-center gap-1 rounded-md border bg-white px-3 py-1.5 disabled:opacity-40"
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLog;
