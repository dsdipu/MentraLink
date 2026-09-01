// Frontend/src/pages/EvaluationPage.jsx
import { useState } from "react";
import axios from "axios";
import EvaluationForm from "../components/EvaluationForm";

function EvaluationPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = localStorage.getItem("token");
  const mentorId = ""; // TODO: mentor select theke boshao
  const semesterId = ""; // TODO: current semester theke boshao

  const handleEvaluationSubmit = async (data) => {
    setError("");
    setSuccess("");
    try {
      // TODO: backend endpoint confirm hole URL/field bodlao
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/evaluations`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Evaluation submitted!");
    } catch (err) {
      setError(err.response?.data?.message || "Evaluation submit failed");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Evaluate Mentor</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-600 mb-2">{success}</p>}
      <EvaluationForm mentorId={mentorId} semesterId={semesterId} onSubmit={handleEvaluationSubmit} />
    </div>
  );
}

export default EvaluationPage;