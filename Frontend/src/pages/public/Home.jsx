import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicStats } from "../../services/publicService";
import { getBlogs } from "../../services/blogService";
import { previewText } from "../../utils/blogPreview";

const Home = () => {
  const [stats, setStats] = useState(null);
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    getPublicStats().then(setStats).catch(() => {});
    getBlogs().then((b) => setBlogs(b.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl leading-tight text-brand-navy mb-6">
            Mentorship, actually structured.
          </h1>
          <p className="text-gray-600 text-lg mb-8 max-w-md">
            MentraLink pairs students with mentors for scheduled sessions, tracked attendance,
            and evaluations that mean something — not just a chat thread that fizzles out.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/register"
              className="bg-brand-gradient text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition"
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
        </div>

        {/* Session card mockup */}
        <div className="relative flex justify-center">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 w-72 rotate-3 hover:rotate-0 transition duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs text-gray-400">Session #12</p>
                <p className="font-medium text-brand-navy">Career Roadmap Review</p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">COMPLETED</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">with Dr. Ayesha Rahman · Oct 14</p>
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="text-brand-gold text-lg">★</span>
              ))}
            </div>
            <p className="text-xs text-gray-500 italic border-l-2 border-gray-100 pl-3">
              "Clear, honest feedback — exactly what I needed before my interview."
            </p>
          </div>
          <div className="absolute -bottom-6 -left-6 bg-brand-navy text-white rounded-xl shadow-lg px-5 py-3 -rotate-6">
            <p className="text-2xl font-display">4.8</p>
            <p className="text-[10px] text-white/70">Avg. mentor rating</p>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-brand-navy">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-3 gap-6 text-center text-white">
          <div>
            <p className="font-display text-3xl sm:text-4xl">{stats?.totalMentors ?? "—"}</p>
            <p className="text-xs sm:text-sm text-white/60 mt-1">Mentors</p>
          </div>
          <div>
            <p className="font-display text-3xl sm:text-4xl">{stats?.totalStudents ?? "—"}</p>
            <p className="text-xs sm:text-sm text-white/60 mt-1">Students</p>
          </div>
          <div>
            <p className="font-display text-3xl sm:text-4xl">{stats?.totalSessionsCompleted ?? "—"}</p>
            <p className="text-xs sm:text-sm text-white/60 mt-1">Sessions completed</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-display text-3xl text-brand-navy mb-10 text-center">How mentorship works here</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { n: "01", title: "Get approved", desc: "Register and verify your identity — an admin reviews every account before it goes live." },
            { n: "02", title: "Get matched", desc: "Join a mentorship group and get paired with a mentor for the semester." },
            { n: "03", title: "Grow through sessions", desc: "Attend scheduled sessions, give feedback, and track progress through real evaluations." },
          ].map((step) => (
            <div key={step.n}>
              <p className="font-display text-4xl text-brand-blue/30 mb-2">{step.n}</p>
              <p className="font-medium text-brand-navy mb-2">{step.title}</p>
              <p className="text-sm text-gray-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* From the blog */}
      {blogs.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex justify-between items-end mb-8">
            <h2 className="font-display text-3xl text-brand-navy">From the blog</h2>
            <Link to="/blogs" className="text-sm text-brand-blue font-medium hover:underline">View all</Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {blogs.map((b) => (
              <Link key={b._id} to={`/blogs/${b._id}`} className="group">
                {b.coverImage && (
                  <img src={b.coverImage} alt="" className="w-full h-40 object-cover rounded-xl mb-3" />
                )}
                <p className="text-xs text-brand-blue mb-1">{b.category}</p>
                <p className="font-medium text-brand-navy group-hover:underline">{b.title}</p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{previewText(b.content)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h2 className="font-display text-3xl text-brand-navy mb-4">Ready to start?</h2>
          <p className="text-gray-500 mb-8">Join as a student looking for guidance, or a mentor ready to give back.</p>
          <Link
            to="/register"
            className="bg-brand-gradient text-white px-8 py-3 rounded-full font-medium hover:opacity-90 transition inline-block"
          >
            Create your account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;