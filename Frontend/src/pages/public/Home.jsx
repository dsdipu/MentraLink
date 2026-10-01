import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicStats, getTopMentors } from "../../services/publicService";
import { getBlogs } from "../../services/blogService";
import { previewText } from "../../utils/blogPreview";
import TeamGrid from "../../components/TeamGrid";
import { ArrowRight, CheckCircle2, ChevronDown, Star } from "lucide-react";

const AVATAR_TONES = ["bg-brand-navy", "bg-brand-green", "bg-brand-blue", "bg-brand-purple"];

const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");

const MentorCard = ({ mentor, tone }) => (
  <div className="group bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className={`w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 shadow-md flex items-center justify-center text-white font-display text-xl ${tone}`}>
      {mentor.profileImage ? (
        <img src={mentor.profileImage} alt={mentor.name} className="w-full h-full object-cover" />
      ) : initials(mentor.name)}
    </div>
    <p className="font-semibold text-brand-navy">{mentor.name}</p>
    <p className="text-sm text-brand-green mb-3">{mentor.department}</p>
    <div className="flex items-center justify-center gap-0.5 mb-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={15} className={n <= Math.round(mentor.overallRating) ? "text-brand-gold" : "text-gray-200"} fill={n <= Math.round(mentor.overallRating) ? "currentColor" : "none"} />
      ))}
    </div>
    <p className="text-xs text-gray-400">{mentor.overallRating.toFixed(1)} out of 5 · {mentor.totalFeedbacks > 0 ? `${mentor.totalFeedbacks} feedback${mentor.totalFeedbacks !== 1 ? "s" : ""}` : "No feedback yet"}</p>
    <p className="text-xs text-brand-green mt-2 font-medium">Mentored {mentor.totalSemesters || 0} {mentor.totalSemesters === 1 ? "semester" : "semesters"}</p>
  </div>
);

const faqs = [
  ["What is MentraLink?", "MentraLink is a mentorship management platform for Green University's Software Engineering students and mentors. It organizes mentorship sessions, attendance, feedback, and evaluations in one place."],
  ["Who can use MentraLink?", "Students and mentors can use the platform through their respective accounts, while administrators manage semesters, sections, mentors, students, sessions, and other mentorship activities."],
  ["How does the mentorship program work?", "Mentors guide students through a structured series of sessions during the semester. Sessions are scheduled, attendance is tracked, and students can provide feedback after completed sessions."],
  ["How many sessions are there?", "Each mentorship semester is organized around 12 planned sessions. Administrators define the session topics and feedback questions, while mentors schedule the sessions for their sections."],
  ["Why is student feedback collected?", "Feedback helps students share how useful and clear a session was. It also gives the mentorship program useful information for improving future sessions."],
];

