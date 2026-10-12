import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, MessageSquare, RefreshCw, Star } from "lucide-react";
import { getSessions } from "../services/sessionService";
import { getSessionFeedback } from "../services/feedbackService";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import StarDisplay from "../components/ui/StarDisplay";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "Date not set";

function AdminSessionFeedback() {
  const [sessions, setSessions] = useState([]);
  const [feedbackBySession, setFeedbackBySession] = useState({});
  const [openSessionId, setOpenSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingFeedbackId, setLoadingFeedbackId] = useState(null);
  const [error, setError] = useState("");

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const rows = await getSessions();
      setSessions(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load sessions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => {
      const semesterA = a.semester?.name || "";
      const semesterB = b.semester?.name || "";
      return semesterA.localeCompare(semesterB) ||
        Number(a.sessionNumber || 0) - Number(b.sessionNumber || 0) ||
        new Date(a.date || 0) - new Date(b.date || 0);
    }),
    [sessions]
  );

  const toggleSession = async (sessionId) => {
    if (openSessionId === sessionId) {
      setOpenSessionId(null);
      return;
    }
    setOpenSessionId(sessionId);
    if (feedbackBySession[sessionId]) return;

    setLoadingFeedbackId(sessionId);
    setError("");
    try {
      const data = await getSessionFeedback(sessionId);
      setFeedbackBySession((current) => ({ ...current, [sessionId]: data }));
    } catch (err) {
      setError(err.response?.data?.message || "Could not load feedback for this session.");
    } finally {
      setLoadingFeedbackId(null);
    }
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Session Feedback</h1>
          <p className="mt-1 text-sm text-gray-500">Review student feedback submitted for each session.</p>
        </div>
        <button
          type="button"
          onClick={() => { setFeedbackBySession({}); loadSessions(); }}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl border border-gray-200 bg-white" />)}</div>
      ) : sortedSessions.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No sessions found" description="Sessions will appear here after they are created." />
      ) : (
        <div className="space-y-3">
          {sortedSessions.map((session) => {
            const sessionId = session._id;
            const isOpen = openSessionId === sessionId;
            const result = feedbackBySession[sessionId];
            const feedbacks = result?.feedbacks || [];
            const mentorName = session.mentor?.user?.name || session.mentor?.name || "Mentor not assigned";
            const sectionName = session.group?.name || "Section not available";
            return (
              <Card key={sessionId} padded={false} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSession(sessionId)}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-gray-50"
                  aria-expanded={isOpen}
                >
                  {isOpen ? <ChevronDown size={18} className="shrink-0 text-gray-400" /> : <ChevronRight size={18} className="shrink-0 text-gray-400" />}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">Session {session.sessionNumber}: {session.title}</p>
                    <p className="mt-1 text-xs text-gray-500">{sectionName} · {session.semester?.name || "Semester not available"} · {formatDate(session.date)}</p>
                    <p className="mt-1 text-xs text-gray-500">{mentorName}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {result ? (
                      <>
                        <p className="text-sm font-semibold text-gray-900">{result.averageRating || 0}/5</p>
                        <p className="text-xs text-gray-500">{result.totalFeedback || feedbacks.length} response{(result.totalFeedback || feedbacks.length) === 1 ? "" : "s"}</p>
                      </>
                    ) : <p className="text-xs text-gray-400">{session.status || "Session"}</p>}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50/70 px-4 py-4">
                    {loadingFeedbackId === sessionId ? <p className="text-sm text-gray-500">Loading feedback...</p> : null}
                    {result && feedbacks.length === 0 && <p className="text-sm text-gray-500">No feedback has been submitted for this session.</p>}
                    {result && feedbacks.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-white p-3">
                          <StarDisplay value={result.averageRating || 0} />
                          <span className="text-sm font-semibold text-gray-800">{result.averageRating || 0}/5 average rating</span>
                          <span className="text-sm text-gray-500">{feedbacks.length} response{feedbacks.length === 1 ? "" : "s"}</span>
                        </div>
                        {feedbacks.map((feedback) => {
                          const studentName = feedback.student?.user?.name || "Student";
                          return (
                            <article key={feedback._id} className="rounded-lg border border-gray-200 bg-white p-4">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{studentName}</p>
                                  <p className="text-xs text-gray-400">Submitted {formatDate(feedback.createdAt)}</p>
                                </div>
                                <div className="flex items-center gap-2"><StarDisplay value={feedback.rating || 0} size={14} /><span className="text-sm font-medium">{feedback.rating}/5</span></div>
                              </div>
                              {feedback.comment?.trim() && <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{feedback.comment}</p>}
                              {feedback.answers?.length > 0 && (
                                <dl className="mt-3 space-y-3 border-t border-gray-100 pt-3">
                                  {feedback.answers.map((answer, index) => (
                                    <div key={`${feedback._id}-${answer.questionId || index}`}>
                                      <dt className="text-xs font-medium text-gray-500">{answer.question}</dt>
                                      <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-800">{answer.answer || "No answer"}</dd>
                                    </div>
                                  ))}
                                </dl>
                              )}
                              {!feedback.comment?.trim() && !feedback.answers?.length && <p className="mt-3 text-sm text-gray-400">No written comments or question answers.</p>}
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminSessionFeedback;
