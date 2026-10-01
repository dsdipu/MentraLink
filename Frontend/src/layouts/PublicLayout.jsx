import { Link, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import logo from "../assets/mentraLink.png";

const PublicLayout = () => {
  const location = useLocation();
  const { user } = useAuth();

  const getDashboardPath = () => {
    const role = user?.role?.toUpperCase();

    if (role === "ADMIN") return "/admin/dashboard";
    if (role === "MENTOR") return "/mentor/dashboard";
    if (role === "STUDENT") return "/student/dashboard";

    return "/";
  };

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`text-sm font-medium px-3 py-2 rounded-full transition-all duration-200 hover:bg-brand-mint hover:-translate-y-0.5 ${
        location.pathname === to
          ? "text-brand-navy"
          : "text-gray-500 hover:text-brand-navy"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur z-40">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="MentraLink"
              className="h-14 object-contain"
            />
          </Link>

          <nav className="hidden sm:flex items-center gap-2">
            {navLink("/", "Home")}
            {navLink("/about", "About")}
            {navLink("/blogs", "Blog")}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to={getDashboardPath()}
                className="text-sm font-medium bg-brand-navy text-white px-4 py-2 rounded-full hover:bg-brand-navy/90 transition"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-brand-navy"
                >
                  Log in
                </Link>

                <Link
                  to="/register"
                  className="text-sm font-medium bg-brand-navy text-white px-4 py-2 rounded-full hover:bg-brand-navy/90 transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-brand-navy text-white/70 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <img
            src={logo}
            alt="MentraLink"
            className="h-10 object-contain brightness-0 invert opacity-90"
          />

          <p className="text-sm">
            Software Engineering, Green University of Bangladesh
          </p>

          <div className="flex gap-6 text-sm">
            <Link to="/about" className="hover:text-white">
              About
            </Link>
            <Link to="/blogs" className="hover:text-white">
              Blog
            </Link>

            {user ? (
              <Link to={getDashboardPath()} className="hover:text-white">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="hover:text-white">
                  Log in
                </Link>

                <Link to="/register" className="hover:text-white">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;