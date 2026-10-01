import { Link } from "react-router-dom";
import facultyImage from "../../assets/golamSadmaniFakir.jpg";

const About = () => {
  return (
    <div className="bg-white">
      <section className="bg-brand-mint/50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-16 sm:py-20">
          <p className="text-sm font-semibold tracking-wide text-brand-green uppercase mb-3">
            About MentraLink
          </p>
          <h1 className="font-display text-4xl sm:text-5xl leading-tight text-brand-navy max-w-3xl">
            A structured way to make mentorship part of the student journey.
          </h1>
          <p className="mt-5 text-gray-600 text-lg max-w-2xl leading-8">
            MentraLink was introduced to create a more organized connection between
            Software Engineering students and their mentors at Green University of Bangladesh.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-20">
        <div className="grid md:grid-cols-[280px_1fr] gap-10 items-center">
          <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-lg bg-white">
            <img
              src={facultyImage}
              alt="Prof. Dr. Md. Golam Samdani Fakir"
              className="w-full aspect-[4/5] object-cover"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-brand-green mb-2">The initiative</p>
            <h2 className="font-display text-3xl text-brand-navy">
              Prof. Dr. Md. Golam Samdani Fakir
            </h2>
            <p className="mt-2 text-brand-green font-medium">
              Former Vice Chancellor, Green University of Bangladesh
            </p>
            <p className="mt-6 text-gray-600 leading-8">
              The mentorship initiative was introduced to give students a stronger support
              system throughout their academic journey. Mentorship can help students better
              understand academic expectations, make informed decisions, build confidence,
              learn from experience, and stay connected with people who can guide them beyond
              the classroom.
            </p>
            <p className="mt-4 text-gray-600 leading-8">
              MentraLink turns that idea into a structured process through scheduled mentorship
              sessions, attendance, feedback, evaluations, and continuous communication between
              students and mentors.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="max-w-2xl mb-10">
            <p className="text-sm font-semibold text-brand-green mb-2">Why mentorship matters</p>
            <h2 className="font-display text-3xl text-brand-navy">Guidance that goes beyond a classroom</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              ["Direction", "Students can discuss academic goals, challenges, and decisions with someone who has experience."],
              ["Confidence", "Regular guidance can help students become more comfortable asking questions and seeking support."],
              ["Experience", "Mentors can share practical lessons, perspectives, and experiences that complement coursework."],
              ["Connection", "A consistent mentorship relationship can strengthen the connection between students, seniors, and the department."],
            ].map(([title, text]) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 p-6 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <h3 className="font-display text-xl text-brand-navy mb-3">{title}</h3>
                <p className="text-sm text-gray-500 leading-6">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="font-display text-3xl text-brand-navy mb-4">Built to make mentorship easier to follow</h2>
        <p className="text-gray-600 leading-7 mb-8">
          From the first session to the final evaluation, MentraLink gives mentors and students
          a clear place to manage the mentorship journey.
        </p>
        <Link
          to="/register"
          className="inline-flex bg-brand-navy text-white px-7 py-3 rounded-full font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
        >
          Join MentraLink
        </Link>
      </section>
    </div>
  );
};

export default About;
