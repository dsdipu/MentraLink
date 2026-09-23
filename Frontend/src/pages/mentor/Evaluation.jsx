import { useEffect, useState } from "react";
import { getMentorRating, getMyMentorEvaluations } from "../../services/evaluationService";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import EmptyState from "../../components/ui/EmptyState";
import { Star } from "lucide-react";

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

      <div className="max-w-sm mb-4">
        <StatCard icon={Star} label={`Based on ${data?.totalEvaluations ?? 0} student evaluations`} value={`${data?.overallRating ?? "-"}/5`} tone="gold" />
      </div>

      {data?.totalEvaluations > 0 && (
        <Card className="max-w-sm mb-6">
          <p className="text-sm text-gray-500 mb-3">Category breakdown</p>
          <div className="space-y-2">
            {Object.entries(data.categoryAverages).map(([key, val]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-gray-600">{CATEGORY_LABELS[key] || key}</span>
                <span className="font-medium">{val}/5</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <h2 className="text-lg font-medium mb-3">Student Comments</h2>
      {evaluations.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No evaluations yet"
          description="Student evaluations for your sessions will appear here."
        />
      ) : (
        <div className="space-y-3 max-w-xl">
          {evaluations.map((e) => (
            <Card key={e._id}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">{e.studentName}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {e.sessionTitle || "Session"}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{e.comment || <em className="text-gray-400">No comment left</em>}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Evaluation;