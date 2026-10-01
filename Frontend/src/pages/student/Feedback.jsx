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
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const selectedSessionData = completedSessions.find(
    (session) => session._id === selectedSession
  );
  const questions = selectedSessionData?.template?.questions || [];

  const handleSessionChange = (sessionId) => {
    setSelectedSession(sessionId);
    setAnswers({});
    setMessage("");
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSubmitting(true);

    try {
      const questionAnswers = questions.map((question) => ({
        questionId: question._id,
        answer: answers[question._id] || "",
      }));

      await submitFeedback(selectedSession, {
        rating,
        comment,
        answers: questionAnswers,
      });

      setMessage("Feedback submitted successfully");
      setComment("");
      setRating(5);
      setAnswers({});
      setSelectedSession("");
      loadData();
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Failed to submit feedback"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  const availableSessions = completedSessions.filter(
    (s) => !alreadyGivenFeedback(s._id)
  );

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">Session Feedback</h1>

      {message && <p className="text-sm mb-4 text-blue-600">{message}</p>}

      {availableSessions.length > 0 ? (
        <Card className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm mb-1">Session</label>
              <select
                value={selectedSession}
                onChange={(e) => handleSessionChange(e.target.value)}
                required
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select a completed session</option>
                {availableSessions.map((s) => (
                  <option key={s._id} value={s._id}>
                    Session {s.sessionNumber} — {s.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedSessionData && (
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="font-medium text-gray-800">
                  Session {selectedSessionData.sessionNumber}: {selectedSessionData.title}
                </p>
                {selectedSessionData.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedSessionData.description}
                  </p>
                )}
              </div>
            )}

            {selectedSessionData && questions.length > 0 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-medium">Session Questions</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Please answer the questions set by the admin.
                  </p>
                </div>

                {questions.map((question, index) => (
                  <div key={question._id}>
                    <label className="block text-sm mb-1">
                      {index + 1}. {question.question}
                      {question.required && <span className="text-red-500"> *</span>}
                    </label>
                    <textarea
                      value={answers[question._id] || ""}
                      onChange={(e) =>
                        handleAnswerChange(question._id, e.target.value)
                      }
                      rows={3}
                      required={question.required}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="Write your answer..."
                    />
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-sm mb-1.5">Overall Rating</label>
              <StarRating value={rating} onChange={setRating} />
            </div>

            <div>
              <label className="block text-sm mb-1">Additional Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Write any additional feedback..."
              />
            </div>

            <button
              type="submit"
              disabled={!selectedSession || submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Feedback"}
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
      <div className="space-y-3">
        {history.map((f) => (
          <Card key={f._id}>
            <div className="flex justify-between items-start mb-1">
              <p className="font-medium">
                Session {f.session?.sessionNumber} — {f.session?.title}
              </p>
              <StarRating value={f.rating} onChange={() => {}} size={14} />
            </div>

            {f.answers?.length > 0 && (
              <div className="mt-3 space-y-3">
                {f.answers.map((answer) => (
                  <div key={answer.questionId}>
                    <p className="text-sm font-medium text-gray-700">
                      {answer.question}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {answer.answer || "No answer"}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {f.comment && (
              <p className="text-gray-600 text-sm mt-3">{f.comment}</p>
            )}
          </Card>
        ))}
        {history.length === 0 && (
          <p className="text-gray-500 text-sm">No feedback submitted yet.</p>
        )}
      </div>
    </div>
  );
};

export default Feedback;
