import PropTypes from "prop-types";

const statusColors = {
  UPCOMING: "bg-blue-100 text-blue-700",
  ONGOING: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const SessionCard = ({ session }) => {
  return (
    <div className="bg-white p-5 rounded-lg shadow">
      <h2 className="text-xl font-semibold">
        {session?.title || "Session Title"}
      </h2>
      <p className="text-gray-500 mt-1">
        Session {session?.sessionNumber || "-"}
      </p>

      <div className="mt-3 text-sm text-gray-600 space-y-1">
        <p>📅 Date: {session?.date || "N/A"}</p>
        <p>⏰ Time: {session?.time || "N/A"}</p>
        <p>👤 Mentor: {session?.mentor?.name || session?.mentorName || "N/A"}</p>
        <p>📍 Location: {session?.location || "N/A"}</p>
      </div>

      <span
        className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${
          statusColors[session?.status] || "bg-gray-100 text-gray-700"
        }`}
      >
        {session?.status || "UNKNOWN"}
      </span>
    </div>
  );
};

SessionCard.propTypes = {
  session: PropTypes.shape({
    title: PropTypes.string,
    sessionNumber: PropTypes.number,
    date: PropTypes.string,
    time: PropTypes.string,
    location: PropTypes.string,
    status: PropTypes.oneOf(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]),
    mentor: PropTypes.shape({
      name: PropTypes.string,
    }),
    mentorName: PropTypes.string,
  }),
};

export default SessionCard;