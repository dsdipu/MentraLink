import PropTypes from "prop-types";
import {
  CalendarCheck,
  CalendarClock,
  ClipboardCheck,
  GraduationCap,
  MessageSquareText,
  Star,
  UserCheck,
  Users,
} from "lucide-react";
import CountUp from "./CountUp";
import StarDisplay from "../ui/StarDisplay";

const AVATAR_TONES = ["bg-brand-navy", "bg-brand-green", "bg-brand-blue", "bg-brand-purple"];

const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");

const Tile = ({ icon: Icon, label, value, tone }) => (
  <div className="group rounded-2xl border border-gray-100 bg-white/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
    <span className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
      <Icon size={18} />
    </span>
    <p className="font-display text-3xl leading-none text-brand-navy">
      <CountUp value={value} />
    </p>
    <p className="mt-1.5 text-xs text-gray-500">{label}</p>
  </div>
);

Tile.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.number,
  tone: PropTypes.string.isRequired,
};

const Shimmer = ({ className = "" }) => (
  <div className={`relative overflow-hidden rounded-2xl bg-gray-100 ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
  </div>
);

Shimmer.propTypes = { className: PropTypes.string };

// What the program is about, shown only when the live numbers cannot be loaded.
// It contains no figures at all, so it can never be wrong.
const OFFLINE_POINTS = [
  [CalendarCheck, "Structured sessions every semester"],
  [ClipboardCheck, "Simple attendance tracking"],
  [MessageSquareText, "Honest, anonymous feedback"],
  [Star, "Mentor evaluation and recognition"],
];

// Hero side panel. Every number and name comes from the database through the public API;
// anything that does not exist yet is simply not shown (no placeholders, no invented values).
function HeroLive({ stats, mentors }) {
  const loading = stats === null;
  const hasStats = !!stats && typeof stats.totalMentors === "number";
  const rated = (mentors || []).filter((m) => m.totalFeedbacks > 0 && m.overallRating != null);
  const shownMentors = (mentors || []).slice(0, 3);
  const noPeopleYet = hasStats && stats.totalMentors === 0 && stats.totalStudents === 0;

  return (
    <div className="relative mx-auto w-full max-w-md lg:ml-auto">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-brand-green/25 via-brand-blue/15 to-brand-purple/25 blur-2xl" />

      <section
        aria-label="Live program overview"
        className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-2xl shadow-brand-navy/10 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-brand-green" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-green" />
            </span>
            <p className="text-sm font-semibold text-brand-navy">Live from MentraLink</p>
          </div>

          {hasStats && stats.activeSemester && (
            <span className="rounded-full bg-brand-mint px-3 py-1 text-xs font-medium text-brand-green">
              {stats.activeSemester.name}
            </span>
          )}
        </div>

        <div className="space-y-5 p-5">
          {loading && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <Shimmer key={i} className="h-[104px]" />
                ))}
              </div>
              <Shimmer className="h-24" />
            </>
          )}

          {!loading && !hasStats && (
            <div>
              <p className="mb-4 text-sm text-gray-500">
                Live numbers are not available right now. Here is what MentraLink offers:
              </p>
              <ul className="space-y-3">
                {OFFLINE_POINTS.map(([Icon, text]) => (
                  <li key={text} className="flex items-center gap-3 text-sm text-brand-navy">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-mint text-brand-green">
                      <Icon size={18} />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasStats && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Tile icon={UserCheck} label="Mentors" value={stats.totalMentors} tone="bg-brand-mint text-brand-green" />
                <Tile icon={GraduationCap} label="Students" value={stats.totalStudents} tone="bg-blue-50 text-brand-blue" />
                <Tile
                  icon={CalendarCheck}
                  label="Sessions completed"
                  value={stats.totalSessionsCompleted}
                  tone="bg-purple-50 text-brand-purple"
                />
                <Tile
                  icon={CalendarClock}
                  label="Upcoming sessions"
                  value={stats.upcomingSessions}
                  tone="bg-amber-50 text-amber-600"
                />
              </div>

              {noPeopleYet && (
                <p className="rounded-2xl bg-brand-mint/60 px-4 py-3 text-sm text-brand-green">
                  The program is just getting started. Be one of the first to join.
                </p>
              )}

              {stats.averageMentorRating !== null && stats.averageMentorRating !== undefined && (
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-brand-navy to-[#1c3573] px-4 py-3.5 text-white">
                  <div>
                    <p className="text-xs text-white/60">Average mentor rating</p>
                    <p className="font-display text-2xl leading-tight">
                      {stats.averageMentorRating.toFixed(1)}
                      <span className="text-sm text-white/50"> / 5</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <StarDisplay value={stats.averageMentorRating} size={16} />
                    <p className="mt-1 text-[11px] text-white/60">
                      from {stats.totalEvaluations} student evaluation{stats.totalEvaluations === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {!loading && hasStats && shownMentors.length > 0 && (
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <Users size={13} /> {rated.length > 0 ? "Top-rated mentors" : "Our mentors"}
                </p>
                <a href="#mentors" className="text-xs font-medium text-brand-green hover:underline">
                  See all
                </a>
              </div>

              <ul className="space-y-2">
                {shownMentors.map((mentor, index) => {
                  const isRated = mentor.totalFeedbacks > 0 && mentor.overallRating != null;
                  return (
                    <li
                      key={mentor.mentorId}
                      className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-3 py-2.5"
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold text-white ${
                          AVATAR_TONES[index % AVATAR_TONES.length]
                        }`}
                      >
                        {mentor.profileImage ? (
                          <img src={mentor.profileImage} alt="" loading="lazy" className="h-full w-full object-cover" />
                        ) : (
                          initials(mentor.name)
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-brand-navy">{mentor.name}</span>
                        <span className="block truncate text-xs text-gray-400">{mentor.department}</span>
                      </span>
                      {isRated ? (
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          <Star size={12} fill="currentColor" /> {Number(mentor.overallRating).toFixed(1)}
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500">
                          New mentor
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

HeroLive.propTypes = {
  stats: PropTypes.shape({
    totalMentors: PropTypes.number,
    totalStudents: PropTypes.number,
    totalSessionsCompleted: PropTypes.number,
    upcomingSessions: PropTypes.number,
    averageMentorRating: PropTypes.number,
    totalEvaluations: PropTypes.number,
    activeSemester: PropTypes.shape({ name: PropTypes.string }),
  }),
  mentors: PropTypes.arrayOf(PropTypes.object),
};

export default HeroLive;
