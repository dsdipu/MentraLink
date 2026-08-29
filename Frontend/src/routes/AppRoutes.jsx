import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/auth/Login";

import StudentDashboard from "../pages/student/Dashboard";
import StudentLayout from "../layouts/StudentLayout";

import MentorDashboard from "../pages/mentor/Dashboard";
import MentorLayout from "../layouts/MentorLayout";

import AdminDashboard from "../pages/admin/Dashboard";
import AdminLayout from "../layouts/AdminLayout";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<div>Not authorized</div>} />

      {/* Student */}
      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route element={<StudentLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          {/* add /student/profile, /student/sessions, etc. here */}
        </Route>
      </Route>

      {/* Mentor */}
      <Route element={<ProtectedRoute allowedRoles={["mentor"]} />}>
        <Route element={<MentorLayout />}>
          <Route path="/mentor/dashboard" element={<MentorDashboard />} />
        </Route>
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;