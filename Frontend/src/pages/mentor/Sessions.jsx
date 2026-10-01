import { useEffect, useMemo, useState } from "react";
import {
  getMyMentorSessions,
  createSession,
  updateSession,
  updateSessionStatus,
} from "../../services/sessionService";
import { getGroups } from "../../services/groupService";
import { getMyMentorSessionTemplates } from "../../services/sessionTemplateService";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { CalendarClock, ClipboardList } from "lucide-react";

const emptyForm = {
  group: "",
  template: "",
  date: "",
  time: "",
  location: "",
  meetingLink: "",
};

const STATUS_TONE = {
  UPCOMING: "info",
  ONGOING: "warning",
  COMPLETED: "success",
  CANCELLED: "danger",
};

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    return Promise.all([
      getMyMentorSessions(),
      getGroups(),
      getMyMentorSessionTemplates(),
    ])
      .then(([s, g, t]) => {
        setSessions([...s].sort((a, b) => {
          const sessionNumberDiff = (a.sessionNumber || 0) - (b.sessionNumber || 0);
          if (sessionNumberDiff !== 0) return sessionNumberDiff;
          return new Date(a.date) - new Date(b.date);
        }));
        setGroups(g);
        setTemplates(t);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const selectedGroup = useMemo(
    () => groups.find((group) => group._id === form.group),
    [groups, form.group]
  );

  const availableTemplates = useMemo(() => {
    if (!selectedGroup) return [];

    const semesterId = selectedGroup.semester?._id || selectedGroup.semester;
    const scheduledTemplateIds = new Set(
      sessions
        .filter((session) => (session.group?._id || session.group) === selectedGroup._id)
        .map((session) => session.template?._id || session.template)
        .filter(Boolean)
    );

    return templates.filter(
      (template) =>
        (template.semester?._id || template.semester) === semesterId &&
        !scheduledTemplateIds.has(template._id)
    );
  }, [groups, form.group, sessions, templates, selectedGroup]);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template._id === form.template),
    [templates, form.template]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));

    if (name === "group") {
      setForm((current) => ({ ...current, group: value, template: "" }));
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEdit = (session) => {
    setEditingId(session._id);
    setForm({
      group: session.group?._id || session.group || "",
      template: session.template?._id || session.template || "",
      date: session.date?.slice(0, 10) || "",
      time: session.time || "",
      location: session.location || "",
      meetingLink: session.meetingLink || "",
    });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const group = groups.find((item) => item._id === form.group);
    const template = templates.find((item) => item._id === form.template);

    if (!group) {
      setError("Please select a valid section");
      return;
    }

    if (!template) {
      setError("Please select a session from the admin's session plan");
      return;
    }

    const payload = {
      group: form.group,
      template: form.template,
      date: form.date,
      time: form.time,
      location: form.location,
      meetingLink: form.meetingLink,
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
    setError("");
    try {
      await updateSessionStatus(id, status);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update session status");
    }
  };

  if (loading) return <p>Loading sessions...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-semibold">My Sessions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Schedule sessions from the session plans prepared by the admin.
          </p>
        </div>
        <button
          onClick={() => (showForm ? setShowForm(false) : openCreate())}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ Schedule Session"}
        </button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div>
              <label className="block text-sm font-medium mb-1">Section</label>
              <select
                required
                name="group"
                value={form.group}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select section</option>
                {groups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name} — {group.semester?.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Session</label>
              <select
                required
                name="template"
                value={form.template}
                onChange={handleChange}
                disabled={!form.group || editingId}
                className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100"
              >
                <option value="">
                  {form.group ? "Select an admin-created session" : "Select a section first"}
                </option>
                {availableTemplates.map((template) => (
                  <option key={template._id} value={template._id}>
                    Session {template.sessionNumber} — {template.title}
                  </option>
                ))}
                {editingId && selectedTemplate && (
                  <option value={selectedTemplate._id}>
                    Session {selectedTemplate.sessionNumber} — {selectedTemplate.title}
                  </option>
                )}
              </select>
              {!editingId && form.group && availableTemplates.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  No unscheduled session plan is available for this section.
                </p>
              )}
            </div>

            {selectedTemplate && (
              <div className="rounded-lg bg-gray-50 border p-4">
                <div className="flex items-start gap-3">
                  <ClipboardList size={20} className="text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-brand-navy">
                      Session {selectedTemplate.sessionNumber}: {selectedTemplate.title}
                    </p>
                    {selectedTemplate.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedTemplate.description}
                      </p>
                    )}
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        Feedback questions set by admin
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                        {selectedTemplate.questions?.map((question) => (
                          <li key={question._id}>{question.question}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  required
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Time</label>
                <input
                  required
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
            </div>

            <input
              placeholder="Location (optional)"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            />
            <input
              placeholder="Meeting link (optional)"
              name="meetingLink"
              value={form.meetingLink}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            />

            <button
              type="submit"
              disabled={!form.group || !form.template || !form.date || !form.time}
              className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {editingId ? "Update Schedule" : "Schedule Session"}
            </button>
          </form>
        </Card>
      )}

      {sessions.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No sessions scheduled"
          description="Choose an admin-created session plan and schedule it for one of your sections."
        />
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <Card key={session._id}>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="font-medium text-brand-navy">
                    Session {session.sessionNumber} — {session.title}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {session.group?.name} — {session.semester?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(session.date).toLocaleDateString()} {session.time}
                  </p>
                  {session.description && (
                    <p className="text-sm text-gray-600 mt-2">{session.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge tone={STATUS_TONE[session.status] || "neutral"}>
                    {session.status}
                  </Badge>
                  {session.status === "UPCOMING" && (
                    <>
                      <button
                        onClick={() => handleStatusChange(session._id, "ONGOING")}
                        className="text-xs font-medium text-amber-600 hover:text-amber-700"
                      >
                        Start
                      </button>
                      <button
                        onClick={() => handleStatusChange(session._id, "CANCELLED")}
                        className="text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {session.status === "ONGOING" && (
                    <>
                      <button
                        onClick={() => handleStatusChange(session._id, "COMPLETED")}
                        className="text-xs font-medium text-green-600 hover:text-green-700"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleStatusChange(session._id, "CANCELLED")}
                        className="text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => openEdit(session)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sessions;
