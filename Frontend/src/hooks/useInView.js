import { useEffect, useRef, useState } from "react";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// true once the element has scrolled into view (and stays true).
// Without IntersectionObserver, or with "reduce motion" on, content is simply shown.
const useInView = (options = {}) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(
    () => typeof IntersectionObserver === "undefined" || prefersReducedMotion()
  );

  useEffect(() => {
    if (inView || !ref.current) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px", ...options }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return [ref, inView];
};

export default useInView;
