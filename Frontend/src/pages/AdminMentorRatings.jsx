import { useEffect, useState } from "react";
import { getAllMentorRatings } from "../services/evaluationService";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { GraduationCap, BadgeCheck, Star, Layers } from "lucide-react";

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

      <div className="grid sm:grid-cols-2 gap-4">
        {mentors.map((m) => (
          <Card key={m.mentorId} padded={false} className="overflow-hidden">
            <div
              className="p-4 cursor-pointer"
              onClick={() => setExpandedId(expandedId === m.mentorId ? null : m.mentorId)}
            >
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-semibold shrink-0">
                  {m.profileImage ? (
                    <img src={m.profileImage} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    m.name?.charAt(0)?.toUpperCase() || "M"
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brand-navy truncate">{m.name}</p>
                  <p className="text-xs text-gray-500 truncate mb-2">{m.email}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {m.mentorStudentId && (
                      <Badge tone="brand" className="text-[11px]">
                        <BadgeCheck size={10} className="mr-1" />
                        {m.mentorStudentId}
                      </Badge>
                    )}
                    {m.batch && (
                      <Badge tone="info" className="text-[11px]">
                        <GraduationCap size={10} className="mr-1" />
                        Batch {m.batch}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xl font-bold text-brand-navy flex items-center gap-1 justify-end">
                    <Star size={16} className="text-brand-gold" fill="currentColor" />
                    {m.overallRating || "—"}
                  </p>
                  <p className="text-[11px] text-gray-400">{m.totalEvaluations} evaluation(s)</p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                <Layers size={13} />
                Mentored {m.batchesMentored} semester{m.batchesMentored !== 1 ? "s" : ""}
              </div>
            </div>

            {expandedId === m.mentorId && (
              <div className="px-4 pb-4 border-t pt-4">
                {m.totalEvaluations > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                    {Object.entries(m.categoryAverages).map(([key, val]) => (
                      <div key={key} className="text-center bg-gray-50 rounded-md py-2">
                        <p className="text-[11px] text-gray-500">{CATEGORY_LABELS[key] || key}</p>
                        <p className="font-semibold text-sm">{val}/5</p>
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
          </Card>
        ))}
        {mentors.length === 0 && <p className="text-gray-500">No mentors yet.</p>}
      </div>
    </div>
  );
};

export default AdminMentorRatings;