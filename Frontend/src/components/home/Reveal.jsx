import PropTypes from "prop-types";
import useInView from "../../hooks/useInView";

// Fades and lifts its children into place the first time they scroll into view.
function Reveal({ as: Tag = "div", delay = 0, className = "", children }) {
  const [ref, inView] = useInView();

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
      className={`transition-all duration-700 ease-out ${
        inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
    >
      {children}
    </Tag>
  );
}

Reveal.propTypes = {
  as: PropTypes.elementType,
  delay: PropTypes.number,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Reveal;
