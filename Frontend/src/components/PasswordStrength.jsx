import PropTypes from "prop-types";
import { getPasswordChecks } from "../utils/passwordPolicy";

const LEVELS = [
  { label: "Too weak", bar: "bg-red-500", text: "text-red-600" },
  { label: "Weak", bar: "bg-orange-500", text: "text-orange-600" },
  { label: "Fair", bar: "bg-yellow-500", text: "text-yellow-600" },
  { label: "Good", bar: "bg-lime-500", text: "text-lime-600" },
  { label: "Strong", bar: "bg-green-600", text: "text-green-700" },
];

// Live checklist + strength meter shown under any "new password" input.
function PasswordStrength({ password, email, name }) {
  if (!password) {
    return (
      <p className="text-xs text-gray-400 mb-3">
        Use at least 10 characters with upper & lower case letters, a number and a special character.
      </p>
    );
  }

  const checks = getPasswordChecks(password, { email, name });
  const passed = checks.filter((c) => c.ok).length;
  const allOk = passed === checks.length;
  const levelIndex = allOk ? (password.length >= 14 ? 4 : 3) : Math.min(2, Math.floor((passed / checks.length) * 3));
  const level = LEVELS[levelIndex];

  return (
    <div className="mb-3" aria-live="polite">
      <div className="flex gap-1 mb-1">
        {LEVELS.map((l, i) => (
          <div key={l.label} className={`h-1.5 flex-1 rounded ${i <= levelIndex ? level.bar : "bg-gray-200"}`} />
        ))}
      </div>
      <p className={`text-xs font-medium mb-1 ${level.text}`}>{level.label}</p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0.5">
        {checks.map((check) => (
          <li key={check.id} className={`text-xs ${check.ok ? "text-green-600" : "text-gray-500"}`}>
            {check.ok ? "✓" : "○"} {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

PasswordStrength.propTypes = {
  password: PropTypes.string,
  email: PropTypes.string,
  name: PropTypes.string,
};

export default PasswordStrength;
