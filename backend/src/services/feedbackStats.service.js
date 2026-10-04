// Pure helpers (no database access) used by the mentor feedback summary endpoints.

const normalizeYesNo = (value) => {
  const text = String(value ?? "").trim().toLowerCase();
  if (["yes", "y", "true"].includes(text)) return "Yes";
  if (["no", "n", "false"].includes(text)) return "No";
  return null;
};

const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;

// feedbacks: [{ rating }]
const summarizeRatings = (feedbacks) => {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;

  feedbacks.forEach((feedback) => {
    if (distribution[feedback.rating] !== undefined) distribution[feedback.rating] += 1;
    sum += feedback.rating;
  });

  return {
    totalResponses: feedbacks.length,
    averageRating: feedbacks.length ? round2(sum / feedbacks.length) : 0,
    distribution,
  };
};

// templateQuestions: [{ _id, question, type }]  feedbacks: [{ answers: [{ questionId, question, answer, type }] }]
const summarizeQuestions = (templateQuestions, feedbacks) => {
  const questions = [...templateQuestions];

  // old feedback may reference questions that were removed from the template later
  feedbacks.forEach((feedback) => {
    (feedback.answers || []).forEach((answer) => {
      if (!questions.some((q) => String(q._id) === String(answer.questionId))) {
        questions.push({ _id: answer.questionId, question: answer.question, type: answer.type });
      }
    });
  });

  return questions.map((question) => {
    const answers = feedbacks
      .map((feedback) =>
        (feedback.answers || []).find((a) => String(a.questionId) === String(question._id))
      )
      .filter(Boolean);

    if (question.type === "YESNO") {
      const yes = answers.filter((a) => normalizeYesNo(a.answer) === "Yes").length;
      const no = answers.filter((a) => normalizeYesNo(a.answer) === "No").length;
      const total = yes + no;

      return {
        questionId: question._id,
        question: question.question,
        type: "YESNO",
        yes,
        no,
        total,
        yesPercent: total ? round1((yes / total) * 100) : 0,
        noPercent: total ? round1((no / total) * 100) : 0,
        skipped: feedbacks.length - total,
      };
    }

    // text answers are shown without student names
    const texts = answers.map((a) => String(a.answer || "").trim()).filter(Boolean);
    return {
      questionId: question._id,
      question: question.question,
      type: "TEXT",
      total: texts.length,
      answers: texts,
      skipped: feedbacks.length - texts.length,
    };
  });
};

module.exports = { normalizeYesNo, summarizeRatings, summarizeQuestions };
