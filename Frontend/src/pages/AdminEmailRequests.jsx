import { useEffect, useState } from "react";
import { getEmailRequests, updateEmailRequestStatus } from "../services/emailRequestService";

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONTACTED: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-green-100 text-green-700",
};

const AdminEmailRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => getEmailRequests().then(setRequests).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id, status) => {
    await updateEmailRequestStatus(id, status);
    load();
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Student Email Requests</h1>
      <div className="bg-white rounded-lg shadow divide-y">
        {requests.map((r) => (
          <div key={r._id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium">{r.name}</p>
                <p className="text-sm text-gray-500">{r.personalEmail}</p>
                {r.phone && <p className="text-sm text-gray-500">{r.phone}</p>}
              </div>
              <select
                value={r.status}
                onChange={(e) => handleStatusChange(r._id, e.target.value)}
                className={`text-xs px-2 py-1 rounded-full border-0 ${STATUS_COLORS[r.status] || ""}`}
              >
                <option value="PENDING">PENDING</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="RESOLVED">RESOLVED</option>
              </select>
            </div>
            {r.admissionInfo && <p className="text-sm text-gray-600">Admission: {r.admissionInfo}</p>}
            {r.message && <p className="text-sm text-gray-600 mt-1">{r.message}</p>}
            <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleString()}</p>
          </div>
        ))}
        {requests.length === 0 && <p className="p-4 text-gray-500">No requests yet.</p>}
      </div>
    </div>
  );
};

export default AdminEmailRequests;