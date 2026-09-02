import { useEffect, useState } from "react";
import { getSessions } from "../../services/sessionService";
import { getSessionFeedback } from "../../services/feedbackService";

const Feedback = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSessions().then((data) =>
      setSessions((data.sessions || data).filter((s) => s.status === "COMPLETED"))
    );
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    getSessionFeedback(selectedId)
      .then(setFeedback)
      .finally(() => setLoading(false));
  }, [selectedId]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Session Feedback</h1>
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="border rounded-md px-3 py-2 mb-4"
      >
        <option value="">Select a completed session</option>
        {sessions.map((s) => (
          <option key={s._id} value={s._id}>{s.title}</option>
        ))}
      </select>

      {loading && <p className="text-sm text-gray-500">Loading feedback...</p>}

      {feedback && (
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Average Rating</p>
          <p className="text-2xl font-bold text-blue-600 mb-1">
            {feedback.averageRating ?? "-"}/5
          </p>
          <p className="text-xs text-gray-400 mb-3">
            {feedback.totalFeedback ?? 0} response(s)
          </p>
          <div className="divide-y">
            {feedback.feedbacks?.map((f) => (
              <div key={f._id} className="py-3 text-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">
                    {f.student?.user?.name || "Anonymous"}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {f.rating}/5
                  </span>
                </div>
                <p className="text-gray-600">{f.comment || <em className="text-gray-400">No comment</em>}</p>
              </div>
            ))}
            {(!feedback.feedbacks || feedback.feedbacks.length === 0) && (
              <p className="py-4 text-gray-500">No feedback submitted for this session yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;