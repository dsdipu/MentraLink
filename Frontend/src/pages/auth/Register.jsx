import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";
import logo from "../../assets/mentraLink.png";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setSubmitting(true);
    try {
      const { message } = await registerUser(form);
      setSuccessMessage(message);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (successMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gradient-vertical px-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="MentraLink" className="h-16 object-contain" />
          </div>
          <h1 className="text-xl font-semibold mb-4 text-brand-navy">Registration Submitted</h1>
          <p className="text-green-600 mb-6">{successMessage}</p>
          <Link to="/login" className="text-brand-blue hover:underline text-sm font-medium">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-gradient-vertical px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm"
      >
        <div className="flex justify-center mb-6">
          <img src={logo} alt="MentraLink" className="h-16 object-contain" />
        </div>

        <h1 className="text-xl font-semibold mb-6 text-center text-brand-navy">Create Account</h1>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <label className="block text-sm mb-1 text-brand-navy font-medium">I am a</label>
        <div className="flex gap-2 mb-4">
          {["STUDENT", "MENTOR"].map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setForm({ ...form, role: r })}
              className={`flex-1 py-2 rounded-md text-sm border transition ${
                form.role === r
                  ? "bg-brand-gradient text-white border-transparent"
                  : "bg-white text-brand-navy border-gray-300"
              }`}
            >
              {r === "STUDENT" ? "Student" : "Mentor"}
            </button>
          ))}
        </div>

        <label className="block text-sm mb-1 text-brand-navy font-medium">Full Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-brand-blue"
        />

        <label className="block text-sm mb-1 text-brand-navy font-medium">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-brand-blue"
        />

        <label className="block text-sm mb-1 text-brand-navy font-medium">Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-brand-purple"
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-gradient text-white font-semibold py-2 rounded-md hover:opacity-90 transition disabled:opacity-50"
        >
          {submitting ? "Creating account..." : "Register"}
        </button>

        <p className="text-sm text-center mt-4 text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-blue hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;