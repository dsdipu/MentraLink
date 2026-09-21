import { useEffect, useState } from "react";
import { getMe, updateMe, changePassword } from "../services/authService";
import useAuth from "../hooks/useAuth";
import Card from "../components/ui/Card";
import { KeyRound } from "lucide-react";

const AdminProfile = () => {
  const { updateUser } = useAuth();
  const [me, setMe] = useState(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [pwMessage, setPwMessage] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    getMe().then((u) => {
      setMe(u);
      setName(u.name);
    });
  }, []);

  const handleSaveName = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const updated = await updateMe(name);
      setMe(updated);
      updateUser({ name: updated.name });
      setMessage("Name updated");
    } catch {
      setMessage("Failed to update name");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwMessage("");

    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match");
      return;
    }

    setChangingPw(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      setPwMessage(res.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwError(err.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPw(false);
    }
  };

  if (!me) return <p>Loading profile...</p>;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold mb-4">My Profile</h1>

      <Card padded={false} className="mb-4 overflow-hidden">
        <div className="h-16 bg-brand-navy" />
        <div className="px-6 pb-6">
          <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow -mt-10 mb-3 flex items-center justify-center text-2xl font-semibold text-brand-navy bg-brand-mint">
            {me.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <p className="font-semibold text-lg text-brand-navy">{me.name}</p>
          <p className="text-sm text-gray-500">{me.email}</p>
          <span className="inline-block mt-2 text-xs px-2.5 py-1 rounded-full bg-brand-mint text-brand-green font-medium">
            Administrator
          </span>
        </div>
      </Card>

      {message && <p className="text-sm mb-3 text-blue-600">{message}</p>}

      <form onSubmit={handleSaveName} className="bg-white p-6 rounded-lg shadow space-y-4 mb-4">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input value={me.email} disabled className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-500" />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Name"}
        </button>
      </form>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound size={16} className="text-gray-500" />
          <h2 className="font-medium">Change Password</h2>
        </div>

        {pwError && <p className="text-sm text-red-500 mb-3">{pwError}</p>}
        {pwMessage && <p className="text-sm text-green-600 mb-3">{pwMessage}</p>}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={changingPw}
            className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 disabled:opacity-50"
          >
            {changingPw ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;