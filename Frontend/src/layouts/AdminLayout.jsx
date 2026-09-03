import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, UserCheck, LogOut, Bell, CalendarRange, Users2 } from "lucide-react";
import useAuth from "../hooks/useAuth";
import logo from "../assets/mentraLink.png";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/pending-requests", label: "Pending Requests", icon: UserCheck },
  { to: "/admin/semesters", label: "Semesters", icon: CalendarRange },
  { to: "/admin/mentors", label: "Mentors", icon: Users2 },
];


const AdminLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-[#F0F2F5]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-screen">
        <div className="h-20 px-4 border-b border-gray-200 flex items-center justify-center">
          <img src={logo} alt="MentraLink" className="h-14 object-contain" />
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#E7F0FF] text-[#1877F2]"
                      : "text-gray-700 hover:bg-gray-100"
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
            <div className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-sm font-semibold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.name}
              </p>
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

      {/* Main content area */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-900">
            Admin Panel
          </h2>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <Bell size={18} className="text-gray-600" />
            </button>
            <div className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-sm font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 bg-indigo-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
