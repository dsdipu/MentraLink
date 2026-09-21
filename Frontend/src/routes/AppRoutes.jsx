import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminStudents from "../pages/AdminStudents";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";

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
import Mentors from "../pages/Mentor";

// Admin
import PendingRequests from "../pages/PendingRequests";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/AdminDashboard";
import Semesters from "../pages/Semesters";
import AdminMentorRatings from "../pages/AdminMentorRatings";
import AdminSessions from "../pages/AdminSessions";
import AdminManageAdmins from "../pages/AdminManageAdmins";
import AdminProfile from "../pages/AdminProfile";
import AdminGroups from "../pages/AdminGroups";

// Public
import PublicLayout from "../layouts/PublicLayout";
import Home from "../pages/public/Home";
import PublicBlogs from "../pages/public/PublicBlogs";
import PublicBlogDetails from "../pages/public/PublicBlogDetails";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<div>Not authorized</div>} />

      <Route element={<ProtectedRoute allowedRoles={["STUDENT", "student"]} />}>
        <Route element={<StudentLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/sessions" element={<StudentSessions />} />
          <Route path="/student/attendance" element={<StudentAttendance />} />
          <Route path="/student/feedback" element={<StudentFeedback />} />
          <Route path="/student/evaluation" element={<StudentEvaluation />} />
          <Route path="/student/blogs" element={<StudentBlogs />} />
          <Route path="/student/blogs/:id" element={<StudentBlogDetails />} />
        </Route>
      </Route>

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

      <Route element={<ProtectedRoute allowedRoles={["ADMIN", "admin"]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/pending-requests" element={<PendingRequests />} />
          <Route path="/admin/semesters" element={<Semesters />} />
          <Route path="/admin/mentors" element={<Mentors />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/sessions" element={<AdminSessions />} />
          <Route path="/admin/ratings" element={<AdminMentorRatings />} />
          <Route path="/admin/manage-admins" element={<AdminManageAdmins />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/groups" element={<AdminGroups />} />
        </Route>
      </Route>

      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/blogs" element={<PublicBlogs />} />
        <Route path="/blogs/:id" element={<PublicBlogDetails />} />
      </Route>

      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;