import { useEffect, useState } from "react";
import { getSessions, createSession, updateSession, updateSessionStatus } from "../../services/sessionService";
import { getGroups } from "../../services/groupService";

const emptyForm = {
  group: "",
  sessionNumber: "",
  title: "",
  description: "",
  date: "",
  time: "",
  location: "",
  meetingLink: "",
};

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    return Promise.all([getSessions(), getGroups()])
      .then(([s, g]) => {
        setSessions(s);
        setGroups(g);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (s) => {
    setEditingId(s._id);
    setForm({
      group: s.group?._id || s.group || "",
      sessionNumber: s.sessionNumber,
      title: s.title,
      description: s.description || "",
      date: s.date?.slice(0, 10) || "",
      time: s.time || "",
      location: s.location || "",
      meetingLink: s.meetingLink || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const selectedGroup = groups.find((g) => g._id === form.group);
    if (!selectedGroup) {
      setError("Please select a valid group");
      return;
    }

    const payload = {
      ...form,
      semester: selectedGroup.semester?._id || selectedGroup.semester,
      mentor: selectedGroup.mentor?._id || selectedGroup.mentor,
      sessionNumber: Number(form.sessionNumber),
    };

    try {
      if (editingId) {
        await updateSession(editingId, payload);
      } else {
        await createSession(payload);
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save session");
    }
  };

  const handleStatusChange = async (id, status) => {
    await updateSessionStatus(id, status);
    load();
  };

  if (loading) return <p>Loading sessions...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">My Sessions</h1>
        <button
          onClick={() => (showForm ? setShowForm(false) : openCreate())}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ New Session"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-4 space-y-3">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <select required name="group" value={form.group} onChange={handleChange} className="w-full border rounded-md px-3 py-2">
            <option value="">Select group</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id}>{g.name} — {g.semester?.name}</option>
            ))}
          </select>

          <input required type="number" min="1" placeholder="Session number" name="sessionNumber" value={form.sessionNumber} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
          <input required placeholder="Title" name="title" value={form.title} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
          <textarea placeholder="Description (optional)" name="description" value={form.description} onChange={handleChange} rows={2} className="w-full border rounded-md px-3 py-2" />

          <div className="flex gap-3">
            <input required type="date" name="date" value={form.date} onChange={handleChange} className="flex-1 border rounded-md px-3 py-2" />
            <input required type="time" name="time" value={form.time} onChange={handleChange} className="flex-1 border rounded-md px-3 py-2" />
          </div>

          <input placeholder="Location (optional)" name="location" value={form.location} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
          <input placeholder="Meeting link (optional)" name="meetingLink" value={form.meetingLink} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">
            {editingId ? "Update Session" : "Create Session"}
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow divide-y">
        {sessions.map((s) => (
          <div key={s._id} className="p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">#{s.sessionNumber} — {s.title}</p>
              <p className="text-sm text-gray-500">
                {new Date(s.date).toLocaleDateString()} {s.time} — {s.semester?.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={s.status}
                onChange={(e) => handleStatusChange(s._id, e.target.value)}
                className="text-xs border rounded-full px-2 py-1"
              >
                <option value="UPCOMING">UPCOMING</option>
                <option value="ONGOING">ONGOING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
              <button onClick={() => openEdit(s)} className="text-sm text-blue-600 hover:underline">Edit</button>
            </div>
          </div>
        ))}
        {sessions.length === 0 && <p className="p-4 text-gray-500">No sessions yet.</p>}
      </div>
    </div>
  );
};

export default Sessions;