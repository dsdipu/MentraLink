import { useEffect, useState } from "react";
import { getSessions } from "../../services/sessionService";
import { getSessionFeedback } from "../../services/feedbackService";

const Feedback = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    getSessions().then((data) => setSessions(data.filter((s) => s.status === "completed")));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    getSessionFeedback(selectedId).then(setFeedback);
  }, [selectedId]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Session Feedback</h1>
      <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="border rounded-md px-3 py-2 mb-4">
        <option value="">Select a completed session</option>
        {sessions.map((s) => (
          <option key={s._id} value={s._id}>{s.title}</option>
        ))}
      </select>

      {feedback && (
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Average Rating</p>
          <p className="text-2xl font-bold text-blue-600 mb-3">{feedback.averageRating ?? "-"}/5</p>
          <div className="divide-y">
            {feedback.entries?.map((f, i) => (
              <div key={i} className="py-2 text-sm">
                <span className="font-medium">{f.rating}/5</span> — {f.comment}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;