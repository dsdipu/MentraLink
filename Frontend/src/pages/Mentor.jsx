import { useEffect, useMemo, useState } from "react";
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

const MentorAssignment = () => {
  const [groups, setGroups] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    semester: "",
  });

  const [mentorPick, setMentorPick] = useState({});
  const [studentPick, setStudentPick] = useState({});
  const [semesterPick, setSemesterPick] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  const loadAll = async () => {
    setLoading(true);
    setError("");

    try {
      const [groupsData, mentorsData, studentsData, semestersData] =
        await Promise.all([
          getGroups(),
          getAllMentors(),
          getAllStudents(),
          getSemesters(),
        ]);

      setGroups(Array.isArray(groupsData) ? groupsData : []);
      setMentors(Array.isArray(mentorsData) ? mentorsData : []);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setSemesters(
        Array.isArray(semestersData) ? semestersData : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load mentor assignment data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const activeSections = useMemo(() => {
    return groups
      .filter((group) => group.status === "ACTIVE")
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();

        return dateB - dateA;
      });
  }, [groups]);

  const assignedStudentIds = useMemo(() => {
    const ids = new Set();

    activeSections.forEach((section) => {
      (section.students || []).forEach((student) => {
        if (student?._id) {
          ids.add(student._id.toString());
        }
      });
    });

    return ids;
  }, [activeSections]);

  const availableStudents = useMemo(() => {
    return students.filter(
      (student) =>
        !assignedStudentIds.has(student._id.toString())
    );
  }, [students, assignedStudentIds]);

  const setActionLoadingState = (key, value) => {
    setActionLoading((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCreateSection = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Section name is required.");
      return;
    }

    if (!form.semester) {
      setError("Please select a semester.");
      return;
    }

    setActionLoadingState("create", true);

    try {
      await createGroup({
        name: form.name.trim(),
        semester: form.semester,
        status: "ACTIVE",
      });

      setForm({
        name: "",
        semester: "",
      });

      setShowForm(false);

      await loadAll();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create section."
      );
    } finally {
      setActionLoadingState("create", false);
    }
  };

  const handleAssignMentor = async (sectionId) => {
    const mentorId = mentorPick[sectionId];

    if (!mentorId) {
      setError("Please select a mentor.");
      return;
    }

    setError("");
    setActionLoadingState(`mentor-${sectionId}`, true);

    try {
      await assignMentor(sectionId, mentorId);

      setMentorPick((prev) => ({
        ...prev,
        [sectionId]: "",
      }));

      await loadAll();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to assign mentor."
      );
    } finally {
      setActionLoadingState(
        `mentor-${sectionId}`,
        false
      );
    }
  };

  const handleAddStudent = async (sectionId) => {
    const studentId = studentPick[sectionId];

    if (!studentId) {
      setError("Please select a student.");
      return;
    }

    setError("");
    setActionLoadingState(`student-${sectionId}`, true);

    try {
      await assignStudents(sectionId, [studentId]);

      setStudentPick((prev) => ({
        ...prev,
        [sectionId]: "",
      }));

      await loadAll();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to assign student."
      );
    } finally {
      setActionLoadingState(
        `student-${sectionId}`,
        false
      );
    }
  };

  const handleUpdateSemester = async (sectionId) => {
    const semesterId = semesterPick[sectionId];

    if (!semesterId) {
      setError("Please select a semester.");
      return;
    }

    setError("");
    setActionLoadingState(
      `semester-${sectionId}`,
      true
    );

    try {
      await updateGroup(sectionId, {
        semester: semesterId,
      });

      setSemesterPick((prev) => ({
        ...prev,
        [sectionId]: "",
      }));

      await loadAll();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update section."
      );
    } finally {
      setActionLoadingState(
        `semester-${sectionId}`,
        false
      );
    }
  };

  const handleDeleteSection = async (sectionId, name) => {
    const confirmed = window.confirm(
      `Delete section "${name}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setActionLoadingState(
      `delete-${sectionId}`,
      true
    );

    try {
      await deleteGroup(sectionId);
      await loadAll();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete section."
      );
    } finally {
      setActionLoadingState(
        `delete-${sectionId}`,
        false
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading mentor assignment...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
            Mentor Assignment
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Assign mentors and students to active sections.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm((prev) => !prev);
            setError("");
          }}
          className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 sm:w-auto"
        >
          {showForm ? "Cancel" : "+ New Section"}
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCreateSection}
          className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <h2 className="text-base font-semibold text-gray-900">
            Create New Section
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Create the section first. You can assign the mentor
            and students afterward.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Section Name
              </label>

              <input
                required
                type="text"
                value={form.name}
                placeholder="e.g. SWE-M01"
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Semester
              </label>

              <select
                required
                value={form.semester}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    semester: event.target.value,
                  }))
                }
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select semester</option>

                {semesters.map((semester) => (
                  <option
                    key={semester._id}
                    value={semester._id}
                  >
                    {semester.name} ({semester.academicYear})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setForm({
                  name: "",
                  semester: "",
                });
              }}
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={actionLoading.create}
              className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {actionLoading.create
                ? "Creating..."
                : "Create Section"}
            </button>
          </div>
        </form>
      )}

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Active Sections
        </h2>

        <p className="text-sm text-gray-500">
          {activeSections.length} active{" "}
          {activeSections.length === 1
            ? "section"
            : "sections"}
        </p>
      </div>

      <div className="space-y-4">
        {activeSections.map((section) => {
          const sectionId = section._id;

          const mentorLoading =
            actionLoading[`mentor-${sectionId}`];

          const studentLoading =
            actionLoading[`student-${sectionId}`];

          const semesterLoading =
            actionLoading[`semester-${sectionId}`];

          const deleteLoading =
            actionLoading[`delete-${sectionId}`];

          return (
            <div
              key={sectionId}
              className="w-full min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
            >
              <div className="border-b border-gray-100 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="break-words text-base font-semibold text-gray-900 sm:text-lg">
                        {section.name}
                      </h3>

                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                        Active
                      </span>
                    </div>

                    <p className="mt-1 break-words text-sm text-gray-500">
                      {section.semester?.name ||
                        "Semester not assigned"}

                      {section.semester?.academicYear
                        ? ` (${section.semester.academicYear})`
                        : ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={deleteLoading}
                    onClick={() =>
                      handleDeleteSection(
                        sectionId,
                        section.name
                      )
                    }
                    className="self-start text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    {deleteLoading
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Assigned Mentor
                  </p>

                  <p className="mt-1 text-sm">
                    {section.mentor?.user?.name ? (
                      <span className="font-medium text-gray-900">
                        {section.mentor.user.name}
                      </span>
                    ) : (
                      <span className="text-orange-600">
                        Not assigned
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="min-w-0">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Assign Mentor
                    </label>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <select
                        value={mentorPick[sectionId] || ""}
                        onChange={(event) =>
                          setMentorPick((prev) => ({
                            ...prev,
                            [sectionId]:
                              event.target.value,
                          }))
                        }
                        className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">
                          Select mentor
                        </option>

                        {mentors
                          .filter(
                            (mentor) => mentor?.user
                          )
                          .map((mentor) => (
                            <option
                              key={mentor._id}
                              value={mentor._id}
                            >
                              {mentor.user.name}
                            </option>
                          ))}
                      </select>

                      <button
                        type="button"
                        disabled={mentorLoading}
                        onClick={() =>
                          handleAssignMentor(
                            sectionId
                          )
                        }
                        className="rounded-md bg-gray-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {mentorLoading
                          ? "Saving..."
                          : "Set"}
                      </button>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Add Student
                    </label>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <select
                        value={studentPick[sectionId] || ""}
                        onChange={(event) =>
                          setStudentPick((prev) => ({
                            ...prev,
                            [sectionId]:
                              event.target.value,
                          }))
                        }
                        className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">
                          Select student
                        </option>

                        {availableStudents.map(
                          (student) => (
                            <option
                              key={student._id}
                              value={student._id}
                            >
                              {student.user?.name ||
                                "Unnamed student"}{" "}
                              ({student.studentId})
                            </option>
                          )
                        )}

                        {availableStudents.length ===
                          0 && (
                          <option value="" disabled>
                            No unassigned students
                          </option>
                        )}
                      </select>

                      <button
                        type="button"
                        disabled={studentLoading}
                        onClick={() =>
                          handleAddStudent(
                            sectionId
                          )
                        }
                        className="rounded-md bg-gray-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {studentLoading
                          ? "Adding..."
                          : "Add"}
                      </button>
                    </div>

                    <p className="mt-1.5 text-xs text-gray-400">
                      Students already assigned to another
                      active section are unavailable.
                    </p>
                  </div>
                </div>

                {!section.semester && (
                  <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-3">
                    <p className="text-sm font-medium text-red-700">
                      This section has no valid semester.
                    </p>

                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <select
                        value={
                          semesterPick[sectionId] || ""
                        }
                        onChange={(event) =>
                          setSemesterPick((prev) => ({
                            ...prev,
                            [sectionId]:
                              event.target.value,
                          }))
                        }
                        className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      >
                        <option value="">
                          Select semester
                        </option>

                        {semesters.map((semester) => (
                          <option
                            key={semester._id}
                            value={semester._id}
                          >
                            {semester.name} (
                            {semester.academicYear})
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        disabled={semesterLoading}
                        onClick={() =>
                          handleUpdateSemester(
                            sectionId
                          )
                        }
                        className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                      >
                        {semesterLoading
                          ? "Updating..."
                          : "Fix"}
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-5 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">
                      Students
                    </p>

                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                      {section.students?.length || 0}
                    </span>
                  </div>

                  {section.students?.length > 0 ? (
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {section.students.map(
                        (student) => (
                          <div
                            key={student._id}
                            className="min-w-0 rounded-md bg-gray-50 px-3 py-2"
                          >
                            <p className="truncate text-sm font-medium text-gray-800">
                              {student.user?.name ||
                                "Unnamed student"}
                            </p>

                            {student.studentId && (
                              <p className="truncate text-xs text-gray-500">
                                {student.studentId}
                              </p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-gray-400">
                      No students assigned yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {activeSections.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white px-5 py-10 text-center">
            <h3 className="text-base font-medium text-gray-800">
              No active sections
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Create a new section to start assigning
              mentors and students.
            </p>

            {!showForm && (
              <button
                type="button"
                onClick={() => {
                  setShowForm(true);
                  setError("");
                }}
                className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                + New Section
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorAssignment;