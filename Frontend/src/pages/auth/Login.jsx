import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import logo from "../../assets/mentraLink.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(email, password);
      const role = user?.role?.toLowerCase();

      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "mentor") {
        navigate("/mentor/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="MentraLink" className="h-28 object-contain" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-xl shadow-sm border border-gray-200"
        >
          <h1 className="text-xl font-semibold mb-1 text-center text-gray-900">
            Sign in to your account
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Welcome back, please enter your details
          </p>

          {error && (
            <p className="text-red-600 text-sm mb-4 text-center bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <label className="block text-sm mb-1.5 text-gray-700 font-medium">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-transparent"
          />

          <label className="block text-sm mb-1.5 text-gray-700 font-medium">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 mb-6 text-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-transparent"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#1877F2] text-white font-semibold py-2.5 rounded-lg hover:bg-[#166FE5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Signing in..." : "Log In"}
          </button>

          <p className="text-sm text-center mt-5 text-gray-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-[#1877F2] font-medium hover:underline"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
