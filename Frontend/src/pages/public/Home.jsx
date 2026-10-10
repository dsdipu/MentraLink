import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  ChevronDown,
  ClipboardCheck,
  EyeOff,
  FileCheck2,
  KeyRound,
  Layers,
  Lock,
  ShieldCheck,
  Sparkles,
  Star,
  Wand2,
} from "lucide-react";
import { getPublicStats, getTopMentors } from "../../services/publicService";
import { getBlogs } from "../../services/blogService";
import { previewText } from "../../utils/blogPreview";
import useAuth from "../../hooks/useAuth";
import TeamGrid from "../../components/TeamGrid";
import Reveal from "../../components/home/Reveal";
import HeroLive from "../../components/home/HeroLive";
import RoleTabs from "../../components/home/RoleTabs";

const AVATAR_TONES = ["bg-brand-navy", "bg-brand-green", "bg-brand-blue", "bg-brand-purple"];

const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");

const dashboardPath = (role) =>
  ({ ADMIN: "/admin/dashboard", MENTOR: "/mentor/dashboard", STUDENT: "/student/dashboard" })[
    String(role || "").toUpperCase()
  ] || "/";

const STEPS = [
  {
    title: "Get connected",
    text: "Students are placed into a mentorship section with a mentor, automatically or by the admin.",
  },
  {
    title: "Meet regularly",
    text: "Mentors schedule the planned sessions and guide students through academic and career topics.",
  },
  {
    title: "Reflect and grow",
    text: "Students share anonymous feedback and evaluations, so the program keeps getting better.",
  },
];

const FEATURES = [
  {
    icon: CalendarCheck,
    title: "Structured sessions",
    text: "A planned series of sessions per semester, scheduled by mentors with dates, places and meeting links.",
  },
  {
    icon: ClipboardCheck,
    title: "Simple attendance",
    text: "Mentors mark attendance per session and students can always see their own record.",
  },
  {
    icon: BarChart3,
    title: "Feedback that is easy to read",
    text: "Ratings, comments and Yes/No questions are summarised session by session, with clear pie charts.",
  },
  {
    icon: Star,
    title: "Mentor evaluation",
    text: "Students rate communication, guidance and availability, so good mentoring is recognised.",
  },
  {
    icon: Wand2,
    title: "Smart section assignment",
    text: "Assign students to mentors by student ID range once, and new students join the right section automatically.",
  },
  {
    icon: Layers,
    title: "One place for everything",
    text: "Semesters, sections, sessions, blogs and ratings, managed from a single dashboard for each role.",
  },
];

const TRUST = [
  {
    icon: FileCheck2,
    title: "ID cards are not kept",
    text: "A student ID card photo is stored privately and deleted as soon as an admin approves or rejects the request.",
  },
  {
    icon: KeyRound,
    title: "Strong passwords",
    text: "Passwords must be long and hard to guess, and temporary passwords have to be replaced at first login.",
  },
  {
    icon: EyeOff,
    title: "Honest, anonymous feedback",
    text: "Mentors see feedback and evaluations without student names, so students can speak openly.",
  },
  {
    icon: Lock,
    title: "Role-based access",
    text: "Students, mentors and admins only see what their role needs, and repeated failed logins lock the account for a while.",
  },
];

const FAQS = [
  [
    "What is MentraLink?",
    "MentraLink is a mentorship management platform for Green University's Software Engineering students and mentors. It organizes mentorship sessions, attendance, feedback and evaluations in one place.",
  ],
  [
    "How do I join?",
    "Register with your university email and a photo of your student ID card. An administrator reviews the request and approves it. Some accounts are created directly by administrators: in that case sign in with your student ID email and your student ID as the temporary password, then choose your own password.",
  ],
  [
    "How does the mentorship program work?",
    "Mentors guide students through a structured series of sessions during the semester. Sessions are scheduled, attendance is tracked, and students give feedback after completed sessions.",
  ],
  [
    "How many sessions are there?",
    "Each mentorship semester is organized around 12 planned sessions. Administrators define the session topics and feedback questions, while mentors schedule the sessions for their sections.",
  ],
  [
    "Who can see my feedback?",
    "Mentors see feedback and evaluations as summaries and comments without student names. Administrators manage the program and can see evaluations to keep the quality high.",
  ],
  [
    "I forgot my password. What now?",
    "Use the Forgot password link on the login page. A verification code is sent to your email, and you can then set a new strong password.",
  ],
];

