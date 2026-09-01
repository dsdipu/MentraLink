import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Student
import StudentLayout from "../layouts/StudentLayout";
import StudentDashboard from "../pages/student/Dashboard";
import StudentProfile from "../pages/student/Profile";
import StudentSessions from "../pages/student/Sessions";
import StudentAttendance from "../pages/student/Attendance";
import StudentFeedback from "../pages/student/Feedback";
import StudentEvaluation from "../pages/student/Evaluation";
import StudentBlogs from "../pages/student/Blogs";
import StudentBlogDetails from "../pages/student/BlogDetails";

// Mentor
import MentorLayout from "../layouts/MentorLayout";
import MentorDashboard from "../pages/mentor/Dashboard";
import MentorProfile from "../pages/mentor/Profile";
import MentorStudents from "../pages/mentor/Students";
import MentorSessions from "../pages/mentor/Sessions";
import MentorAttendance from "../pages/mentor/Attendance";
import MentorFeedback from "../pages/mentor/Feedback";
import MentorEvaluation from "../pages/mentor/Evaluation";
import MentorBlogs from "../pages/mentor/Blogs";

// Admin
import PendingRequests from "../pages/admin/PendingRequests";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/AdminDashboard";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<div>Not authorized</div>} />

      {/* Student */}
      <Route element={<ProtectedRoute allowedRoles={["STUDENT", "student"]} />}>
        <Route element={<StudentLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/sessions" element={<StudentSessions />} />
          <Route path="/student/attendance" element={<StudentAttendance />} />
          <Route path="/student/feedback" element={<StudentFeedback />} />
          <Route path="/student/evaluation" element={<StudentEvaluation />} />
          <Route path="/student/blogs" element={<StudentBlogs />} />
          <Route
            path="/student/blogs/:id"
            element={<StudentBlogDetails />}
          />
        </Route>
      </Route>

      {/* Mentor */}
      <Route element={<ProtectedRoute allowedRoles={["MENTOR", "mentor"]} />}>
        <Route element={<MentorLayout />}>
          <Route path="/mentor/dashboard" element={<MentorDashboard />} />
          <Route path="/mentor/profile" element={<MentorProfile />} />
          <Route path="/mentor/students" element={<MentorStudents />} />
          <Route path="/mentor/sessions" element={<MentorSessions />} />
          <Route path="/mentor/attendance" element={<MentorAttendance />} />
          <Route path="/mentor/feedback" element={<MentorFeedback />} />
          <Route path="/mentor/evaluation" element={<MentorEvaluation />} />
          <Route path="/mentor/blogs" element={<MentorBlogs />} />
        </Route>
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN", "admin"]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/pending-requests" element={<PendingRequests />} />
        </Route>
      </Route>

      {/* Default Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;

