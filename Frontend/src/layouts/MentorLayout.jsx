import { Outlet, NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import logo from "../assets/mentraLink.png";

const navItems = [
  { to: "/mentor/dashboard", label: "Dashboard" },
  { to: "/mentor/profile", label: "Profile" },
  { to: "/mentor/students", label: "Students" },
  { to: "/mentor/sessions", label: "Sessions" },
  { to: "/mentor/attendance", label: "Attendance" },
  { to: "/mentor/feedback", label: "Feedback" },
  { to: "/mentor/evaluation", label: "Evaluation" },
  { to: "/mentor/blogs", label: "Blogs" },
];

const MentorLayout = () => {
  const { user, logout } = useAuth();
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-brand-gradient-vertical text-white flex flex-col">
        <div className="py-4 bg-white border-b border-white/20 flex items-center justify-center">
          <img src={logo} alt="MentraLink" className="h-16 object-contain" />
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm transition ${
                  isActive
                    ? "bg-white/20 font-semibold"
                    : "hover:bg-white/10 text-white/90"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/20">
          <p className="text-sm mb-2 text-white/90">{user?.name}</p>
          <button
            onClick={logout}
            className="text-sm text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md w-full transition"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-emerald-50 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default MentorLayout;