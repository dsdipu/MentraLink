import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import useInView, { prefersReducedMotion } from "../../hooks/useInView";

// Counts up to `value` once visible. Shows a dash while the value is unknown.
function CountUp({ value, duration = 1200 }) {
  const [ref, inView] = useInView({ threshold: 0.4 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === null || value === undefined || !inView) return undefined;

    if (prefersReducedMotion() || typeof requestAnimationFrame === "undefined") {
      setDisplay(value);
      return undefined;
    }

    let frame;
    let startedAt = null; // taken from the first frame, so it always matches the rAF clock
    const tick = (now) => {
      if (startedAt === null) startedAt = now;
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, inView, duration]);

  if (value === null || value === undefined) return <span ref={ref}>—</span>;
  return <span ref={ref}>{display.toLocaleString()}</span>;
}

CountUp.propTypes = { value: PropTypes.number, duration: PropTypes.number };

export default CountUp;
