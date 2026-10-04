import { useEffect, useState } from "react";
import {
  getMyFeedbackOverview,
  getSessionFeedbackSummary,
} from "../../services/feedbackService";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import StarDisplay from "../../components/ui/StarDisplay";
import PieChart from "../../components/PieChart";
import { MessageSquare, ChevronDown, ChevronRight } from "lucide-react";

const YES_COLOR = "#16a34a";
const NO_COLOR = "#dc2626";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "";

// 5★ .. 1★ horizontal bars
const RatingBars = ({ distribution, total }) => (
  <div className="space-y-1.5 w-full max-w-sm">
    {[5, 4, 3, 2, 1].map((star) => {
      const count = distribution?.[star] || 0;
      const percent = total ? (count / total) * 100 : 0;
      return (
        <div key={star} className="flex items-center gap-2 text-xs text-gray-600">
          <span className="w-6 text-right">{star}★</span>
          <div className="h-2 flex-1 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full bg-brand-gold" style={{ width: `${percent}%` }} />
          </div>
          <span className="w-8 text-gray-400">{count}</span>
        </div>
      );
    })}
  </div>
);

const QuestionDetail = ({ question }) => {
  if (question.type === "YESNO") {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-6 py-3">
        <PieChart
          size={170}
          data={[
            { label: "Yes", value: question.yes, color: YES_COLOR },
            { label: "No", value: question.no, color: NO_COLOR },
          ]}
        />
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: YES_COLOR }} />
            <span className="font-medium">Yes</span>
            <span className="text-gray-600">
              {question.yesPercent}% ({question.yes})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: NO_COLOR }} />
            <span className="font-medium">No</span>
            <span className="text-gray-600">
              {question.noPercent}% ({question.no})
            </span>
          </div>
          <p className="text-xs text-gray-400">
            {question.total} answered
            {question.skipped > 0 ? ` · ${question.skipped} skipped` : ""}
          </p>
        </div>
      </div>
    );
  }

  if (question.answers.length === 0) {
    return <p className="py-3 text-sm text-gray-400">No written answers yet.</p>;
  }

  return (
    <ul className="py-3 space-y-2">
      {question.answers.map((answer, index) => (
        <li key={index} className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
          {answer}
        </li>
      ))}
      <li className="text-xs text-gray-400">Answers are shown anonymously.</li>
    </ul>
  );
};

