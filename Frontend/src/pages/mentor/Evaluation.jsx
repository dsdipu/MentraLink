import { useEffect, useState } from "react";
import { getMentorRating, getMyMentorEvaluations } from "../../services/evaluationService";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import EmptyState from "../../components/ui/EmptyState";
import EvaluationBySession from "../../components/EvaluationBySession";
import { CATEGORY_LABELS } from "../../utils/evaluationGroups";
import { Star } from "lucide-react";

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

      <h2 className="text-lg font-medium mb-1">Student Comments by Session</h2>
      <p className="text-xs text-gray-400 mb-3">
        Click a session to see its scores and comments. Students are shown anonymously.
      </p>
      {evaluations.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No evaluations yet"
          description="Student evaluations for your sessions will appear here."
        />
      ) : (
        <div className="max-w-3xl">
          <EvaluationBySession evaluations={evaluations} />
        </div>
      )}
    </div>
  );
};

export default Evaluation;