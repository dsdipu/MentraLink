import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role?.toUpperCase();
  const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());

  if (allowedRoles && !normalizedAllowed.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // accounts created by an admin must replace their temporary password before anything else
  const changePath = `/${userRole.toLowerCase()}/change-password`;
  if (user.mustChangePassword && userRole !== "ADMIN" && location.pathname !== changePath) {
    return <Navigate to={changePath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;