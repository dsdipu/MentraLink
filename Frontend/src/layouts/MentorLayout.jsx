import { Outlet, NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";

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
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 text-lg font-bold border-b border-gray-700">Mentor Panel</div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm ${isActive ? "bg-blue-600" : "hover:bg-gray-800"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <p className="text-sm mb-2">{user?.name}</p>
          <button onClick={logout} className="text-sm text-red-400 hover:text-red-300">
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default MentorLayout;