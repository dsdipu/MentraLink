import { useEffect, useState } from "react";
import { getMySessions } from "../../services/sessionService";
import { submitFeedback, getMyFeedbackHistory } from "../../services/feedbackService";

const Feedback = () => {
  const [completedSessions, setCompletedSessions] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    Promise.all([getMySessions(), getMyFeedbackHistory()])
      .then(([sessions, feedbackHistory]) => {
        setCompletedSessions(sessions.filter((s) => s.status === "completed"));
        setHistory(feedbackHistory);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const alreadyGivenFeedback = (sessionId) =>
    history.some((f) => f.sessionId === sessionId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await submitFeedback(selectedSession, { rating, comment });
      setMessage("Feedback submitted");
      setComment("");
      setSelectedSession("");
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || "You may have already submitted feedback for this session");
    }
  };

  if (loading) return <p>Loading...</p>;

  const availableSessions = completedSessions.filter(
    (s) => !alreadyGivenFeedback(s._id)
  );

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-4">Session Feedback</h1>

      {message && <p className="text-sm mb-4 text-blue-600">{message}</p>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4 mb-8">
        <div>
          <label className="block text-sm mb-1">Session</label>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            required
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="">Select a completed session</option>
            {availableSessions.map((s) => (
              <option key={s._id} value={s._id}>
                {new Date(s.date).toLocaleDateString()} — {s.topic}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Rating (1-5)</label>
          <input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={!selectedSession}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Submit Feedback
        </button>
      </form>

      <h2 className="text-lg font-medium mb-2">Past Feedback</h2>
      <div className="space-y-2">
        {history.map((f) => (
          <div key={f._id} className="bg-white p-3 rounded-lg shadow text-sm">
            <p className="font-medium">Rating: {f.rating}/5</p>
            <p className="text-gray-600">{f.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feedback;