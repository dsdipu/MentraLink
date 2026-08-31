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
        <p>📍 Location: {session?.location || "N/A"}</p>
      </div>
    </div>
  );
};

export default SessionCard;