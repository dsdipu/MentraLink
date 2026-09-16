import { useEffect, useState } from "react";
import { getMentorRating, getMyMentorEvaluations } from "../../services/evaluationService";

const CATEGORY_LABELS = {
  communication: "Communication",
  guidance: "Guidance",
  availability: "Availability",
  knowledgeSharing: "Knowledge Sharing",
  overallExperience: "Overall Experience",
};

const Evaluation = () => {
  const [data, setData] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMentorRating(), getMyMentorEvaluations()])
      .then(([rating, evals]) => {
        setData(rating);
        setEvaluations(evals);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading rating...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">My Evaluation Rating</h1>

      <div className="bg-white rounded-lg shadow p-6 max-w-sm mb-4">
        <p className="text-sm text-gray-500">Overall Rating</p>
        <p className="text-4xl font-bold text-blue-600">{data?.overallRating ?? "-"}/5</p>
        <p className="text-sm text-gray-400 mt-2">Based on {data?.totalEvaluations ?? 0} student evaluations</p>
      </div>

      {data?.totalEvaluations > 0 && (
        <div className="bg-white rounded-lg shadow p-6 max-w-sm mb-6">
          <p className="text-sm text-gray-500 mb-3">Category breakdown</p>
          <div className="space-y-2">
            {Object.entries(data.categoryAverages).map(([key, val]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-gray-600">{CATEGORY_LABELS[key] || key}</span>
                <span className="font-medium">{val}/5</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-lg font-medium mb-3">Student Comments</h2>
      <div className="space-y-3 max-w-xl">
        {evaluations.map((e) => (
          <div key={e._id} className="bg-white rounded-lg shadow p-4 text-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium">{e.studentName}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {e.sessionTitle || "Session"}
              </span>
            </div>
            <p className="text-gray-600">{e.comment || <em className="text-gray-400">No comment left</em>}</p>
          </div>
        ))}
        {evaluations.length === 0 && <p className="text-gray-500 text-sm">No evaluations yet.</p>}
      </div>
    </div>
  );
};

export default Evaluation;