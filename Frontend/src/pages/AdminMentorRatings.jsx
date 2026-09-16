import { useEffect, useState } from "react";
import { getAllMentorRatings } from "../services/evaluationService";

const CATEGORY_LABELS = {
  communication: "Communication",
  guidance: "Guidance",
  availability: "Availability",
  knowledgeSharing: "Knowledge Sharing",
  overallExperience: "Overall Experience",
};

const AdminMentorRatings = () => {
  const [mentors, setMentors] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllMentorRatings().then(setMentors).finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Mentor Ratings & Feedback</h1>

      <div className="space-y-4">
        {mentors.map((m) => (
          <div key={m.mentorId} className="bg-white rounded-lg shadow p-4">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setExpandedId(expandedId === m.mentorId ? null : m.mentorId)}
            >
              <div>
                <p className="font-semibold">{m.name}</p>
                <p className="text-sm text-gray-500">{m.email}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-blue-600">{m.overallRating}/5</p>
                <p className="text-xs text-gray-400">{m.totalEvaluations} evaluation(s)</p>
              </div>
            </div>

            {expandedId === m.mentorId && (
              <div className="mt-4 border-t pt-4">
                {m.totalEvaluations > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                    {Object.entries(m.categoryAverages).map(([key, val]) => (
                      <div key={key} className="text-center bg-gray-50 rounded-md py-2">
                        <p className="text-xs text-gray-500">{CATEGORY_LABELS[key] || key}</p>
                        <p className="font-semibold">{val}/5</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-3">
                  {m.evaluations.map((e) => (
                    <div key={e._id} className="bg-gray-50 rounded-md p-3 text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{e.studentName}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          {e.sessionTitle || "Session"}
                        </span>
                      </div>
                      <p className="text-gray-600">{e.comment || <em className="text-gray-400">No comment</em>}</p>
                    </div>
                  ))}
                  {m.evaluations.length === 0 && (
                    <p className="text-gray-400 text-sm">No evaluations yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {mentors.length === 0 && <p className="text-gray-500">No mentors yet.</p>}
      </div>
    </div>
  );
};

export default AdminMentorRatings;