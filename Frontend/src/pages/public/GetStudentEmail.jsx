import { useState } from "react";
import { Link } from "react-router-dom";
import { submitEmailRequest } from "../../services/emailRequestService";

const GetStudentEmail = () => {
  const [form, setForm] = useState({
    name: "",
    personalEmail: "",
    phone: "",
    admissionInfo: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await submitEmailRequest(form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit your request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <p className="text-xs text-brand-green mb-2">Help</p>
      <h1 className="font-display text-3xl text-brand-navy mb-6">
        Getting your Green University student email
      </h1>

      <div className="prose-sm text-gray-600 space-y-4 mb-12">
        <p>
          MentraLink requires your official <span className="font-medium">@student.green.ac.bd</span>{" "}
          email to register, since that&apos;s how we verify you&apos;re actually part of the
          Software Engineering department.
        </p>
        <p>
          If you&apos;ve been admitted but haven&apos;t received your student email yet, it&apos;s
          usually issued by the university IT cell shortly after admission is confirmed. If you're
          not sure how to get yours, or it hasn't arrived, fill out the form below and we'll help
          you sort it out or point you in the right direction.
        </p>
      </div>

      {submitted ? (
        <div className="bg-brand-mint rounded-xl p-6 text-center">
          <p className="text-brand-navy font-medium mb-1">Request received</p>
          <p className="text-sm text-gray-600 mb-4">
            We'll get back to you at the email you provided. You can close this page.
          </p>
          <Link to="/register" className="text-sm text-brand-navy underline">
            Back to registration
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <label className="block text-sm mb-1">Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">A personal email we can reach you at</label>
            <input
              type="email"
              name="personalEmail"
              value={form.personalEmail}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Phone / WhatsApp (optional)</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Admission number / batch (if known)</label>
            <input
              name="admissionInfo"
              value={form.admissionInfo}
              onChange={handleChange}
              placeholder="e.g. Spring 2026, or your admission number"
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Anything else we should know (optional)</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={3}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-green text-white py-2 rounded-md hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      )}
    </div>
  );
};

export default GetStudentEmail;