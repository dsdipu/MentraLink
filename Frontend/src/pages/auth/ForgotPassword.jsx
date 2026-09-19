import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword, resetPassword } from "../../services/authService";
import logo from "../../assets/mentraLink.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sending, setSending] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const startCooldown = () => {
    setCooldown(60);
    const timer = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          clearInterval(timer);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSending(true);
    try {
      const res = await forgotPassword(email);
      setMessage(res.message);
      setCodeSent(true);
      startCooldown();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset code");
    } finally {
      setSending(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError("");
    try {
      const res = await forgotPassword(email);
      setMessage(res.message);
      startCooldown();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setResetting(true);
    try {
      await resetPassword(email, code, newPassword);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setResetting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] px-4">
        <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
          <p className="text-green-600 font-medium mb-4">Password updated successfully.</p>
          <Link to="/login" className="text-brand-navy font-medium hover:underline text-sm">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Link to="/">
            <img src={logo} alt="MentraLink" className="h-24 object-contain" />
          </Link>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <h1 className="text-xl font-semibold mb-1 text-center text-gray-900">Reset your password</h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            {codeSent ? "Enter the code we sent and your new password" : "Enter your account email to get a reset code"}
          </p>

          {error && (
            <p className="text-red-600 text-sm mb-4 text-center bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {message && !error && (
            <p className="text-green-600 text-sm mb-4 text-center bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {message}
            </p>
          )}

          {!codeSent ? (
            <form onSubmit={handleSendCode}>
              <label className="block text-sm mb-1.5 text-gray-700 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent"
              />
              <button
                type="submit"
                disabled={sending}
                className="w-full bg-brand-navy text-white font-semibold py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <label className="block text-sm mb-1.5 text-gray-700 font-medium">Reset Code</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                maxLength={6}
                required
                placeholder="6-digit code"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 mb-2 text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0}
                className="text-xs text-brand-navy hover:underline disabled:text-gray-400 disabled:no-underline mb-4"
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
              </button>

              <label className="block text-sm mb-1.5 text-gray-700 font-medium mt-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent"
              />

              <label className="block text-sm mb-1.5 text-gray-700 font-medium">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 mb-6 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent"
              />

              <button
                type="submit"
                disabled={resetting}
                className="w-full bg-brand-navy text-white font-semibold py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {resetting ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          <p className="text-sm text-center mt-5 text-gray-500">
            <Link to="/login" className="text-brand-navy font-medium hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;