import { Outlet, NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import logo from "../assets/mentraLink.png";

const navItems = [{ to: "/admin/dashboard", label: "Dashboard" }];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-brand-gradient-vertical text-white flex flex-col">
        <div className="p-4 border-b border-white/20 flex items-center justify-center">
          <img src={logo} alt="MentraLink" className="h-12 object-contain" />
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
      <main className="flex-1 bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;