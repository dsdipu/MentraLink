import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicStats, getTopMentors } from "../../services/publicService";
import { getBlogs } from "../../services/blogService";
import { previewText } from "../../utils/blogPreview";
import TeamGrid from "../../components/TeamGrid";
import { Star } from "lucide-react";

const AVATAR_TONES = ["bg-brand-navy", "bg-brand-green", "bg-brand-blue", "bg-brand-purple"];

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

const MentorCard = ({ mentor, tone }) => (
  <div className="group bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
    <div className={`w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 shadow-md flex items-center justify-center text-white font-display text-xl ${tone}`}>
      {mentor.profileImage ? (
        <img src={mentor.profileImage} alt={mentor.name} className="w-full h-full object-cover" />
      ) : (
        initials(mentor.name)
      )}
    </div>

    <p className="font-semibold text-brand-navy">{mentor.name}</p>
    <p className="text-sm text-brand-green mb-3">{mentor.department}</p>

    <div className="flex items-center justify-center gap-0.5 mb-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={15}
          className={n <= Math.round(mentor.overallRating) ? "text-brand-gold" : "text-gray-200"}
          fill={n <= Math.round(mentor.overallRating) ? "currentColor" : "none"}
        />
      ))}
    </div>
    <p className="text-xs text-gray-400">
      {mentor.overallRating.toFixed(1)} out of 5
      {" · "}
      {mentor.totalFeedbacks > 0
        ? `${mentor.totalFeedbacks} feedback${mentor.totalFeedbacks !== 1 ? "s" : ""}`
        : "No feedback yet"}
    </p>

    <p className="text-xs text-brand-green mt-2 font-medium">
      Mentored {mentor.totalSemesters || 0}{" "}
      {mentor.totalSemesters === 1 ? "semester" : "semesters"}
    </p>
  </div>
);

const Home = () => {
  const [stats, setStats] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [topMentors, setTopMentors] = useState([]);

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
    <div>
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-14 text-center">
        <p className="text-sm font-medium text-brand-green mb-3">
          Software Engineering · Green University of Bangladesh
        </p>
        <h1 className="font-display text-4xl sm:text-5xl leading-tight text-brand-navy mb-6 max-w-3xl mx-auto">
          Mentorship, built for this department.
        </h1>
        <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto">
          MentraLink connects SWE students with mentors for scheduled sessions,
          tracked attendance, and evaluations that actually mean something.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <Link
            to="/register"
            className="bg-brand-green text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition"
          >
            Get Started
          </Link>
          <Link
            to="/blogs"
            className="text-brand-navy font-medium px-6 py-3 rounded-full border border-gray-200 hover:border-brand-navy transition"
          >
            Read the Blog
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {statItems.map((s) => (
            <div key={s.label} className="bg-brand-mint rounded-2xl py-5">
              <p className="font-display text-3xl text-brand-navy">{s.value ?? "—"}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-gray-100">
        <h2 className="font-display text-3xl text-brand-navy mb-10 text-center">How mentorship works here</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { n: "01", title: "Get approved", desc: "Register and verify your identity — an admin reviews every account before it goes live." },
            { n: "02", title: "Get matched", desc: "Join a mentorship group and get paired with a mentor for the semester." },
            { n: "03", title: "Grow through sessions", desc: "Attend scheduled sessions, give feedback, and track progress through real evaluations." },
          ].map((step) => (
            <div key={step.n}>
              <p className="font-display text-4xl text-brand-green/40 mb-2">{step.n}</p>
              <p className="font-medium text-brand-navy mb-2">{step.title}</p>
              <p className="text-sm text-gray-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {topMentors.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-16 border-t border-gray-100">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-brand-green mb-2">Top Rated</p>
            <h2 className="font-display text-3xl text-brand-navy">Mentors students love</h2>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              Ratings come straight from student evaluations after each session.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topMentors.map((m, i) => (
              <MentorCard key={m.mentorId} mentor={m} tone={AVATAR_TONES[i % AVATAR_TONES.length]} />
            ))}
          </div>
        </section>
      )}

      <TeamGrid />

      {blogs.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-16 border-t border-gray-100">
          <div className="flex justify-between items-end mb-8">
            <h2 className="font-display text-3xl text-brand-navy">From the blog</h2>
            <Link to="/blogs" className="text-sm text-brand-navy font-medium hover:underline">View all</Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {blogs.map((b) => (
              <Link key={b._id} to={`/blogs/${b._id}`} className="group">
                {b.coverImage && (
                  <img src={b.coverImage} alt="" className="w-full h-40 object-cover rounded-xl mb-3" />
                )}
                <p className="text-xs text-brand-green mb-1">{b.category}</p>
                <p className="font-medium text-brand-navy group-hover:underline">{b.title}</p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{previewText(b.content)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-brand-mint border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h2 className="font-display text-3xl text-brand-navy mb-4">Ready to start?</h2>
          <p className="text-gray-600 mb-8">
            Join as an SWE student looking for guidance, or a mentor ready to give back.
          </p>
          <Link
            to="/register"
            className="bg-brand-navy text-white px-8 py-3 rounded-full font-medium hover:opacity-90 transition inline-block"
          >
            Create your account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
