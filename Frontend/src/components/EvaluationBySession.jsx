import { useState } from "react";
import PropTypes from "prop-types";
import { ChevronDown, ChevronRight } from "lucide-react";
import Card from "./ui/Card";
import StarDisplay from "./ui/StarDisplay";
import {
  CATEGORY_LABELS,
  evaluationAverage,
  groupEvaluationsBySession,
} from "../utils/evaluationGroups";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "";

// Evaluations grouped per session. Every session is collapsed by default, so a long
// history stays compact; click a session to see its category scores and comments.
function EvaluationBySession({ evaluations, showStudentName = false, emptyText }) {
  const groups = groupEvaluationsBySession(evaluations);
  const [openKeys, setOpenKeys] = useState([]);

  if (groups.length === 0) {
    return <p className="text-sm text-gray-500">{emptyText || "No evaluations yet."}</p>;
  }

  const allOpen = openKeys.length === groups.length;
  const toggle = (key) =>
    setOpenKeys((current) =>
      current.includes(key) ? current.filter((k) => k !== key) : [...current, key]
    );

  return (
    <div>
      {groups.length > 1 && (
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={() => setOpenKeys(allOpen ? [] : groups.map((g) => g.key))}
            className="text-xs text-blue-600 hover:underline"
          >
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {groups.map((group) => {
          const isOpen = openKeys.includes(group.key);
          return (
            <Card key={group.key} padded={false} className="overflow-hidden">
              <button
                type="button"
                onClick={() => toggle(group.key)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50"
              >
                {isOpen ? (
                  <ChevronDown size={18} className="shrink-0 text-gray-400" />
                ) : (
                  <ChevronRight size={18} className="shrink-0 text-gray-400" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {group.sessionNumber ? `Session ${group.sessionNumber} — ` : ""}
                    {group.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {[
                      formatDate(group.date),
                      `${group.evaluations.length} evaluation${group.evaluations.length === 1 ? "" : "s"}`,
                      group.commentCount > 0
                        ? `${group.commentCount} comment${group.commentCount === 1 ? "" : "s"}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-brand-navy">{group.averageRating}/5</p>
                  <StarDisplay value={group.averageRating} size={12} />
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-4">
                  <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <div key={key} className="rounded-md bg-white py-2 text-center shadow-sm">
                        <p className="text-[11px] text-gray-500">{label}</p>
                        <p className="text-sm font-semibold">{group.categoryAverages[key] || "-"}/5</p>
                      </div>
                    ))}
                  </div>

                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                    Comments
                  </p>
                  <ul className="space-y-2">
                    {group.evaluations.map((evaluation) => (
                      <li key={evaluation._id} className="rounded-md bg-white p-3 text-sm shadow-sm">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="font-medium text-gray-800">
                            {showStudentName ? evaluation.studentName || "Anonymous" : "Student comment"}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <StarDisplay value={evaluationAverage(evaluation.ratings)} size={12} />
                            {evaluationAverage(evaluation.ratings)}
                          </span>
                        </div>
                        <p className="break-words text-gray-600">
                          {evaluation.comment?.trim() || (
                            <em className="text-gray-400">No comment left</em>
                          )}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

EvaluationBySession.propTypes = {
  evaluations: PropTypes.arrayOf(PropTypes.object).isRequired,
  showStudentName: PropTypes.bool,
  emptyText: PropTypes.string,
};

export default EvaluationBySession;