const SectionHeading = ({ eyebrow, title, text, align = "center" }) => (
  <div className={`mb-12 max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
    <p className="mb-2 text-sm font-semibold text-brand-green">{eyebrow}</p>
    <h2 className="font-display text-3xl text-brand-navy sm:text-4xl">{title}</h2>
    {text && <p className="mt-4 leading-7 text-gray-500">{text}</p>}
  </div>
);

const Skeleton = ({ className = "" }) => (
  <div className={`relative overflow-hidden rounded-2xl bg-gray-100 ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
  </div>
);

const MentorCard = ({ mentor, tone }) => {
  const rated = mentor.totalFeedbacks > 0 && mentor.overallRating != null;
  const rating = rated ? Number(mentor.overallRating) : 0;

  return (
    <div className="group rounded-2xl border border-gray-100 bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div
        className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full font-display text-xl text-white shadow-md ring-4 ring-white ${tone}`}
      >
        {mentor.profileImage ? (
          <img
            src={mentor.profileImage}
            alt={mentor.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          initials(mentor.name)
        )}
      </div>
      <p className="font-semibold text-brand-navy">{mentor.name}</p>
      <p className="mb-3 text-sm text-brand-green">{mentor.department}</p>

      {rated ? (
        <>
          <div className="mb-1 flex items-center justify-center gap-0.5" aria-label={`${rating.toFixed(1)} out of 5`}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                size={15}
                className={n <= Math.round(rating) ? "text-brand-gold" : "text-gray-200"}
                fill={n <= Math.round(rating) ? "currentColor" : "none"}
              />
            ))}
          </div>
          <p className="text-xs text-gray-400">
            {rating.toFixed(1)} out of 5 · {mentor.totalFeedbacks} evaluation
            {mentor.totalFeedbacks !== 1 ? "s" : ""}
          </p>
        </>
      ) : (
        <p className="mx-auto inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
          New mentor · no ratings yet
        </p>
      )}

      {mentor.totalSemesters > 0 && (
        <p className="mt-2 text-xs font-medium text-brand-green">
          Mentored {mentor.totalSemesters} {mentor.totalSemesters === 1 ? "semester" : "semesters"}
        </p>
      )}
    </div>
  );
};

const Home = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [blogs, setBlogs] = useState(null); // null = still loading
  const [topMentors, setTopMentors] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    getPublicStats().then(setStats).catch(() => setStats({}));
    getBlogs().then((list) => setBlogs(list.slice(0, 3))).catch(() => setBlogs([]));
    getTopMentors(6).then(setTopMentors).catch(() => setTopMentors([]));
  }, []);

  const primaryCta = user
    ? { to: dashboardPath(user.role), label: "Go to your dashboard" }
    : { to: "/register", label: "Get Started" };

  return (
    <div className="overflow-hidden font-sans">
      {/* ---------------- hero ---------------- */}
      <section className="relative border-b border-gray-100 bg-gradient-to-b from-brand-mint/70 via-white to-white">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-green/10 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-brand-blue/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: "radial-gradient(#0F1B3D14 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage: "linear-gradient(to bottom, black 40%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent)",
          }}
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 py-16 sm:py-20 lg:grid-cols-[1.1fr_.9fr] lg:py-28">
          <div>
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-green/20 bg-white/80 px-4 py-1.5 text-sm font-semibold text-brand-green shadow-sm backdrop-blur">
              <Sparkles size={15} />
              Software Engineering · Green University of Bangladesh
            </p>

            <h1 className="max-w-3xl font-display text-4xl leading-[1.05] text-brand-navy sm:text-5xl lg:text-6xl">
              Mentorship that helps students{" "}
              <span className="bg-gradient-to-r from-brand-green via-brand-blue to-brand-purple bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-pan">
                move forward.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              MentraLink brings students and mentors together through a structured semester journey of
              scheduled sessions, attendance, feedback and evaluation.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to={primaryCta.to}
                className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-7 py-3.5 font-medium text-white shadow-lg shadow-brand-navy/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                {primaryCta.label} <ArrowRight size={17} />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-7 py-3.5 font-medium text-brand-navy transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-green hover:text-brand-green"
              >
                Learn about MentraLink
              </Link>
            </div>

            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
              {["Made for GUB Software Engineering", "Anonymous feedback", "Secure by design"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-brand-green" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <HeroLive stats={stats} mentors={topMentors} />
        </div>
      </section>

      {/* ---------------- journey ---------------- */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="The mentorship journey"
            title="Simple structure. Consistent guidance."
            text="Everything is organized around a clear semester journey, so mentors can focus on guiding and students can focus on growing."
          />
        </Reveal>

        <div className="relative grid gap-6 md:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-14 hidden h-px bg-gradient-to-r from-transparent via-brand-green/30 to-transparent md:block" />
          {STEPS.map((step, index) => (
            <Reveal key={step.title} delay={index * 120}>
              <div className="group relative h-full rounded-2xl border border-gray-100 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-mint font-display text-xl text-brand-green transition-colors group-hover:bg-brand-green group-hover:text-white">
                  {index + 1}
                </span>
                <h3 className="mt-5 mb-3 font-display text-xl text-brand-navy">{step.title}</h3>
                <p className="text-sm leading-6 text-gray-500">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- features ---------------- */}
      <section className="border-y border-gray-100 bg-gray-50/70">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <Reveal>
            <SectionHeading
              eyebrow="What you get"
              title="Everything a mentorship program needs"
              text="Built around how mentoring actually works at the department, not around a generic template."
            />
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <Reveal key={feature.title} delay={(index % 3) * 100}>
                <div className="group h-full rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-green/30 hover:shadow-xl">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-mint text-brand-green transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-green group-hover:text-white">
                    <feature.icon size={21} />
                  </span>
                  <h3 className="mt-5 mb-2 font-semibold text-brand-navy">{feature.title}</h3>
                  <p className="text-sm leading-6 text-gray-500">{feature.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- roles ---------------- */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Made for every role"
            title="One platform, three experiences"
            text="Pick a role to see what MentraLink does for you."
          />
        </Reveal>
        <Reveal>
          <RoleTabs />
        </Reveal>
      </section>

      {/* ---------------- top mentors ---------------- */}
      {(topMentors === null || topMentors.length > 0) && (
        <section id="mentors" className="scroll-mt-24 border-y border-gray-100 bg-gray-50/70">
          <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
            <Reveal>
              <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <p className="mb-2 text-sm font-semibold text-brand-green">Our mentors</p>
                  <h2 className="font-display text-3xl text-brand-navy sm:text-4xl">Meet the people who guide you</h2>
                </div>
                <p className="max-w-sm text-sm text-gray-500">
                  Ratings come only from real student evaluations. Mentors nobody has evaluated yet are shown as new.
                </p>
              </div>
            </Reveal>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {topMentors === null
                ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-60" />)
                : topMentors.map((mentor, index) => (
                    <Reveal key={mentor.mentorId} delay={(index % 3) * 100}>
                      <MentorCard mentor={mentor} tone={AVATAR_TONES[index % AVATAR_TONES.length]} />
                    </Reveal>
                  ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- trust ---------------- */}
      <section className="relative overflow-hidden bg-brand-navy">
        <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-brand-blue/20 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-brand-green/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <Reveal>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="mb-2 text-sm font-semibold text-brand-mint/80">Privacy and security</p>
              <h2 className="font-display text-3xl text-white sm:text-4xl">Your data, handled with care</h2>
              <p className="mt-4 leading-7 text-white/60">
                A mentorship program only works when students trust it. MentraLink is built to protect that trust.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map((item, index) => (
              <Reveal key={item.title} delay={index * 100}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-colors duration-300 hover:bg-white/10">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-brand-mint">
                    <item.icon size={21} />
                  </span>
                  <h3 className="mt-5 mb-2 font-semibold text-white">{item.title}</h3>
                  <p className="text-sm leading-6 text-white/60">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <TeamGrid />

      {/* ---------------- blog ---------------- */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <Reveal>
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-sm font-semibold text-brand-green">Latest from MentraLink</p>
              <h2 className="font-display text-3xl text-brand-navy sm:text-4xl">From the blog</h2>
            </div>
            <Link
              to="/blogs"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-navy transition-colors hover:text-brand-green"
            >
              View all <ArrowRight size={15} />
            </Link>
          </div>
        </Reveal>

        {blogs === null ? (
          <div className="grid gap-6 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <Skeleton className="mb-4 h-44" />
                <Skeleton className="mb-2 h-4 w-20" />
                <Skeleton className="h-6 w-4/5" />
              </div>
            ))}
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-3">
            {blogs.map((blog, index) => (
              <Reveal key={blog._id} delay={index * 100}>
                <Link to={`/blogs/${blog._id}`} className="group block">
                  {blog.coverImage ? (
                    <div className="mb-4 overflow-hidden rounded-2xl">
                      <img
                        src={blog.coverImage}
                        alt=""
                        loading="lazy"
                        className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="mb-4 flex h-44 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-mint to-white text-brand-green/40">
                      <Sparkles size={32} />
                    </div>
                  )}
                  <p className="mb-2 text-xs font-medium text-brand-green">{blog.category}</p>
                  <p className="font-display text-xl text-brand-navy transition-colors group-hover:text-brand-green">
                    {blog.title}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">{previewText(blog.content)}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-gray-200 py-12 text-center text-gray-500">
            No blog posts available yet. Check back soon.
          </p>
        )}
      </section>

      {/* ---------------- faq ---------------- */}
      <section className="border-y border-gray-100 bg-brand-mint/40">
        <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
          <Reveal>
            <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
          </Reveal>

          <div className="space-y-3">
            {FAQS.map(([question, answer], index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={question}
                  className={`overflow-hidden rounded-2xl border bg-white transition-shadow duration-300 ${
                    isOpen ? "border-brand-green/30 shadow-md" : "border-gray-100"
                  }`}
                >
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${index}`}
                      id={`faq-button-${index}`}
                      className="flex w-full items-center justify-between gap-5 px-6 py-5 text-left font-medium text-brand-navy"
                    >
                      <span>{question}</span>
                      <ChevronDown
                        size={19}
                        className={`shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-180 text-brand-green" : "text-gray-400"
                        }`}
                      />
                    </button>
                  </h3>
                  <div
                    id={`faq-panel-${index}`}
                    role="region"
                    aria-labelledby={`faq-button-${index}`}
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-5 text-sm leading-7 text-gray-500">{answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- final call to action ---------------- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-navy via-[#14275a] to-brand-navy">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-green/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 text-center sm:py-24">
          <Reveal>
            <p className="mb-3 text-sm font-medium text-brand-mint/70">Ready to take the next step?</p>
            <h2 className="mb-5 font-display text-3xl text-white sm:text-5xl">Start your mentorship journey.</h2>
            <p className="mx-auto mb-9 max-w-xl text-white/60">
              Join MentraLink as a student or mentor and make every session count.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to={primaryCta.to}
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-medium text-brand-navy transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                {user ? primaryCta.label : "Create your account"} <ArrowRight size={17} />
              </Link>
              {!user && (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10"
                >
                  I already have an account
                </Link>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default Home;
