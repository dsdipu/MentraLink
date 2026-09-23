import { Globe } from "lucide-react";

const TEAM = [
  {
    name: "Dipankar Sarkar",
    id: "242034037",
    role: "Backend & Frontend",
    github: "https://github.com/dsdipu",
    portfolio: "https://dsdipu.vercel.app",
    color: "bg-brand-navy",
  },
  {
    name: "Tanha Tasri",
    id: "242034040",
    role: "Frontend Lead",
    github: "https://github.com/tanha-tasri",
    color: "bg-brand-green",
  },
  {
    name: "Tuhinur Rahman",
    id: "242034039",
    role: "Frontend Developer",
    github: "https://github.com/tuhintr0",
    color: "bg-brand-blue",
  },
  {
    name: "Taimia Howlader",
    id: "242034001",
    role: "Backend Developer",
    github: "https://github.com/taimiyea",
    color: "bg-brand-purple",
  },
];

const GithubMark = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2.15c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.7 1.25 3.36.96.1-.74.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.4-5.27 5.69.42.36.78 1.07.78 2.16v3.2c0 .31.21.66.79.55A10.52 10.52 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
  </svg>
);

const TeamGrid = () => (
  <section className="max-w-6xl mx-auto px-6 py-20 border-t border-gray-100">
    <div className="text-center mb-12">
      <p className="text-sm font-medium text-brand-green mb-2">The Team</p>
      <h2 className="font-display text-3xl text-brand-navy">Faces behind MentraLink</h2>
      <p className="text-gray-500 mt-2 max-w-md mx-auto">
        Built by Software Engineering students at Green University of Bangladesh.
      </p>
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {TEAM.map((m) => (
        <div
          key={m.id}
          className="group bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <div
            className={`w-20 h-20 rounded-full ${m.color} text-white flex items-center justify-center text-2xl font-display mx-auto mb-4 shadow-md`}
          >
            {m.name.split(" ").map((n) => n[0]).join("")}
          </div>

          <p className="font-semibold text-brand-navy">{m.name}</p>
          <p className="text-sm text-brand-green mb-2">{m.role}</p>
          <p className="text-xs text-gray-400 mb-4">ID: {m.id}</p>

          <div className="flex items-center justify-center gap-3">
            <a
              href={m.github}
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-full bg-gray-50 hover:bg-brand-navy hover:text-white text-gray-500 flex items-center justify-center transition"
              aria-label={`${m.name} on GitHub`}
            >
              <GithubMark className="w-4 h-4" />
            </a>
            {m.portfolio && (
              <a
                href={m.portfolio}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-gray-50 hover:bg-brand-navy hover:text-white text-gray-500 flex items-center justify-center transition"
                aria-label={`${m.name}'s portfolio`}
              >
                <Globe size={16} />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default TeamGrid;