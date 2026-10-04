import PropTypes from "prop-types";
import { Star } from "lucide-react";

// Read-only star row. `value` may be fractional (4.6 shows 5 filled stars rounded to the nearest whole).
const StarDisplay = ({ value = 0, size = 16 }) => {
  const filled = Math.round(value);
  return (
    <div className="flex gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= filled ? "text-brand-gold" : "text-gray-300"}
          fill={n <= filled ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
};

StarDisplay.propTypes = {
  value: PropTypes.number,
  size: PropTypes.number,
};

export default StarDisplay;
