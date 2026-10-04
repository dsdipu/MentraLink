import { useEffect, useMemo, useState } from "react";
import {
  createSessionTemplate,
  deleteSessionTemplate,
  getSessionTemplates,
  updateSessionTemplate,
} from "../services/sessionTemplateService";
import { getSemesters } from "../services/semesterService";
import { getSessions } from "../services/sessionService";
import StatCard from "../components/ui/StatCard";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  Edit3,
  MessageSquare,
  Plus,
  Trash2,
  X,
} from "lucide-react";

const STATUS_COLORS = {
  UPCOMING: "bg-blue-100 text-blue-700",
  ONGOING: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const FILTERS = ["ALL", "UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"];

const emptyForm = {
  semester: "",
  sessionNumber: "",
  title: "",
  description: "",
  questions: [{ question: "", required: true, type: "TEXT" }],
};

const formatFilterName = (filter) => {
  if (filter === "ALL") return "All";
  return filter.charAt(0) + filter.slice(1).toLowerCase();
};

const AdminSessions = () => {
  const [tab, setTab] = useState("PLAN");
  const [templates, setTemplates] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("ALL");

  const loadTemplates = async () => {
    const data = await getSessionTemplates();
    setTemplates(data);
  };

  const loadSemesters = async () => {
    const data = await getSemesters();
    setSemesters(data);

    if (!selectedSemester && data.length > 0) {
      const preferred =
        data.find((semester) => semester.status === "ACTIVE") ||
        data.find((semester) => semester.status === "UPCOMING") ||
        data[0];
      setSelectedSemester(preferred._id);
    }
  };

  const loadSessions = async () => {
    const data = await getSessions();
    setSessions(data);
  };

  const load = async () => {
    setLoading(true);
    try {
      await Promise.all([loadTemplates(), loadSemesters(), loadSessions()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const semesterTemplates = useMemo(
    () => templates.filter((template) => template.semester?._id === selectedSemester),
    [templates, selectedSemester]
  );

  const formSemesterTemplates = useMemo(
    () => templates.filter((template) => template.semester?._id === form.semester),
    [templates, form.semester]
  );

  const usedNumbers = new Set(
    formSemesterTemplates.map((template) => template.sessionNumber)
  );

  const availableNumbers = Array.from({ length: 12 }, (_, index) => index + 1).filter(
    (number) => !usedNumbers.has(number) || number === Number(form.sessionNumber)
  );

  const completedCount = sessions.filter(
    (session) => session.status === "COMPLETED"
  ).length;

  const upcomingCount = sessions.filter(
    (session) => session.status === "UPCOMING"
  ).length;

  const filteredSessions =
    filter === "ALL"
      ? sessions
      : sessions.filter((session) => session.status === filter);

  const openCreate = () => {
    setEditingId(null);
    setError("");
    const firstAvailable = availableNumbers[0] || "";
    setForm({
      ...emptyForm,
      semester: selectedSemester,
      sessionNumber: firstAvailable,
      questions: [{ question: "", required: true, type: "TEXT" }],
    });
    setShowForm(true);
  };

  const openEdit = (template) => {
    setEditingId(template._id);
    setError("");
    setForm({
      semester: template.semester?._id || "",
      sessionNumber: template.sessionNumber,
      title: template.title || "",
      description: template.description || "",
      questions:
        template.questions?.length > 0
          ? template.questions.map((question) => ({
              _id: question._id,
              question: question.question,
              required: question.required !== false,
              type: question.type === "YESNO" ? "YESNO" : "TEXT",
            }))
          : [{ question: "", required: true, type: "TEXT" }],
    });
    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const updateQuestion = (index, field, value) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question, questionIndex) =>
        questionIndex === index
          ? { ...question, [field]: value }
          : question
      ),
    }));
  };

  const addQuestion = () => {
    setForm((current) => ({
      ...current,
      questions: [
        ...current.questions,
        { question: "", required: true, type: "TEXT" },
      ],
    }));
  };

  const removeQuestion = (index) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.filter(
        (_, questionIndex) => questionIndex !== index
      ),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.semester) {
      setError("Please select a semester.");
      return;
    }

    if (!form.title.trim()) {
      setError("Session title is required.");
      return;
    }

    if (
      form.questions.length === 0 ||
      form.questions.some((question) => !question.question.trim())
    ) {
      setError("Add at least one valid feedback question.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        semester: form.semester,
        sessionNumber: Number(form.sessionNumber),
        title: form.title.trim(),
        description: form.description.trim(),
        questions: form.questions.map((question) => ({
          _id: question._id,
          question: question.question.trim(),
          required: question.required,
          type: question.type === "YESNO" ? "YESNO" : "TEXT",
        })),
      };

      if (editingId) {
        await updateSessionTemplate(editingId, payload);
      } else {
        await createSessionTemplate(payload);
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadTemplates();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save session plan.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (template) => {
    const confirmed = window.confirm(
      `Delete Session ${template.sessionNumber} — ${template.title}?`
    );

    if (!confirmed) return;

    try {
      await deleteSessionTemplate(template._id);
      await loadTemplates();
    } catch (err) {
      window.alert(
        err.response?.data?.message || "Failed to delete session plan."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-gray-500">Loading sessions...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
            Session Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Prepare the 12 session plans and feedback questions for each semester.
          </p>
        </div>

        {tab === "PLAN" && (
          <button
            type="button"
            onClick={openCreate}
            disabled={semesterTemplates.length >= 12}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={17} />
            Add Session Plan
          </button>
        )}
      </div>

      <div className="mb-5 flex gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab("PLAN")}
          className={`border-b-2 px-3 py-2 text-sm font-medium transition ${
            tab === "PLAN"
              ? "border-brand-green text-brand-green"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          Session Plan
        </button>
        <button
          type="button"
          onClick={() => setTab("SCHEDULED")}
          className={`border-b-2 px-3 py-2 text-sm font-medium transition ${
            tab === "SCHEDULED"
              ? "border-brand-green text-brand-green"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          Scheduled Sessions
        </button>
      </div>

      {tab === "PLAN" ? (
        <>
          <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(event) => setSelectedSemester(event.target.value)}
              className="w-full max-w-md rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-green"
            >
              <option value="">Select semester</option>
              {semesters.map((semester) => (
                <option key={semester._id} value={semester._id}>
                  {semester.name} — {semester.batch || "All batches"}
                </option>
              ))}
            </select>
          </div>

          {selectedSemester && (
            <div className="mb-5 rounded-xl bg-brand-mint p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-brand-navy">
                    Session plan progress
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    Create up to 12 fixed sessions. Mentors will schedule these later.
                  </p>
                </div>
                <p className="shrink-0 font-display text-2xl text-brand-navy">
                  {semesterTemplates.length}/12
                </p>
              </div>
            </div>
          )}

          {showForm && (
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editingId ? "Edit Session Plan" : "Add Session Plan"}
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    The mentor will only schedule the date, time and meeting details later.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Close form"
                >
                  <X size={18} />
                </button>
              </div>

              {error && (
                <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Semester
                    </label>
                    <select
                      required
                      name="semester"
                      value={form.semester}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
                    >
                      <option value="">Select semester</option>
                      {semesters.map((semester) => (
                        <option key={semester._id} value={semester._id}>
                          {semester.name} — {semester.batch || "All batches"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Session number
                    </label>
                    <select
                      required
                      name="sessionNumber"
                      value={form.sessionNumber}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
                    >
                      <option value="">Select session</option>
                      {availableNumbers.map((number) => (
                        <option key={number} value={number}>
                          Session {number}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Session title
                  </label>
                  <input
                    required
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Goal Setting and Academic Planning"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="What should this session cover?"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Feedback questions
                      </label>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Students will answer these after the session.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-green hover:underline"
                    >
                      <Plus size={14} />
                      Add question
                    </button>
                  </div>

                  <div className="space-y-3">
                    {form.questions.map((question, index) => (
                      <div
                        key={question._id || index}
                        className="flex items-start gap-2 rounded-lg border border-gray-200 p-3"
                      >
                        <span className="mt-2 text-xs font-semibold text-gray-400">
                          {index + 1}.
                        </span>
                        <div className="min-w-0 flex-1 space-y-2">
                          <input
                            required
                            value={question.question}
                            onChange={(event) =>
                              updateQuestion(index, "question", event.target.value)
                            }
                            placeholder="How useful was this session?"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                          />
                          <label className="inline-flex items-center gap-2 text-xs text-gray-500">
                            <input
                              type="checkbox"
                              checked={question.required}
                              onChange={(event) =>
                                updateQuestion(index, "required", event.target.checked)
                              }
                            />
                            Required
                          </label>
                          <select
                            value={question.type || "TEXT"}
                            onChange={(event) => updateQuestion(index, "type", event.target.value)}
                            className="ml-3 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600"
                            aria-label="Answer type"
                          >
                            <option value="TEXT">Text answer</option>
                            <option value="YESNO">Yes / No (pie chart)</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          disabled={form.questions.length === 1}
                          className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label="Remove question"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : editingId ? "Update Plan" : "Save Plan"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {!selectedSemester ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center">
              <CalendarClock className="mx-auto text-gray-300" size={32} />
              <p className="mt-3 text-sm text-gray-500">
                Select a semester to manage its 12-session plan.
              </p>
            </div>
          ) : semesterTemplates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center">
              <CalendarClock className="mx-auto text-gray-300" size={32} />
              <p className="mt-3 text-sm font-medium text-gray-600">
                No session plans created yet.
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Start by adding Session 1.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {semesterTemplates.map((template) => (
                <div
                  key={template._id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-mint font-display text-lg text-brand-green">
                        {template.sessionNumber}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Session {template.sessionNumber}
                        </p>
                        <h2 className="mt-0.5 break-words font-semibold text-gray-900">
                          {template.title}
                        </h2>
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(template)}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-brand-navy"
                        aria-label="Edit session plan"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(template)}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete session plan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {template.description && (
                    <p className="mt-4 text-sm leading-6 text-gray-500">
                      {template.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                    <MessageSquare size={14} />
                    {template.questions?.length || 0} feedback question
                    {template.questions?.length === 1 ? "" : "s"}
                  </div>

                  <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                    {template.questions?.map((question, index) => (
                      <p key={question._id} className="text-xs leading-5 text-gray-600">
                        <span className="font-medium text-gray-400">{index + 1}.</span>{" "}
                        {question.question}
                        {question.required !== false && (
                          <span className="ml-1 text-red-400">*</span>
                        )}
                        {question.type === "YESNO" && (
                          <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                            Yes / No
                          </span>
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              icon={CalendarClock}
              label="Total Sessions"
              value={sessions.length}
              tone="brand"
            />
            <StatCard
              icon={CheckCircle2}
              label="Completed"
              value={completedCount}
              tone="blue"
            />
            <StatCard
              icon={Clock}
              label="Upcoming"
              value={upcomingCount}
              tone="gold"
            />
          </div>

          <div className="mb-4 min-w-0 overflow-x-auto pb-1">
            <div className="flex w-max gap-2">
              {FILTERS.map((filterOption) => (
                <button
                  key={filterOption}
                  type="button"
                  onClick={() => setFilter(filterOption)}
                  className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition ${
                    filter === filterOption
                      ? "border-brand-navy bg-brand-navy text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {formatFilterName(filterOption)}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Mentor</th>
                    <th className="p-3">Semester</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((session) => (
                    <tr key={session._id} className="border-t">
                      <td className="whitespace-nowrap p-3">
                        {session.date
                          ? new Date(session.date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="max-w-[280px] p-3">
                        <p className="truncate">
                          #{session.sessionNumber} {session.title}
                        </p>
                      </td>
                      <td className="max-w-[180px] p-3">
                        <p className="truncate">
                          {session.mentor?.user?.name || "-"}
                        </p>
                      </td>
                      <td className="max-w-[180px] p-3">
                        <p className="truncate">
                          {session.semester?.name || "-"}
                        </p>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block whitespace-nowrap rounded-full px-2 py-1 text-xs ${
                            STATUS_COLORS[session.status] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {session.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredSessions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400">
                        No scheduled sessions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminSessions;
