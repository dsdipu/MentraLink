import { useEffect, useState } from "react";
import {
  getGroups,
  createGroup,
  updateGroup,
  assignMentor,
  assignStudents,
  deleteGroup,
} from "../services/groupService";
import { getAllMentors } from "../services/mentorService";
import { getAllStudents } from "../services/studentService";
import { getSemesters } from "../services/semesterService";

const Mentors = () => {
  const [groups, setGroups] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // create-group form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", semester: "" });

  // per-group assignment UI state
  const [mentorPick, setMentorPick] = useState({});   // { [groupId]: mentorId }
  const [studentPick, setStudentPick] = useState({}); // { [groupId]: studentId }
  const [semesterPick, setSemesterPick] = useState({}); // { [groupId]: semesterId }


  const loadAll = () => {
    setLoading(true);
    return Promise.all([getGroups(), getAllMentors(), getAllStudents(), getSemesters()])
      .then(([g, m, s, sem]) => {
        setGroups(g);
        setMentors(m);
        setStudents(s);
        setSemesters(sem);
      })
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAll(); }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createGroup(form);
      setForm({ name: "", semester: "" });
      setShowForm(false);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create group");
    }
  };

  const handleAssignMentor = async (groupId) => {
    const mentorId = mentorPick[groupId];
    if (!mentorId) return;
    try {
      await assignMentor(groupId, mentorId);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign mentor");
    }
  };

  const handleUpdateSemester = async (groupId) => {
  const semesterId = semesterPick[groupId];
  if (!semesterId) return;
  try {
    await updateGroup(groupId, { semester: semesterId });
    loadAll();
  } catch (err) {
    setError(err.response?.data?.message || "Failed to update semester");
  }
};

  const handleAddStudent = async (groupId) => {
    const studentId = studentPick[groupId];
    if (!studentId) return;
    try {
      await assignStudents(groupId, [studentId]);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign student");
    }
  };

  const handleDeleteGroup = async (id) => {
    if (!confirm("Delete this group?")) return;
    await deleteGroup(id);
    loadAll();
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Mentor Assignment</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ New Group"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {showForm && (
        <form onSubmit={handleCreateGroup} className="bg-white p-4 rounded-lg shadow mb-6 space-y-3">
          <input
            required
            placeholder="Group name (e.g. SWE-M01)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
          />
          <select
            required
            value={form.semester}
            onChange={(e) => setForm({ ...form, semester: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="">Select semester</option>
            {semesters.map((s) => (
              <option key={s._id} value={s._id}>{s.name} ({s.academicYear})</option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            Note: a mentor must be assigned separately after creating the group.
          </p>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">
            Create Group
          </button>
        </form>
      )}

      <div className="space-y-4">
        {groups.map((g) => (
          <div key={g._id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold text-lg">{g.name}</p>
                <p className="text-sm text-gray-500">
                  {g.semester?.name} ({g.semester?.academicYear}) · {g.status}
                </p>
                {!g.semester && (
                  <div className="mt-2 flex gap-2 items-center bg-red-50 border border-red-200 rounded-md p-2">
                    <span className="text-xs text-red-600">⚠ No valid semester linked to this group.</span>
                    <select
                      value={semesterPick[g._id] || ""}
                      onChange={(e) => setSemesterPick({ ...semesterPick, [g._id]: e.target.value })}
                      className="text-xs border rounded-md px-2 py-1"
                    >
                      <option value="">Select semester</option>
                      {semesters.map((s) => (
                        <option key={s._id} value={s._id}>{s.name} ({s.academicYear})</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleUpdateSemester(g._id)}
                      className="text-xs bg-gray-800 text-white px-2 py-1 rounded-md"
                    >
                      Fix
                    </button>
                  </div>
                )}
                <p className="text-sm mt-1">
                  Mentor: {g.mentor?.user?.name
                    ? <span className="font-medium">{g.mentor.user.name}</span>
                    : <span className="text-orange-600">Not assigned</span>}
                </p>
              </div>
              <button onClick={() => handleDeleteGroup(g._id)} className="text-sm text-red-600 hover:underline">
                Delete
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              <div className="flex gap-2">
                <select
                  value={mentorPick[g._id] || ""}
                  onChange={(e) => setMentorPick({ ...mentorPick, [g._id]: e.target.value })}
                  className="flex-1 border rounded-md px-2 py-1.5 text-sm"
                >
                  <option value="">Assign mentor...</option>
                  {mentors.map((m) => (
                    <option key={m._id} value={m._id}>{m.user?.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleAssignMentor(g._id)}
                  className="text-sm bg-gray-800 text-white px-3 py-1.5 rounded-md"
                >
                  Set
                </button>
              </div>

              <div className="flex gap-2">
                <select
                  value={studentPick[g._id] || ""}
                  onChange={(e) => setStudentPick({ ...studentPick, [g._id]: e.target.value })}
                  className="flex-1 border rounded-md px-2 py-1.5 text-sm"
                >
                  <option value="">Add student...</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>{s.user?.name} ({s.studentId})</option>
                  ))}
                </select>
                <button
                  onClick={() => handleAddStudent(g._id)}
                  className="text-sm bg-gray-800 text-white px-3 py-1.5 rounded-md"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Students ({g.students?.length || 0})</p>
              <div className="flex flex-wrap gap-2">
                {g.students?.map((s) => (
                  <span key={s._id} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {s.user?.name}
                  </span>
                ))}
                {(!g.students || g.students.length === 0) && (
                  <span className="text-xs text-gray-400">No students yet</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {groups.length === 0 && <p className="text-gray-500">No groups yet. Create one to get started.</p>}
      </div>
    </div>
  );
};

export default Mentors;