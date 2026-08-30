import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/auth/Login";

// Student
import StudentDashboard from "../pages/student/Dashboard";
import StudentLayout from "../layouts/StudentLayout";
import Profile from "../pages/student/Profile";
import Sessions from "../pages/student/Sessions";
import Attendance from "../pages/student/Attendance";
import Feedback from "../pages/student/Feedback";
import Evaluation from "../pages/student/Evaluation";
import Blogs from "../pages/student/Blogs";
import BlogDetails from "../pages/student/BlogDetails";

// Mentor
import MentorDashboard from "../pages/mentor/Dashboard";
import MentorLayout from "../layouts/MentorLayout";

// Admin
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
          <Route path="/student/profile" element={<Profile />} />
          <Route path="/student/sessions" element={<Sessions />} />
          <Route path="/student/attendance" element={<Attendance />} />
          <Route path="/student/feedback" element={<Feedback />} />
          <Route path="/student/evaluation" element={<Evaluation />} />
          <Route path="/student/blogs" element={<Blogs />} />
          <Route path="/student/blogs/:id" element={<BlogDetails />} />
        </Route>
      </Route>

      {/* Mentor */}
      <Route element={<ProtectedRoute allowedRoles={["mentor"]} />}>
        <Route element={<MentorLayout />}>
          <Route path="/mentor/dashboard" element={<MentorDashboard />} />
          {/* add /mentor/students, /mentor/sessions, etc. here once built */}
        </Route>
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* add /admin/students, /admin/mentors, etc. here once built */}
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;