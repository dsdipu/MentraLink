import { useState, useEffect } from "react";
import axios from "axios";

function PendingRequests() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const token = localStorage.getItem("token");

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/pending`, {
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
        `${import.meta.env.VITE_API_BASE_URL}/auth/approve/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve user");
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm("Are you sure you want to reject this registration?")) return;
    setActionLoading(userId);
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/auth/reject/${userId}`, {
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
        <div className="space-y-3">
          {pendingUsers.map((user) => (
            <div key={user._id} className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
              {user.role === "STUDENT" && user.idCardImage && (
                <img
                  src={user.idCardImage}
                  alt="ID card"
                  onClick={() => setPreviewImage(user.idCardImage)}
                  className="w-20 h-20 object-cover rounded-md border cursor-pointer hover:opacity-80"
                />
              )}

              <div className="flex-1 min-w-0">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {user.role}
                  {user.role === "STUDENT" && user.submittedStudentId && (
                    <span> · Student ID: <span className="font-medium text-gray-600">{user.submittedStudentId}</span></span>
                  )}
                </p>
                {user.role === "STUDENT" && !user.idCardImage && (
                  <p className="text-xs text-red-500 mt-1">⚠ No ID card photo submitted</p>
                )}
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleApprove(user._id)}
                  disabled={actionLoading === user._id}
                  className="px-3 py-1.5 rounded-md bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(user._id)}
                  disabled={actionLoading === user._id}
                  className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewImage && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <img src={previewImage} alt="ID card full size" className="max-h-[85vh] max-w-full rounded-lg" />
        </div>
      )}
    </div>
  );
}

export default PendingRequests;