import { useEffect, useState } from "react";
import { getMyMentor, getMyEvaluations, submitEvaluation } from "../../services/evaluationService";



const Evaluation = () => {
  const [mentor, setMentor] = useState(null);
  const [history, setHistory] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    Promise.all([getMyMentor(), getMyEvaluations()])
  .then(([mentorData, evalHistory]) => {
    setMentor(mentorData);
    setHistory(evalHistory);
  })
  .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const alreadyEvaluatedThisSemester = history.some(
    (e) => e.semesterId === mentor?.currentSemesterId
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await submitEvaluation(mentor._id, { rating, comment });
      setMessage("Evaluation submitted");
      loadData();
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "You may have already evaluated this mentor for the current semester"
      );
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-4">Mentor Evaluation</h1>

      {message && <p className="text-sm mb-4 text-blue-600">{message}</p>}

      {!mentor ? (
        <p className="text-gray-500">No mentor assigned yet.</p>
      ) : alreadyEvaluatedThisSemester ? (
        <p className="text-gray-500">
          You've already submitted an evaluation for {mentor.name} this semester.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <p className="text-sm text-gray-600">
            Evaluating: <span className="font-medium">{mentor.name}</span>
          </p>

          <div>
            <label className="block text-sm mb-1">Rating (1-5)</label>
            <input
              type="number"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Comments</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Submit Evaluation
          </button>
        </form>
      )}
    </div>
  );
};

export default Evaluation;