const Home = () => {
  const [stats, setStats] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [topMentors, setTopMentors] = useState([]);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    getPublicStats().then(setStats).catch(() => {});
    getBlogs().then((b) => setBlogs(b.slice(0, 3))).catch(() => {});
    getTopMentors(6).then(setTopMentors).catch(() => {});
  }, []);

  const statItems = [
    { label: "Mentors", value: stats?.totalMentors },
    { label: "Students", value: stats?.totalStudents },
    { label: "Sessions completed", value: stats?.totalSessionsCompleted },
  ];

  return (
    <div className="overflow-hidden">
      <section className="relative bg-brand-mint/50 border-b border-gray-100">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-brand-green/10 blur-3xl" />
        <div className="absolute bottom-0 -left-24 w-64 h-64 rounded-full bg-brand-blue/10 blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-6 py-20 sm:py-24 lg:py-28 grid lg:grid-cols-[1.1fr_.9fr] gap-12 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green mb-5">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
              Software Engineering · Green University of Bangladesh
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-brand-navy max-w-3xl">
              Mentorship that helps students <span className="text-brand-green">move forward.</span>
            </h1>
            <p className="text-gray-600 text-lg leading-8 mt-6 max-w-2xl">
              MentraLink brings students and mentors together through a structured semester journey of scheduled sessions, attendance, feedback, and evaluation.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/register" className="inline-flex items-center gap-2 bg-brand-navy text-white px-6 py-3.5 rounded-full font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
                Get Started <ArrowRight size={17} />
              </Link>
              <Link to="/about" className="inline-flex items-center gap-2 bg-white text-brand-navy px-6 py-3.5 rounded-full font-medium border border-gray-200 hover:border-brand-green hover:text-brand-green hover:-translate-y-0.5 transition-all duration-300">
                Learn about MentraLink
              </Link>
            </div>
          </div>

          <div className="relative max-w-md w-full mx-auto lg:ml-auto">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-7 rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-between mb-7">
                <div>
                  <p className="text-xs text-gray-400">A semester of guidance</p>
                  <p className="font-display text-xl text-brand-navy mt-1">12 structured sessions</p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-brand-mint flex items-center justify-center text-brand-green">
                  <CheckCircle2 size={23} />
                </div>
              </div>
              <div className="space-y-3">
                {["Getting started & mentorship overview", "Academic guidance & student growth", "Career, skills & professional development"].map((item, index) => (
                  <div key={item} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <span className="w-7 h-7 rounded-full bg-brand-green text-white text-xs font-semibold flex items-center justify-center">{String(index + 1).padStart(2, "0")}</span>
                    <span className="text-sm text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-5 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                <span>Attendance</span><span>Feedback</span><span>Evaluation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-3 bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          {statItems.map((s, i) => (
            <div key={s.label} className={`text-center py-6 px-3 ${i > 0 ? "border-l border-gray-100" : ""}`}>
              <p className="font-display text-2xl sm:text-3xl text-brand-navy">{s.value ?? "—"}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-sm font-semibold text-brand-green mb-2">The mentorship journey</p>
          <h2 className="font-display text-3xl sm:text-4xl text-brand-navy">Simple structure. Consistent guidance.</h2>
          <p className="text-gray-500 mt-4 leading-7">Everything is organized around a clear semester journey so mentors can focus on guiding and students can focus on growing.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {["Get connected", "Meet regularly", "Reflect and grow"].map((title, index) => (
            <div key={title} className="group rounded-2xl border border-gray-100 p-7 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <p className="font-display text-5xl text-brand-green/25 group-hover:text-brand-green/50 transition-colors">0{index + 1}</p>
              <h3 className="font-display text-xl text-brand-navy mt-5 mb-3">{title}</h3>
              <p className="text-sm text-gray-500 leading-6">{[
                "Students are connected with a mentor and placed into a structured mentorship section.",
                "Mentors schedule the planned sessions and guide students through academic and professional topics.",
                "Students share feedback while mentors and administrators use evaluations to understand progress.",
              ][index]}</p>
            </div>
          ))}
        </div>
      </section>

      {topMentors.length > 0 && (
        <section className="bg-gray-50 border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-20 sm:py-24">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
              <div>
                <p className="text-sm font-semibold text-brand-green mb-2">Our mentors</p>
                <h2 className="font-display text-3xl sm:text-4xl text-brand-navy">Mentors students appreciate</h2>
              </div>
              <p className="text-sm text-gray-500 max-w-sm">Ratings come from student feedback collected through the mentorship program.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topMentors.map((m, i) => <MentorCard key={m.mentorId} mentor={m} tone={AVATAR_TONES[i % AVATAR_TONES.length]} />)}
            </div>
          </div>
        </section>
      )}

      <TeamGrid />

      <section className="max-w-6xl mx-auto px-6 py-20 sm:py-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
          <div>
            <p className="text-sm font-semibold text-brand-green mb-2">Latest from MentraLink</p>
            <h2 className="font-display text-3xl sm:text-4xl text-brand-navy">From the blog</h2>
          </div>
          <Link to="/blogs" className="inline-flex items-center gap-1 text-sm font-medium text-brand-navy hover:text-brand-green transition-colors">View all <ArrowRight size={15} /></Link>
        </div>
        {blogs.length > 0 ? (
          <div className="grid sm:grid-cols-3 gap-6">
            {blogs.map((b) => (
              <Link key={b._id} to={`/blogs/${b._id}`} className="group">
                {b.coverImage && <img src={b.coverImage} alt="" className="w-full h-44 object-cover rounded-2xl mb-4 group-hover:scale-[1.02] transition-transform duration-300" />}
                <p className="text-xs font-medium text-brand-green mb-2">{b.category}</p>
                <p className="font-display text-xl text-brand-navy group-hover:text-brand-green transition-colors">{b.title}</p>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-6">{previewText(b.content)}</p>
              </Link>
            ))}
          </div>
        ) : <p className="text-gray-500">No blog posts available yet.</p>}
      </section>

      <section className="bg-brand-mint/50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-brand-green mb-2">FAQ</p>
            <h2 className="font-display text-3xl sm:text-4xl text-brand-navy">Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map(([question, answer], index) => {
              const isOpen = openFaq === index;
              return (
                <div key={question} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <button type="button" onClick={() => setOpenFaq(isOpen ? -1 : index)} className="w-full flex items-center justify-between gap-5 text-left px-6 py-5 font-medium text-brand-navy">
                    <span>{question}</span>
                    <ChevronDown size={19} className={`shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-brand-green" : "text-gray-400"}`} />
                  </button>
                  {isOpen && <div className="px-6 pb-5 text-sm text-gray-500 leading-7">{answer}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-brand-navy">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <p className="text-brand-mint/70 text-sm font-medium mb-3">Ready to take the next step?</p>
          <h2 className="font-display text-3xl sm:text-4xl text-white mb-5">Start your mentorship journey.</h2>
          <p className="text-white/60 max-w-xl mx-auto mb-8">Join MentraLink as a student or mentor and make every session count.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-brand-navy px-7 py-3.5 rounded-full font-medium hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">Create your account <ArrowRight size={17} /></Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
