import { useEffect, useState } from "react";
import { getAllMentorRatings } from "../services/evaluationService";
import { updateMentor } from "../services/mentorService";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { GraduationCap, BadgeCheck, Star, Layers, Pencil, Check, X } from "lucide-react";

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
  const [ratingFilter, setRatingFilter] = useState(0);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", mentorStudentId: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    getAllMentorRatings().then(setMentors).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const startEdit = (m, e) => {
    e.stopPropagation();
    setError("");
    setEditingId(m.mentorId);
    setEditForm({ name: m.name || "", email: m.email || "", mentorStudentId: m.mentorStudentId || "" });
  };

  const cancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setError("");
  };

  const saveEdit = async (id, e) => {
    e.stopPropagation();
    setSaving(true);
    setError("");
    try {
      await updateMentor(id, editForm);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update mentor");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  const filteredMentors = mentors.filter((m) => (m.overallRating || 0) >= ratingFilter);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Mentor Ratings & Feedback</h1>

      <div className="mb-4 flex items-center justify-between">
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(Number(e.target.value))}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value={0}>All ratings</option>
          <option value={4}>4+ stars</option>
          <option value={3}>3+ stars</option>
          <option value={2}>2+ stars</option>
        </select>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {filteredMentors.map((m) => {
          const isEditing = editingId === m.mentorId;
          return (
            <Card key={m.mentorId} padded={false} className="overflow-hidden">
              <div
                className={!isEditing ? "p-4 cursor-pointer" : "p-4"}
                onClick={!isEditing ? () => setExpandedId(expandedId === m.mentorId ? null : m.mentorId) : undefined}
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
                    {isEditing ? (
                      <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          placeholder="Name"
                          className="border rounded-md px-2 py-1 text-sm w-full"
                        />
                        <input
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          placeholder="Email"
                          className="border rounded-md px-2 py-1 text-sm w-full"
                        />
                        <input
                          value={editForm.mentorStudentId}
                          onChange={(e) => setEditForm({ ...editForm, mentorStudentId: e.target.value })}
                          placeholder="Student ID"
                          className="border rounded-md px-2 py-1 text-sm w-full"
                        />
                      </div>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    {isEditing ? (
                      <div className="flex gap-1">
                        <button onClick={(e) => saveEdit(m.mentorId, e)} disabled={saving} className="text-green-600 p-1 disabled:opacity-50">
                          <Check size={18} />
                        </button>
                        <button onClick={cancelEdit} className="text-gray-400 p-1">
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button onClick={(e) => startEdit(m, e)} className="text-gray-400 hover:text-blue-600 mb-1">
                          <Pencil size={14} />
                        </button>
                        <p className="text-xl font-bold text-brand-navy flex items-center gap-1 justify-end">
                          <Star size={16} className="text-brand-gold" fill="currentColor" />
                          {m.overallRating || "—"}
                        </p>
                        <p className="text-[11px] text-gray-400">{m.totalEvaluations} evaluation(s)</p>
                      </>
                    )}
                  </div>
                </div>

                {!isEditing && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                    <Layers size={13} />
                    Mentored {m.batchesMentored} semester{m.batchesMentored !== 1 ? "s" : ""}
                  </div>
                )}
              </div>

              {expandedId === m.mentorId && !isEditing && (
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
          );
        })}
        {filteredMentors.length === 0 && <p className="text-gray-500">No mentors match this filter.</p>}
      </div>
    </div>
  );
};

export default AdminMentorRatings;