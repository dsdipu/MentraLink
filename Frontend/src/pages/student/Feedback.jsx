import { useEffect, useState } from "react";
import { getMySessions } from "../../services/sessionService";
import { submitFeedback, getMyFeedbackHistory } from "../../services/feedbackService";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import StarRating from "../../components/ui/StarRating";
import { MessageSquare } from "lucide-react";

const Feedback = () => {
  const [completedSessions, setCompletedSessions] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([getMySessions(), getMyFeedbackHistory()])
      .then(([sessions, feedbackHistory]) => {
        setCompletedSessions(sessions.filter((s) => s.status === "COMPLETED"));
        setHistory(feedbackHistory);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const alreadyGivenFeedback = (sessionId) =>
    history.some((f) => f.session?._id === sessionId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await submitFeedback(selectedSession, { rating, comment });
      setMessage("Feedback submitted");
      setComment("");
      setRating(5);
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

      {availableSessions.length > 0 ? (
        <Card className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                    {new Date(s.date).toLocaleDateString()} — {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1.5">Rating</label>
              <StarRating value={rating} onChange={setRating} />
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
        </Card>
      ) : (
        <div className="mb-8">
          <EmptyState
            icon={MessageSquare}
            title="No sessions to give feedback on"
            description="You'll be able to leave feedback once a session is marked completed."
          />
        </div>
      )}

      <h2 className="text-lg font-medium mb-2">Past Feedback</h2>
      <div className="space-y-2">
        {history.map((f) => (
          <Card key={f._id}>
            <div className="flex justify-between items-start mb-1">
              <p className="font-medium">{f.session?.title}</p>
              <StarRating value={f.rating} onChange={() => {}} size={14} />
            </div>
            <p className="text-gray-600 text-sm">{f.comment}</p>
          </Card>
        ))}
        {history.length === 0 && <p className="text-gray-500 text-sm">No feedback submitted yet.</p>}
      </div>
    </div>
  );
};

export default Feedback;