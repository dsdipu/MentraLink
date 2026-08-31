import { useEffect, useState } from "react";
import { getMentorRating } from "../../services/evaluationService";

const Evaluation = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMentorRating().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading rating...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">My Evaluation Rating</h1>
      <div className="bg-white rounded-lg shadow p-6 max-w-sm">
        <p className="text-sm text-gray-500">Overall Rating</p>
        <p className="text-4xl font-bold text-blue-600">{data?.averageRating ?? "-"}/5</p>
        <p className="text-sm text-gray-400 mt-2">Based on {data?.totalEvaluations ?? 0} student evaluations</p>
      </div>
    </div>
  );
};

export default Evaluation;