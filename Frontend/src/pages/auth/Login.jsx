import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import logo from "../../assets/mentraLink.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef(null);
  const turnstileWidgetId = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const renderTurnstile = () => {
      if (
        window.turnstile &&
        turnstileRef.current &&
        turnstileWidgetId.current === null
      ) {
        turnstileWidgetId.current = window.turnstile.render(
          turnstileRef.current,
          {
            sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
            callback: (token) => setTurnstileToken(token),
            "expired-callback": () => setTurnstileToken(""),
            "error-callback": () => setTurnstileToken(""),
          }
        );
      }
    };

    if (window.turnstile) {
      renderTurnstile();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = renderTurnstile;

    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (!turnstileToken) {
        setError("Please complete the CAPTCHA verification");
        setSubmitting(false);
        return;
      }

      const user = await login(email, password, turnstileToken);
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

        setTurnstileToken("");

        if (
          window.turnstile &&
          turnstileWidgetId.current !== null
        ) {
          window.turnstile.reset(turnstileWidgetId.current);
        }
      } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Link to="/">
            <img src={logo} alt="MentraLink" className="h-28 object-contain" />
          </Link>
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

          <p className="text-right text-xs text-red-700 hover:underline mb-6">
            <Link to="/forgot-password">Forgot password?</Link>
          </p>

          <div
            ref={turnstileRef}
            className="mb-5 flex justify-center"
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
