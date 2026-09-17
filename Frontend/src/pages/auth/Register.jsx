import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../../services/authService";

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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (form.role === "STUDENT" && !idCardImage) {
      setError("Please upload a photo of your student ID card");
      return;
    }

    setSubmitting(true);
    try {
      let payload;
      if (form.role === "STUDENT") {
        payload = new FormData();
        payload.append("name", form.name);
        payload.append("email", form.email);
        payload.append("password", form.password);
        payload.append("role", form.role);
        payload.append("studentId", form.studentId);
        payload.append("idCardImage", idCardImage);
      } else {
        payload = { name: form.name, email: form.email, password: form.password, role: form.role };
      }

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

        <label className="block text-sm mb-1">Full Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block text-sm mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder={form.role === "STUDENT" ? "your university email" : "your email"}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {form.role === "STUDENT" ? (
          <p className="text-xs text-red-400 mt-1.5 mb-4">
            Don&apos;t have a student email? <a href={import.meta.env.VITE_STUDENT_EMAIL_INFO_URL} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Click here to get one</a>
          </p>
        ) : (
          <div className="mb-4"></div>
        )}

        <label className="block text-sm mb-1">Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
          className="w-full border rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {form.role === "STUDENT" && (
          <>
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
          </>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 mt-2"
        >
          {submitting ? "Creating account..." : "Register"}
        </button>

        <p className="text-sm text-center mt-4 text-gray-500">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;