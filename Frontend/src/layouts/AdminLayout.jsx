import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import logo from "../assets/mentraLink.png";
import {
  LayoutDashboard,
  UserCheck,
  LogOut,
  Bell,
  CalendarRange,
  Users2,
  CalendarClock,
  Star,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/pending-requests", label: "Pending Requests", icon: UserCheck },
  { to: "/admin/semesters", label: "Semesters", icon: CalendarRange },
  { to: "/admin/mentors", label: "Mentors", icon: Users2 },
  { to: "/admin/sessions", label: "Sessions", icon: CalendarClock },
  { to: "/admin/ratings", label: "Mentor Ratings", icon: Star },
  { to: "/admin/manage-admins", label: "Admins", icon: ShieldCheck },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col z-40 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="h-20 px-4 border-b border-gray-200 flex items-center justify-between">
          <img src={logo} alt="MentraLink" className="h-14 object-contain" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-500 hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "bg-brand-mint text-brand-green" : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <Icon size={20} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-brand-navy text-white flex items-center justify-center text-sm font-semibold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-2 flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-md text-gray-600 hover:bg-gray-100"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <Bell size={18} className="text-gray-600" />
            </button>
            <div className="w-9 h-9 rounded-full bg-brand-navy text-white flex items-center justify-center text-sm font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;