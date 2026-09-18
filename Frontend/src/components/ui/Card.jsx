const Card = ({ children, className = "", padded = true }) => (
  <div
    className={`bg-white rounded-xl border border-gray-100 shadow-sm ${padded ? "p-5" : ""} ${className}`}
  >
    {children}
  </div>
);

export default Card;