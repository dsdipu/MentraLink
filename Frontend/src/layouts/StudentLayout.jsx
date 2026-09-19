import { useState } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import logo from "../assets/mentraLink.png";
import {
  LayoutDashboard,
  UserCircle2,
  CalendarClock,
  ClipboardCheck,
  MessageSquare,
  Star,
  Newspaper,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const navItems = [
  { to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/student/profile", label: "Profile", icon: UserCircle2 },
  { to: "/student/sessions", label: "Sessions", icon: CalendarClock },
  { to: "/student/attendance", label: "Attendance", icon: ClipboardCheck },
  { to: "/student/feedback", label: "Feedback", icon: MessageSquare },
  { to: "/student/evaluation", label: "Evaluation", icon: Star },
  { to: "/student/blogs", label: "Blogs", icon: Newspaper },
];

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-md text-brand-navy hover:bg-gray-100"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <Link to="/">
          <img src={logo} alt="MentraLink" className="h-14 object-contain" />
        </Link>
        <div className="w-9" />
      </header>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-brand-gradient-vertical text-white flex flex-col z-40 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="py-4 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <Link to="/">
            <img src={logo} alt="MentraLink" className="h-14 object-contain" />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-500 hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                    isActive ? "bg-white/20 font-semibold" : "hover:bg-white/10 text-white/90"
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || "S"}
            </div>
            <p className="text-sm text-white/90 truncate">{user?.name}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 text-sm text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-md w-full transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="lg:ml-64 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;