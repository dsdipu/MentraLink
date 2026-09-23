import { useEffect, useState } from "react";
import { getMyMentorSessions } from "../../services/sessionService";
import { getSessionFeedback } from "../../services/feedbackService";
import Card from "../../components/ui/Card";
import StarRating from "../../components/ui/StarRating";
import EmptyState from "../../components/ui/EmptyState";
import { MessageSquare } from "lucide-react";

const Feedback = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMyMentorSessions({ status: "COMPLETED" }).then(setSessions);
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

      {!selectedId && !loading && (
        <EmptyState
          icon={MessageSquare}
          title="Select a session"
          description="Pick a completed session above to see student feedback."
        />
      )}

      {feedback && (
        <Card>
          <p className="text-sm text-gray-500">Average Rating</p>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-2xl font-bold text-brand-navy">{feedback.averageRating ?? "-"}/5</p>
            <StarRating value={Math.round(feedback.averageRating || 0)} onChange={() => {}} size={16} />
          </div>
          <p className="text-xs text-gray-400 mb-3">
            {feedback.totalFeedback ?? 0} response(s)
          </p>
          <div className="divide-y">
            {feedback.feedbacks?.map((f) => (
              <div key={f._id} className="py-3 text-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{f.student?.user?.name || "Anonymous"}</span>
                  <StarRating value={f.rating} onChange={() => {}} size={14} />
                </div>
                <p className="text-gray-600">{f.comment || <em className="text-gray-400">No comment</em>}</p>
              </div>
            ))}
            {(!feedback.feedbacks || feedback.feedbacks.length === 0) && (
              <p className="py-4 text-gray-500">No feedback submitted for this session yet.</p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Feedback;