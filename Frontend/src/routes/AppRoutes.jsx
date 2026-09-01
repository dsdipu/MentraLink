import AdminLayout from "../layouts/AdminLayout";
{/* Admin */}
<Route element={<ProtectedRoute allowedRoles={["ADMIN", "admin"]} />}>
  <Route element={<AdminLayout />}>
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
  </Route>
</Route>