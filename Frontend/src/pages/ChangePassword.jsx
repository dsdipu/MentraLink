import ChangePasswordCard from "../components/ChangePasswordCard";
import useAuth from "../hooks/useAuth";

// Shared by /student/change-password and /mentor/change-password
const ChangePassword = () => {
  const { user } = useAuth();
  const forced = !!user?.mustChangePassword;

  return (
    <div className="max-w-xl">
      <h1 className="mb-4 text-2xl font-semibold">{forced ? "Welcome!" : "Security"}</h1>
      <ChangePasswordCard forced={forced} />
    </div>
  );
};

export default ChangePassword;
