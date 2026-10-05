import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";
import Card from "./ui/Card";
import PasswordStrength from "./PasswordStrength";
import useAuth from "../hooks/useAuth";
import { changePassword, updateMe } from "../services/authService";
import { FIRST_ISSUE_MESSAGE } from "../utils/passwordPolicy";

const inputClass =
  "w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

// Used on the student and mentor "Change Password" page.
// `forced` = the account still has a temporary password (admin-created account).
function ChangePasswordCard({ forced = false }) {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const needsName = forced && /^\d{9}$/.test(String(user?.name || "").trim());

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match");
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password must be different from your current password");
      return;
    }
    const problem = FIRST_ISSUE_MESSAGE(newPassword, {
      email: user?.email,
      name: needsName ? fullName : user?.name,
    });
    if (problem) {
      setError(problem);
      return;
    }
    if (needsName && fullName.trim().length < 2) {
      setError("Please enter your full name");
      return;
    }

    setSaving(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      // the server logs out other devices and returns a fresh token for this one
      if (result.token) localStorage.setItem("token", result.token);
      updateUser({ mustChangePassword: false });

      if (needsName) {
        try {
          const updated = await updateMe(fullName.trim());
          updateUser({ name: updated?.name || fullName.trim() });
        } catch {
          // the name can still be completed later from the profile page
        }
      }

      if (forced) {
        navigate(`/${String(user?.role || "student").toLowerCase()}/dashboard`, { replace: true });
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Password changed successfully. Other devices have been logged out.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <KeyRound size={18} className="text-brand-navy" />
        <h2 className="text-lg font-semibold">{forced ? "Set your password" : "Change password"}</h2>
      </div>

      {forced && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Your account was created by an admin with a temporary password (your student ID). Please
          choose your own password to continue.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {needsName && (
          <div>
            <label className="mb-1 block text-sm font-medium">Your full name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
              placeholder="e.g. Rahim Uddin"
              autoComplete="name"
              maxLength={80}
              required
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium">
            {forced ? "Temporary password (your student ID)" : "Current password"}
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClass}
            autoComplete="current-password"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
            autoComplete="new-password"
            minLength={10}
            maxLength={64}
            required
          />
          <div className="mt-2">
            <PasswordStrength
              password={newPassword}
              email={user?.email}
              name={needsName ? fullName : user?.name}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Confirm new password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
            autoComplete="new-password"
            required
          />
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="mt-1 text-xs text-red-500">Passwords do not match yet</p>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving..." : forced ? "Save and continue" : "Change password"}
        </button>
      </form>
    </Card>
  );
}

ChangePasswordCard.propTypes = { forced: PropTypes.bool };

export default ChangePasswordCard;
