import { useEffect, useState } from "react";
import { getMyStudents } from "../../services/mentorService";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyStudents().then(setStudents).finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading students...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">My Students</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Semester</th>
              <th className="p-3">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id} className="border-t">
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.email}</td>
                <td className="p-3">{s.semester}</td>
                <td className="p-3">{s.attendancePercent ?? "-"}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && <p className="p-4 text-gray-500">No students assigned yet.</p>}
      </div>
    </div>
  );
};

export default Students;