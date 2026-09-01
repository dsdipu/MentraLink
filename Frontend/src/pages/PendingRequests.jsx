import { useState, useEffect } from "react";
import axios from "axios";

function PendingRequests() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null); // tracks which user's button is loading
  const token = localStorage.getItem("token");

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/auth/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingUsers(res.data.pendingUsers ?? []);
      setError("");
    } catch (err) {
      setError("Could not load pending requests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = async (userId) => {
    setActionLoading(userId);
    try {
      await axios.patch(
        `http://localhost:5000/api/auth/approve/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // remove from list after approval
      setPendingUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      alert("Failed to approve user");
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm("Are you sure you want to reject this registration?")) return;
    setActionLoading(userId);
    try {
      await axios.delete(`http://localhost:5000/api/auth/reject/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      alert("Failed to reject user");
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-brand-navy">Pending Registrations</h1>

      {error && (
        <p className="text-orange-600 bg-orange-50 border border-orange-200 rounded-md px-3 py-2 mb-4 text-sm">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : pendingUsers.length === 0 ? (
        <p className="text-gray-500">No pending registrations.</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-sm font-semibold text-gray-600">Name</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Email</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Role</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((user) => (
                <tr key={user._id} className="border-b last:border-0">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.role}</td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => handleApprove(user._id)}
                      disabled={actionLoading === user._id}
                      className="px-3 py-1 rounded-md bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(user._id)}
                      disabled={actionLoading === user._id}
                      className="px-3 py-1 rounded-md bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PendingRequests;