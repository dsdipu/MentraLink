import { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "../../services/mentorService";

const Profile = () => {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getMyProfile().then(setForm).finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateMyProfile(form);
      setMessage("Profile updated successfully");
    } catch {
      setMessage("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (!form) return <p className="text-red-500">Failed to load profile</p>;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold mb-4">My Profile</h1>
      {message && <p className="mb-4 text-sm text-blue-600">{message}</p>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm mb-1">Full Name</label>
          <input name="name" value={form.name || ""} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input name="email" value={form.email || ""} disabled className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-500" />
        </div>
        <div>
          <label className="block text-sm mb-1">Expertise</label>
          <input name="expertise" value={form.expertise || ""} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
        </div>
        <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default Profile;