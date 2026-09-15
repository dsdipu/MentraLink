import { useEffect, useState } from "react";
import { getMySessions } from "../../services/sessionService";
import { getMyEvaluations, submitEvaluation } from "../../services/evaluationService";

const RATING_FIELDS = [
  { key: "communication", label: "Communication" },
  { key: "guidance", label: "Guidance" },
  { key: "availability", label: "Availability" },
  { key: "knowledgeSharing", label: "Knowledge Sharing" },
  { key: "overallExperience", label: "Overall Experience" },
];

const emptyRatings = { communication: 5, guidance: 5, availability: 5, knowledgeSharing: 5, overallExperience: 5 };

const Evaluation = () => {
  const [sessions, setSessions] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [ratings, setRatings] = useState(emptyRatings);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([getMySessions(), getMyEvaluations()])
      .then(([s, h]) => {
        setSessions(s.filter((x) => x.status === "COMPLETED"));
        setHistory(h);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const alreadyEvaluated = (sessionId) => history.some((e) => e.session?._id === sessionId);
  const availableSessions = sessions.filter((s) => !alreadyEvaluated(s._id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await submitEvaluation(selectedId, { ratings, comment });
      setMessage("Evaluation submitted");
      setSelectedId("");
      setRatings(emptyRatings);
      setComment("");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to submit evaluation");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-4">Mentor Evaluation</h1>
      {message && <p className="text-sm mb-4 text-blue-600">{message}</p>}

      {availableSessions.length === 0 ? (
        <p className="text-gray-500">
          {sessions.length === 0 ? "No completed sessions yet." : "You've evaluated all your completed sessions."}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <select
            required
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="">Select a completed session</option>
            {availableSessions.map((s) => (
              <option key={s._id} value={s._id}>#{s.sessionNumber} — {s.title}</option>
            ))}
          </select>

          {RATING_FIELDS.map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm mb-1">{label} (1-5)</label>
              <input
                type="number" min="1" max="5"
                value={ratings[key]}
                onChange={(e) => setRatings({ ...ratings, [key]: Number(e.target.value) })}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm mb-1">Comments</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} className="w-full border rounded-md px-3 py-2" />
          </div>

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Submit Evaluation
          </button>
        </form>
      )}
    </div>
  );
};

export default Evaluation;