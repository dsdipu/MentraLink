import { useEffect, useRef, useState } from "react";
import { getMyProfile, updateMyProfile, uploadMyPhoto, removeMyPhoto } from "../../services/studentService";
import useAuth from "../../hooks/useAuth";
import { Camera, X } from "lucide-react";

const Profile = () => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", department: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  const load = () => {
    getMyProfile()
      .then((data) => {
        setProfile(data);
        setForm({
          name: data.name || "",
          phone: data.phone || "",
          department: data.department || "",
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const updated = await updateMyProfile(form);
      setProfile(updated);
      setForm({
        name: updated.name || "",
        phone: updated.phone || "",
        department: updated.department || "",
      });
      updateUser({ name: updated.name });
      setMessage("Profile updated successfully");
    } catch {
      setMessage("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const res = await uploadMyPhoto(file);
      setProfile((p) => ({ ...p, profileImage: res.profileImage }));
    } catch {
      setMessage("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    setUploadingPhoto(true);
    try {
      await removeMyPhoto();
      setProfile((p) => ({ ...p, profileImage: null }));
    } catch {
      setMessage("Failed to remove photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold mb-4">My Profile</h1>

      {message && <p className="text-sm mb-4 text-blue-600">{message}</p>}

      <div className="bg-white rounded-lg shadow p-6 mb-4 flex items-center gap-5">
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-brand-mint text-brand-green flex items-center justify-center text-2xl font-semibold border-4 border-white shadow">
            {profile?.profileImage ? (
              <img src={profile.profileImage} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              profile?.name?.charAt(0)?.toUpperCase() || "S"
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand-navy text-white flex items-center justify-center shadow hover:opacity-90 disabled:opacity-50"
            aria-label="Change photo"
          >
            <Camera size={14} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoSelect}
          />
        </div>
        <div>
          <p className="font-medium text-brand-navy">{profile?.name}</p>
          <p className="text-sm text-gray-500">{profile?.studentId} · Batch {profile?.batch || "—"}</p>
          {profile?.profileImage && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={uploadingPhoto}
              className="text-xs text-red-500 hover:underline flex items-center gap-1 mt-1 disabled:opacity-50"
            >
              <X size={12} /> Remove photo
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input value={profile?.email || ""} disabled className="w-full border rounded-md px-3 py-2 bg-gray-100" />
        </div>

        <div>
          <label className="block text-sm mb-1">Student ID</label>
          <input value={profile?.studentId || ""} disabled className="w-full border rounded-md px-3 py-2 bg-gray-100" />
        </div>

        <div>
          <label className="block text-sm mb-1">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Department</label>
          <input
            name="department"
            value={form.department}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default Profile;