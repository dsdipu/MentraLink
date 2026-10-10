import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, GraduationCap, ShieldCheck, UserCheck } from "lucide-react";

const ROLES = [
  {
    id: "students",
    label: "Students",
    icon: GraduationCap,
    headline: "Know who guides you and what comes next",
    points: [
      "See your mentor's contact details and rating right on your dashboard",
      "Follow the semester's sessions, with meeting links when sessions are online",
      "Check your attendance record at any time",
      "Give anonymous feedback after each session and evaluate your mentor",
      "Read blog posts and guides written by mentors",
    ],
  },
  {
    id: "mentors",
    label: "Mentors",
    icon: UserCheck,
    headline: "Run every session without the paperwork",
    points: [
      "Schedule the planned sessions for your section in a few clicks",
      "Mark attendance and keep the full student list in one place",
      "See feedback session by session, with Yes/No answers as clear pie charts",
      "Read student evaluations, grouped by session, without names attached",
      "Share experience and advice through blog posts",
    ],
  },
  {
    id: "admins",
    label: "Administrators",
    icon: ShieldCheck,
    headline: "Manage the whole program from one dashboard",
    points: [
      "Create semesters, session plans and feedback questions once",
      "Create student accounts in bulk from an ID range, such as 262034001 to 262034035",
      "Assign students to mentors automatically by ID range, for the whole semester",
      "Approve new registrations after checking the student ID card",
      "Track mentor ratings and program activity",
    ],
  },
];

function RoleTabs() {
  const [active, setActive] = useState(ROLES[0].id);
  const tabRefs = useRef({});
  const role = ROLES.find((item) => item.id === active);

  const handleKeyDown = (event, index) => {
    const move = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (move === undefined) return;
    event.preventDefault();
    const next = ROLES[(index + move + ROLES.length) % ROLES.length];
    setActive(next.id);
    tabRefs.current[next.id]?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="MentraLink for each role"
        className="mx-auto mb-8 flex w-full max-w-xl rounded-full border border-gray-200 bg-white p-1.5 shadow-sm"
      >
        {ROLES.map((item, index) => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              ref={(el) => (tabRefs.current[item.id] = el)}
              type="button"
              role="tab"
              id={`role-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`role-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(item.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
                selected
                  ? "bg-brand-navy text-white shadow-md"
                  : "text-gray-500 hover:bg-gray-50 hover:text-brand-navy"
              }`}
            >
              <item.icon size={16} className="hidden sm:block" />
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        key={role.id}
        role="tabpanel"
        id={`role-panel-${role.id}`}
        aria-labelledby={`role-tab-${role.id}`}
        className="mx-auto max-w-3xl animate-[fadeIn_0.4s_ease-out] rounded-3xl border border-gray-100 bg-white p-7 shadow-lg sm:p-9"
      >
        <h3 className="font-display text-2xl text-brand-navy sm:text-3xl">{role.headline}</h3>
        <ul className="mt-6 space-y-3.5">
          {role.points.map((point) => (
            <li key={point} className="flex items-start gap-3 text-gray-600">
              <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-brand-green" />
              <span className="leading-7">{point}</span>
            </li>
          ))}
        </ul>
        {role.id !== "admins" && (
          <Link
            to="/register"
            className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand-green hover:gap-3 transition-all"
          >
            Join as {role.id === "students" ? "a student" : "a mentor"} <ArrowRight size={15} />
          </Link>
        )}
      </div>
    </div>
  );
}

export default RoleTabs;
