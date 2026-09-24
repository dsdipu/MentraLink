import { useEffect, useState } from "react";
import { getAllMentorRatings } from "../services/evaluationService";
import { updateMentor } from "../services/mentorService";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import {
  GraduationCap,
  BadgeCheck,
  Star,
  Layers,
  Pencil,
  Check,
  X,
} from "lucide-react";

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
  const [ratingFilter, setRatingFilter] = useState("ALL");

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    mentorStudentId: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);

    getAllMentorRatings()
      .then((data) => {
        setMentors(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            "Failed to load mentor ratings"
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (mentor, event) => {
    event.stopPropagation();

    setError("");
    setEditingId(mentor.mentorId);

    setEditForm({
      name: mentor.name || "",
      email: mentor.email || "",
      mentorStudentId: mentor.mentorStudentId || "",
    });
  };

  const cancelEdit = (event) => {
    event.stopPropagation();

    setEditingId(null);
    setError("");
  };

  const saveEdit = async (id, event) => {
    event.stopPropagation();

    setSaving(true);
    setError("");

    try {
      await updateMentor(id, editForm);

      setEditingId(null);
      load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update mentor"
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredMentors = mentors.filter((mentor) => {
    const rating = Number(mentor.overallRating || 0);

    if (ratingFilter === "HIGHER") {
      return rating >= 4;
    }

    if (ratingFilter === "LOWER") {
      return rating < 4;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading mentor ratings...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
          Mentor Ratings & Feedback
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          View mentor ratings and student feedback.
        </p>
      </div>

      <div className="mb-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 overflow-x-auto pb-1">
          <div className="flex w-max gap-2">
            <button
              type="button"
              onClick={() => setRatingFilter("ALL")}
              className={`whitespace-nowrap rounded-md border px-4 py-2 text-sm font-medium transition ${
                ratingFilter === "ALL"
                  ? "border-brand-navy bg-brand-navy text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              All
            </button>

            <button
              type="button"
              onClick={() => setRatingFilter("HIGHER")}
              className={`whitespace-nowrap rounded-md border px-4 py-2 text-sm font-medium transition ${
                ratingFilter === "HIGHER"
                  ? "border-green-600 bg-green-600 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Higher
            </button>

            <button
              type="button"
              onClick={() => setRatingFilter("LOWER")}
              className={`whitespace-nowrap rounded-md border px-4 py-2 text-sm font-medium transition ${
                ratingFilter === "LOWER"
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Lower
            </button>
          </div>
        </div>

        {error && (
          <p className="break-words text-sm text-red-500">
            {error}
          </p>
        )}
      </div>

      <div className="mb-4 text-sm text-gray-500">
        Showing {filteredMentors.length} of {mentors.length} mentors
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        {filteredMentors.map((mentor) => {
          const isEditing =
            editingId === mentor.mentorId;

          return (
            <Card
              key={mentor.mentorId}
              padded={false}
              className="min-w-0 overflow-hidden"
            >
              <div
                className={
                  !isEditing
                    ? "cursor-pointer p-4"
                    : "p-4"
                }
                onClick={
                  !isEditing
                    ? () =>
                        setExpandedId(
                          expandedId === mentor.mentorId
                            ? null
                            : mentor.mentorId
                        )
                    : undefined
                }
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700">
                    {mentor.profileImage ? (
                      <img
                        src={mentor.profileImage}
                        alt={mentor.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      mentor.name
                        ?.charAt(0)
                        ?.toUpperCase() || "M"
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div
                        className="space-y-1.5"
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                      >
                        <input
                          value={editForm.name}
                          onChange={(event) =>
                            setEditForm({
                              ...editForm,
                              name: event.target.value,
                            })
                          }
                          placeholder="Name"
                          className="w-full rounded-md border px-2 py-1 text-sm"
                        />

                        <input
                          value={editForm.email}
                          onChange={(event) =>
                            setEditForm({
                              ...editForm,
                              email: event.target.value,
                            })
                          }
                          placeholder="Email"
                          className="w-full rounded-md border px-2 py-1 text-sm"
                        />

                        <input
                          value={
                            editForm.mentorStudentId
                          }
                          onChange={(event) =>
                            setEditForm({
                              ...editForm,
                              mentorStudentId:
                                event.target.value,
                            })
                          }
                          placeholder="Student ID"
                          className="w-full rounded-md border px-2 py-1 text-sm"
                        />
                      </div>
                    ) : (
                      <>
                        <p className="truncate font-semibold text-brand-navy">
                          {mentor.name}
                        </p>

                        <p className="mb-2 truncate text-xs text-gray-500">
                          {mentor.email}
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                          {mentor.mentorStudentId && (
                            <Badge
                              tone="brand"
                              className="text-[11px]"
                            >
                              <BadgeCheck
                                size={10}
                                className="mr-1"
                              />
                              {mentor.mentorStudentId}
                            </Badge>
                          )}

                          {mentor.batch && (
                            <Badge
                              tone="info"
                              className="text-[11px]"
                            >
                              <GraduationCap
                                size={10}
                                className="mr-1"
                              />
                              Batch {mentor.batch}
                            </Badge>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    {isEditing ? (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={(event) =>
                            saveEdit(
                              mentor.mentorId,
                              event
                            )
                          }
                          disabled={saving}
                          className="p-1 text-green-600 disabled:opacity-50"
                        >
                          <Check size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="p-1 text-gray-400"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={(event) =>
                            startEdit(
                              mentor,
                              event
                            )
                          }
                          className="mb-1 text-gray-400 hover:text-blue-600"
                        >
                          <Pencil size={14} />
                        </button>

                        <p className="flex items-center justify-end gap-1 text-xl font-bold text-brand-navy">
                          <Star
                            size={16}
                            className="text-brand-gold"
                            fill="currentColor"
                          />
                          {mentor.overallRating || "—"}
                        </p>

                        <p className="text-[11px] text-gray-400">
                          {mentor.totalEvaluations}{" "}
                          evaluation(s)
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {!isEditing && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                    <Layers size={13} />

                    Mentored {mentor.batchesMentored}{" "}
                    semester
                    {mentor.batchesMentored !== 1
                      ? "s"
                      : ""}
                  </div>
                )}
              </div>

              {expandedId === mentor.mentorId &&
                !isEditing && (
                  <div className="border-t px-4 pb-4 pt-4">
                    {mentor.totalEvaluations > 0 && (
                      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {Object.entries(
                          mentor.categoryAverages
                        ).map(([key, value]) => (
                          <div
                            key={key}
                            className="rounded-md bg-gray-50 py-2 text-center"
                          >
                            <p className="text-[11px] text-gray-500">
                              {CATEGORY_LABELS[key] ||
                                key}
                            </p>

                            <p className="text-sm font-semibold">
                              {value}/5
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-3">
                      {mentor.evaluations.map(
                        (evaluation) => (
                          <div
                            key={evaluation._id}
                            className="rounded-md bg-gray-50 p-3 text-sm"
                          >
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <span className="font-medium">
                                {
                                  evaluation.studentName
                                }
                              </span>

                              <span className="w-fit rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                                {evaluation.sessionTitle ||
                                  "Session"}
                              </span>
                            </div>

                            <p className="mt-1 break-words text-gray-600">
                              {evaluation.comment || (
                                <em className="text-gray-400">
                                  No comment
                                </em>
                              )}
                            </p>
                          </div>
                        )
                      )}

                      {mentor.evaluations.length ===
                        0 && (
                        <p className="text-sm text-gray-400">
                          No evaluations yet.
                        </p>
                      )}
                    </div>
                  </div>
                )}
            </Card>
          );
        })}

        {filteredMentors.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-gray-300 bg-white px-5 py-10 text-center">
            <p className="text-sm text-gray-500">
              No mentors match this filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMentorRatings;