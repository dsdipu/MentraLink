import { Star } from "lucide-react";

const StarRating = ({ value, onChange, size = 22 }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        className="p-0.5 hover:scale-110 transition"
        aria-label={`${n} star`}
      >
        <Star
          size={size}
          className={n <= value ? "text-brand-gold" : "text-gray-300"}
          fill={n <= value ? "currentColor" : "none"}
        />
      </button>
    ))}
  </div>
);

export default StarRating;