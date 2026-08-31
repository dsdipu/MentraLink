const SessionCard = ({ session }) => {
  return (
    <div className="bg-white p-5 rounded-lg shadow">
      <h2 className="text-xl font-semibold">
        {session?.title || "Session Title"}
      </h2>

      <p className="text-gray-500 mt-1">
        Session {session?.sessionNumber || "-"}
      </p>
    </div>
  );
};

export default SessionCard;