import { Link, Outlet, useLocation } from "react-router-dom";

const PublicLayout = () => {
  const location = useLocation();

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`text-sm font-medium transition ${
        location.pathname === to ? "text-brand-navy" : "text-gray-500 hover:text-brand-navy"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-xl font-semibold text-brand-navy">
            MentraLink
          </Link>
          <nav className="hidden sm:flex items-center gap-8">
            {navLink("/", "Home")}
            {navLink("/blogs", "Blog")}
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-brand-navy">
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-brand-navy text-white px-4 py-2 rounded-full hover:bg-brand-navy/90 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-brand-navy text-white/70 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-display text-lg text-white">MentraLink</p>
          <p className="text-sm">Structured mentorship for students and mentors.</p>
          <div className="flex gap-6 text-sm">
            <Link to="/blogs" className="hover:text-white">Blog</Link>
            <Link to="/login" className="hover:text-white">Log in</Link>
            <Link to="/register" className="hover:text-white">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;