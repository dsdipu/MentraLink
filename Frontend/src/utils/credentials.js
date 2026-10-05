export const STUDENT_ID_PATTERN = /^\d{9}$/;
export const MAX_BULK = 200;

// how many IDs a range contains; null when the range is not valid yet
export const countRange = (startId, endId) => {
  if (!STUDENT_ID_PATTERN.test(startId) || !STUDENT_ID_PATTERN.test(endId)) return null;
  const count = Number(endId) - Number(startId) + 1;
  return count >= 1 ? count : null;
};

// CSV that the admin can hand out; the temporary password is the student ID itself
export const credentialsToCsv = (rows) =>
  ["Student ID,Login email,Temporary password"]
    .concat(rows.map((row) => `${row.studentId},${row.email},${row.studentId}`))
    .join("\r\n");

export const downloadTextFile = (filename, text) => {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
