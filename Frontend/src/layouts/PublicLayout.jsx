import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import useAuth from "../hooks/useAuth";
import logo from "../assets/mentraLink.png";

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/blogs", label: "Blog" },
];

const dashboardPath = (role) =>
  ({ ADMIN: "/admin/dashboard", MENTOR: "/mentor/dashboard", STUDENT: "/student/dashboard" })[
    String(role || "").toUpperCase()
  ] || "/";

const PublicLayout = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // new page: close the menu and start at the top (unless the URL points to a #section)
  useEffect(() => {
    setMenuOpen(false);
    if (!location.hash) window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const desktopLink = ({ isActive }) =>
    `relative text-sm font-medium px-3 py-2 rounded-full transition-colors duration-200 ${
      isActive ? "text-brand-navy bg-brand-mint" : "text-gray-500 hover:text-brand-navy hover:bg-gray-50"
    }`;

  const mobileLink = ({ isActive }) =>
    `block rounded-xl px-4 py-3 text-base font-medium ${
      isActive ? "bg-brand-mint text-brand-navy" : "text-gray-600 hover:bg-gray-50"
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans">
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-brand-navy px-4 py-2 text-sm text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <header
        className={`sticky top-0 z-40 border-b bg-white/90 backdrop-blur transition-shadow duration-300 ${
          scrolled ? "border-gray-200 shadow-sm" : "border-gray-100"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center" aria-label="MentraLink home">
            <img src={logo} alt="MentraLink" className="h-14 object-contain" />
          </Link>

          <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={desktopLink}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to={dashboardPath(user.role)}
                className="rounded-full bg-brand-navy px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-navy/90"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden text-sm font-medium text-gray-600 hover:text-brand-navy sm:block">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-brand-navy px-4 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  Get Started
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="rounded-full p-2 text-brand-navy hover:bg-gray-100 sm:hidden"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        <div
          id="mobile-menu"
          className={`grid border-gray-100 transition-[grid-template-rows] duration-300 sm:hidden ${
            menuOpen ? "grid-rows-[1fr] border-t" : "grid-rows-[0fr]"
          }`}
        >
          <nav className="overflow-hidden" aria-label="Mobile">
            <div className="space-y-1 px-4 py-3">
              {NAV.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className={mobileLink} tabIndex={menuOpen ? 0 : -1}>
                  {item.label}
                </NavLink>
              ))}
              {!user && (
                <Link
                  to="/login"
                  tabIndex={menuOpen ? 0 : -1}
                  className="block rounded-xl px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-50"
                >
                  Log in
                </Link>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>

      <footer className="mt-16 bg-brand-navy text-white/70">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <img src={logo} alt="MentraLink" className="h-11 object-contain opacity-90 brightness-0 invert" />
              <p className="mt-4 max-w-xs text-sm leading-6">
                Structured mentorship for Software Engineering students at Green University of Bangladesh.
              </p>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-white">Explore</p>
              <ul className="space-y-2 text-sm">
                {NAV.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="transition-colors hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-white">Account</p>
              <ul className="space-y-2 text-sm">
                {user ? (
                  <li>
                    <Link to={dashboardPath(user.role)} className="transition-colors hover:text-white">
                      Dashboard
                    </Link>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link to="/login" className="transition-colors hover:text-white">
                        Log in
                      </Link>
                    </li>
                    <li>
                      <Link to="/register" className="transition-colors hover:text-white">
                        Register
                      </Link>
                    </li>
                    <li>
                      <Link to="/forgot-password" className="transition-colors hover:text-white">
                        Forgot password
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
            <p>© {new Date().getFullYear()} MentraLink. All rights reserved.</p>
            <p>Software Engineering, Green University of Bangladesh</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
