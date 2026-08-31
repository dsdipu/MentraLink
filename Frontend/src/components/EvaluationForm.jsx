// Frontend/src/components/EvaluationForm.jsx
import { useState } from "react";
import PropTypes from "prop-types";

function EvaluationForm({ mentorId, semesterId, onSubmit }) {
  const [ratings, setRatings] = useState({
    communication: 5,
    knowledge: 5,
    punctuality: 5,
    helpfulness: 5,
  });
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setRatings((prev) => ({ ...prev, [field]: Number(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ mentorId, semesterId, ratings, comment });
      setComment("");
    } finally {
      setSubmitting(false);
    }
  };

  const fields = [
    { key: "communication", label: "Communication" },
    { key: "knowledge", label: "Subject Knowledge" },
    { key: "punctuality", label: "Punctuality" },
    { key: "helpfulness", label: "Helpfulness" },
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 space-y-4">
      <h2 className="text-lg font-semibold">Mentor Evaluation</h2>

      {fields.map((f) => (
        <div key={f.key}>
          <label className="block text-sm font-medium mb-1">{f.label}</label>
          <select
            value={ratings[f.key]}
            onChange={(e) => handleChange(f.key, e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium mb-1">Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="border border-gray-300 rounded-md px-3 py-2 w-full"
          placeholder="Additional feedback..."
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white py-2 rounded-md font-medium disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Evaluation"}
      </button>
    </form>
  );
}

EvaluationForm.propTypes = {
  mentorId: PropTypes.string.isRequired,
  semesterId: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default EvaluationForm;