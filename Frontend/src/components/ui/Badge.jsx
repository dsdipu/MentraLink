const TONES = {
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
  neutral: "bg-gray-100 text-gray-600",
  brand: "bg-brand-mint text-brand-green",
};

const Badge = ({ children, tone = "neutral", className = "" }) => (
  <span
    className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${TONES[tone] || TONES.neutral} ${className}`}
  >
    {children}
  </span>
);

export default Badge;