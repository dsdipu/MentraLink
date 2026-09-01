// Frontend/src/pages/FeedbackPage.jsx
import { useState } from "react";
import axios from "axios";
import FeedbackForm from "../components/FeedbackForm";

function FeedbackPage() {
  const [sessionId] = useState(""); // TODO: session select theke value boshao
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = localStorage.getItem("token");

  const handleFeedbackSubmit = async ({ sessionId, rating, comment }) => {
    setError("");
    setSuccess("");
    try {
      // TODO: backend endpoint confirm hole URL/field name change koro
      const response = await axios.post(
        "http://localhost:5000/api/feedback",
        { sessionId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Feedback saved:", response.data);
      setSuccess("Feedback submitted!");
    } catch (err) {
      setError(err.response?.data?.message || "Feedback submit failed");
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Give Feedback</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-600 mb-2">{success}</p>}
      <FeedbackForm sessionId={sessionId} onSubmit={handleFeedbackSubmit} />
    </div>
  );
}

export default FeedbackPage;