const Feedback = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openSessionId, setOpenSessionId] = useState(null);
  const [openQuestionKey, setOpenQuestionKey] = useState(null);
  const [summaries, setSummaries] = useState({});
  const [summaryLoading, setSummaryLoading] = useState(null);
  const [summaryError, setSummaryError] = useState("");

  useEffect(() => {
    getMyFeedbackOverview()
      .then(setOverview)
      .catch((err) => setError(err.response?.data?.message || "Failed to load feedback"))
      .finally(() => setLoading(false));
  }, []);

  const toggleSession = async (sessionId) => {
    setOpenQuestionKey(null);
    setSummaryError("");

    if (openSessionId === sessionId) {
      setOpenSessionId(null);
      return;
    }

    setOpenSessionId(sessionId);
    if (summaries[sessionId]) return;

    setSummaryLoading(sessionId);
    try {
      const data = await getSessionFeedbackSummary(sessionId);
      setSummaries((current) => ({ ...current, [sessionId]: data }));
    } catch (err) {
      setSummaryError(err.response?.data?.message || "Failed to load this session's feedback");
    } finally {
      setSummaryLoading(null);
    }
  };

  const toggleQuestion = (key) => setOpenQuestionKey((current) => (current === key ? null : key));

  if (loading) return <p>Loading feedback...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const overall = overview?.overall;
  const sessions = overview?.sessions || [];

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold mb-4">Session Feedback</h1>

      {/* ---------- overall ---------- */}
      <Card className="mb-6">
        <p className="text-sm text-gray-500 mb-3">Overall feedback</p>
        {overall?.totalResponses > 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div>
              <p className="text-4xl font-bold text-brand-navy">
                {overall.averageRating}
                <span className="text-lg font-medium text-gray-400">/5</span>
              </p>
              <div className="mt-1">
                <StarDisplay value={overall.averageRating} size={18} />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {overall.totalResponses} response{overall.totalResponses === 1 ? "" : "s"} across{" "}
                {overall.totalSessions} completed session{overall.totalSessions === 1 ? "" : "s"}
              </p>
            </div>
            <RatingBars distribution={overall.distribution} total={overall.totalResponses} />
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No feedback has been submitted yet. It will appear here once students respond to your
            completed sessions.
          </p>
        )}
      </Card>

      {/* ---------- sessions ---------- */}
      <h2 className="text-sm font-semibold text-gray-700 mb-2">Sessions</h2>

      {sessions.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No completed sessions"
          description="Feedback is collected after a session is marked as completed."
        />
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => {
            const isOpen = openSessionId === session._id;
            const summary = summaries[session._id];

            return (
              <Card key={session._id} padded={false} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSession(session._id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition"
                  aria-expanded={isOpen}
                >
                  {isOpen ? (
                    <ChevronDown size={18} className="text-gray-400 shrink-0" />
                  ) : (
                    <ChevronRight size={18} className="text-gray-400 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      Session {session.sessionNumber} — {session.title}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(session.date)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {session.totalResponses > 0 ? (
                      <p className="text-sm font-semibold text-brand-navy">
                        {session.averageRating}/5
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400">No feedback yet</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {session.totalResponses}
                      {session.totalStudents ? ` / ${session.totalStudents}` : ""} responded
                    </p>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-4">
                    {summaryLoading === session._id && (
                      <p className="text-sm text-gray-500">Loading...</p>
                    )}
                    {summaryError && <p className="text-sm text-red-500">{summaryError}</p>}

                    {summary && summary.totalResponses === 0 && (
                      <p className="text-sm text-gray-500">
                        No feedback has been submitted for this session yet.
                      </p>
                    )}

                    {summary && summary.totalResponses > 0 && (
                      <>
                        <div className="flex items-center gap-3 mb-4">
                          <StarDisplay value={summary.averageRating} />
                          <span className="text-sm font-medium">{summary.averageRating}/5</span>
                          <span className="text-xs text-gray-400">
                            {summary.totalResponses} response{summary.totalResponses === 1 ? "" : "s"}
                          </span>
                        </div>

                        {summary.questions.length === 0 ? (
                          <p className="text-sm text-gray-400">
                            This session has no feedback questions.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                              Questions — click one to see the results
                            </p>
                            {summary.questions.map((question, index) => {
                              const key = `${session._id}:${question.questionId}`;
                              const open = openQuestionKey === key;
                              return (
                                <div key={key} className="rounded-lg border border-gray-200 bg-white">
                                  <button
                                    type="button"
                                    onClick={() => toggleQuestion(key)}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-gray-50"
                                    aria-expanded={open}
                                  >
                                    {open ? (
                                      <ChevronDown size={16} className="text-gray-400 shrink-0" />
                                    ) : (
                                      <ChevronRight size={16} className="text-gray-400 shrink-0" />
                                    )}
                                    <span className="flex-1 text-gray-800">
                                      {index + 1}. {question.question}
                                    </span>
                                    {question.type === "YESNO" ? (
                                      <span className="shrink-0 text-xs text-gray-500">
                                        <span className="text-green-600 font-medium">
                                          {question.yesPercent}% Yes
                                        </span>
                                      </span>
                                    ) : (
                                      <span className="shrink-0 text-xs text-gray-400">
                                        {question.total} answer{question.total === 1 ? "" : "s"}
                                      </span>
                                    )}
                                  </button>
                                  {open && (
                                    <div className="border-t border-gray-100 px-4">
                                      <QuestionDetail question={question} />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
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
};

export default Feedback;
