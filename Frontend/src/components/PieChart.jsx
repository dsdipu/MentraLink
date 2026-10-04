import PropTypes from "prop-types";

const point = (center, radius, angle) => [
  center + radius * Math.cos(angle),
  center + radius * Math.sin(angle),
];

// Small dependency-free SVG pie chart.
// data: [{ label, value, color }]  (zero-value slices are skipped)
function PieChart({ data, size = 180 }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const center = size / 2;
  const radius = center - 4;

  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-full border-2 border-dashed border-gray-200 text-xs text-gray-400"
        style={{ width: size, height: size }}
      >
        No answers yet
      </div>
    );
  }

  const slices = data.filter((item) => item.value > 0);
  const summary = slices
    .map((item) => `${item.label} ${Math.round((item.value / total) * 100)}%`)
    .join(", ");

  let startAngle = -Math.PI / 2; // start at 12 o'clock

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="img"
      aria-label={`Pie chart: ${summary}`}
      className="shrink-0"
    >
      {slices.length === 1 ? (
        <circle cx={center} cy={center} r={radius} fill={slices[0].color}>
          <title>{`${slices[0].label}: 100%`}</title>
        </circle>
      ) : (
        slices.map((item) => {
          const sweep = (item.value / total) * Math.PI * 2;
          const endAngle = startAngle + sweep;
          const [x1, y1] = point(center, radius, startAngle);
          const [x2, y2] = point(center, radius, endAngle);
          const path = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${
            sweep > Math.PI ? 1 : 0
          } 1 ${x2} ${y2} Z`;
          const middle = startAngle + sweep / 2;
          const [lx, ly] = point(center, radius * 0.62, middle);
          startAngle = endAngle;

          return (
            <g key={item.label}>
              <path d={path} fill={item.color} stroke="#fff" strokeWidth="2">
                <title>{`${item.label}: ${item.value} (${Math.round((item.value / total) * 100)}%)`}</title>
              </path>
              {sweep / (Math.PI * 2) >= 0.08 && (
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize="13"
                  fontWeight="700"
                >
                  {Math.round((item.value / total) * 100)}%
                </text>
              )}
            </g>
          );
        })
      )}
      {slices.length === 1 && (
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
          fontSize="16"
          fontWeight="700"
        >
          100%
        </text>
      )}
    </svg>
  );
}

PieChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      color: PropTypes.string.isRequired,
    })
  ).isRequired,
  size: PropTypes.number,
};

export default PieChart;
