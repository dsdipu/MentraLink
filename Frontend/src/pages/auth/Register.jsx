import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../../services/authService";
import { requestOtp, verifyOtp } from "../../services/otpService";
import logo from "../../assets/mentraLink.png";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
    studentId: "",
  });
  const [idCardImage, setIdCardImage] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [otpEmailSentFor, setOtpEmailSentFor] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [otpError, setOtpError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === "email" && otpVerified) {
      setOtpVerified(false);
      setOtpEmailSentFor("");
      setOtpMessage("");
    }
  };

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

  const handleSendOtp = async () => {
    setOtpError("");
    setOtpMessage("");
    if (!form.email) {
      setOtpError("Enter your email first");
      return;
    }
    setSendingOtp(true);
    try {
      await requestOtp(form.email);
      setOtpEmailSentFor(form.email);
      setOtpMessage("Code sent. Check your inbox.");
      startCooldown();
    } catch (err) {
      setOtpError(err.response?.data?.message || "Failed to send code");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError("");
    if (!otpCode) {
      setOtpError("Enter the code");
      return;
    }
    setVerifyingOtp(true);
    try {
      await verifyOtp(form.email, otpCode);
      setOtpVerified(true);
      setOtpMessage("Email verified");
    } catch (err) {
      setOtpError(err.response?.data?.message || "Invalid or expired code");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!otpVerified) {
      setError("Please verify your email before registering");
      return;
    }
    if (!idCardImage) {
      setError("Please upload a photo of your student ID card");
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("email", form.email);
      payload.append("password", form.password);
      payload.append("role", form.role);
      payload.append("studentId", form.studentId);
      payload.append("idCardImage", idCardImage);

      const res = await registerUser(payload);
      setSuccessMessage(res.message);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (successMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm text-center">
          <h1 className="text-2xl font-semibold mb-4">Registration Submitted</h1>
          <p className="text-green-600 mb-6">{successMessage}</p>
          <Link to="/login" className="text-blue-600 hover:underline text-sm">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
              <div className="flex justify-center mb-4">
                <Link to="/">
                  <img src={logo} alt="MentraLink" className="h-16 object-contain" />
                </Link>
              </div>
              <h1 className="text-2xl font-semibold mb-6 text-center">Create Account</h1>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <label className="block text-sm mb-1">I am a</label>
        <div className="flex gap-2 mb-4">
          {["STUDENT", "MENTOR"].map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setForm({ ...form, role: r })}
              className={`flex-1 py-2 rounded-md text-sm border ${form.role === r ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300"}`}
            >
              {r === "STUDENT" ? "Student" : "Mentor"}
            </button>
          ))}
        </div>
        {form.role === "MENTOR" && (
          <p className="text-xs text-gray-400 -mt-2 mb-4">
            Mentors are senior students of the university and use the same student email and ID.
          </p>
        )}

        <label className="block text-sm mb-1">Full Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block text-sm mb-1">University Email</label>
        <div className="flex gap-2">
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={otpVerified}
            placeholder="your university email"
            className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          {!otpVerified && (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={sendingOtp || cooldown > 0 || !form.email}
              className="shrink-0 text-sm px-3 py-2 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:hover:bg-white"
            >
              {cooldown > 0 ? `Resend (${cooldown}s)` : sendingOtp ? "Sending..." : otpEmailSentFor ? "Resend code" : "Send code"}
            </button>
          )}
        </div>

        <p className="text-xs mt-1.5">
          <span className="text-gray-400">Don&apos;t have a student email? </span>
          <a
            href={import.meta.env.VITE_STUDENT_EMAIL_INFO_URL}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline"
          >
            Collect from here
          </a>
        </p>

        {!otpVerified && otpEmailSentFor === form.email && otpEmailSentFor !== "" && (
          <div className="mt-2 mb-2">
            <div className="flex gap-2">
              <input
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                maxLength={6}
                placeholder="6-digit code"
                className="flex-1 border rounded-md px-3 py-2 text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={verifyingOtp}
                className="shrink-0 text-sm px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {verifyingOtp ? "Verifying..." : "Verify"}
              </button>
            </div>
          </div>
        )}

        {otpMessage && <p className="text-xs text-green-600 mt-1 mb-2">{otpMessage}</p>}
        {otpError && <p className="text-xs text-red-500 mt-1 mb-2">{otpError}</p>}
        {!otpEmailSentFor && !otpVerified && <div className="mb-2"></div>}

        <label className="block text-sm mb-1 mt-2">Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
          className="w-full border rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block text-sm mb-1">University Student ID</label>
        <input
          name="studentId"
          value={form.studentId}
          onChange={handleChange}
          required
          placeholder="e.g. 191-15-2530"
          className="w-full border rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block text-sm mb-1">Student ID Card Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setIdCardImage(e.target.files[0])}
          required
          className="w-full text-sm mb-2"
        />
        <p className="text-xs text-gray-400 mb-4">
          Used only to verify your identity. An admin will review this before approving your account.
        </p>

        <button
          type="submit"
          disabled={submitting || !otpVerified}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 mt-2"
        >
          {submitting ? "Creating account..." : otpVerified ? "Register" : "Verify email to continue"}
        </button>

        <p className="text-sm text-center mt-4 text-gray-500">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;