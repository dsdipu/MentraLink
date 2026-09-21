import { useEffect, useRef, useState } from "react";
import { getMyProfile, updateMyProfile, uploadMyPhoto, removeMyPhoto } from "../../services/studentService";
import useAuth from "../../hooks/useAuth";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { Camera, X, GraduationCap, BadgeCheck } from "lucide-react";

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

      <Card padded={false} className="mb-4 overflow-hidden">
        <div className="h-16 bg-brand-gradient-vertical" />
        <div className="px-6 pb-6">
          <div className="relative -mt-10 mb-3 inline-block">
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
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
          </div>

          <p className="font-semibold text-lg text-brand-navy">{profile?.name}</p>
          <p className="text-sm text-gray-500 mb-3">{profile?.email}</p>

          <div className="flex flex-wrap gap-2 mb-2">
            <Badge tone="brand">
              <BadgeCheck size={12} className="mr-1" />
              {profile?.studentId}
            </Badge>
            {profile?.batch && (
              <Badge tone="info">
                <GraduationCap size={12} className="mr-1" />
                Batch {profile.batch}
              </Badge>
            )}
            {profile?.department && <Badge tone="neutral">{profile.department}</Badge>}
          </div>

          {profile?.profileImage && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={uploadingPhoto}
              className="text-xs text-red-500 hover:underline flex items-center gap-1 mt-2 disabled:opacity-50"
            >
              <X size={12} /> Remove photo
            </button>
          )}
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input value={form.name} disabled className="w-full border rounded-md px-3 py-2 bg-gray-100" />
          <p className="text-xs text-gray-400 mt-1">Contact an admin to change your name.</p>
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