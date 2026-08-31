import { useEffect, useState } from "react";
import { getSessions, createSession } from "../../services/sessionService";

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", studentId: "" });
  const [error, setError] = useState("");

  const load = () => getSessions().then(setSessions).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createSession(form);
      setShowForm(false);
      setForm({ title: "", date: "", studentId: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create session");
    }
  };

  if (loading) return <p>Loading sessions...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">My Sessions</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
          {showForm ? "Cancel" : "+ New Session"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-4 rounded-lg shadow mb-4 space-y-3">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border rounded-md px-3 py-2" />
          <input required type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full border rounded-md px-3 py-2" />
          <input required placeholder="Student ID" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} className="w-full border rounded-md px-3 py-2" />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">Create</button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow divide-y">
        {sessions.map((s) => (
          <div key={s._id} className="p-4 flex justify-between">
            <div>
              <p className="font-medium">{s.title}</p>
              <p className="text-sm text-gray-500">{new Date(s.date).toLocaleString()} — {s.studentName}</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 h-fit">{s.status}</span>
          </div>
        ))}
        {sessions.length === 0 && <p className="p-4 text-gray-500">No sessions yet.</p>}
      </div>
    </div>
  );
};

export default Sessions;