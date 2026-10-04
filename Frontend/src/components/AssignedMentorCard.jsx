import { useState } from "react";
import PropTypes from "prop-types";
import { Mail, Phone, Copy, Check, UserRound } from "lucide-react";
import Card from "./ui/Card";
import StarDisplay from "./ui/StarDisplay";

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt(`Copy ${label}:`, value);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="p-1.5 rounded-md text-gray-400 hover:text-brand-navy hover:bg-gray-100 transition"
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
    >
      {copied ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
    </button>
  );
}

CopyButton.propTypes = { value: PropTypes.string.isRequired, label: PropTypes.string.isRequired };

// Student dashboard card: the mentor of the student's active group + contact details.
function AssignedMentorCard({ mentor, group }) {
  if (!mentor) {
    return (
      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Your Mentor</h2>
        <p className="text-sm text-gray-500">
          No mentor has been assigned to your group yet. Once the admin assigns one, their contact
          details will appear here.
        </p>
      </Card>
    );
  }

  const hasRating = mentor.rating?.totalEvaluations > 0;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Your Mentor</h2>
        {group?.name && (
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
            {group.name}
            {group.semester ? ` · ${group.semester}` : ""}
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {mentor.profileImage ? (
          <img
            src={mentor.profileImage}
            alt={mentor.name}
            className="h-20 w-20 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="h-20 w-20 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center shrink-0">
            <UserRound size={34} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-gray-900">{mentor.name}</p>
          <p className="text-sm text-gray-500">
            {[mentor.department, mentor.batch && `Batch ${mentor.batch}`].filter(Boolean).join(" · ") ||
              "Mentor"}
          </p>
          {mentor.expertise && (
            <p className="text-xs text-gray-500 mt-1">Expertise: {mentor.expertise}</p>
          )}

          <div className="flex items-center gap-2 mt-2">
            {hasRating ? (
              <>
                <StarDisplay value={mentor.rating.overallRating} />
                <span className="text-sm font-medium text-gray-800">
                  {mentor.rating.overallRating}/5
                </span>
                <span className="text-xs text-gray-400">
                  ({mentor.rating.totalEvaluations} rating
                  {mentor.rating.totalEvaluations === 1 ? "" : "s"})
                </span>
              </>
            ) : (
              <span className="text-xs text-gray-400">No ratings yet</span>
            )}
          </div>

          <div className="mt-4 space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Mail size={15} className="text-gray-400 shrink-0" />
              <a href={`mailto:${mentor.email}`} className="text-blue-600 hover:underline truncate">
                {mentor.email}
              </a>
              <CopyButton value={mentor.email} label="email" />
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Phone size={15} className="text-gray-400 shrink-0" />
              {mentor.phone ? (
                <>
                  <a href={`tel:${mentor.phone}`} className="text-blue-600 hover:underline">
                    {mentor.phone}
                  </a>
                  <CopyButton value={mentor.phone} label="phone number" />
                </>
              ) : (
                <span className="text-gray-400">Phone number not added yet</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

AssignedMentorCard.propTypes = {
  mentor: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    department: PropTypes.string,
    batch: PropTypes.string,
    expertise: PropTypes.string,
    profileImage: PropTypes.string,
    rating: PropTypes.shape({
      overallRating: PropTypes.number,
      totalEvaluations: PropTypes.number,
    }),
  }),
  group: PropTypes.shape({ name: PropTypes.string, semester: PropTypes.string }),
};

export default AssignedMentorCard;
