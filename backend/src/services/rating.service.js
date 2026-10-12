const MentorEvaluation = require("../models/MentorEvaluation");
const Session = require("../models/Session");

// Session ownership is the source of truth. This also includes older evaluation
// records whose stored mentor reference does not match the session's assigned mentor.
const calculateMentorRating = async (mentorId, semesterId = null) => {
  const sessionFilter = { mentor: mentorId };
  if (semesterId) sessionFilter.semester = semesterId;

  const sessions = await Session.find(sessionFilter).select("_id");
  const sessionIds = sessions.map((session) => session._id);
  const evaluationFilters = [];

  if (sessionIds.length) {
    evaluationFilters.push({ session: { $in: sessionIds } });
  }

  const mentorEvaluationFilter = { mentor: mentorId };
  if (semesterId) mentorEvaluationFilter.semester = semesterId;
  evaluationFilters.push(mentorEvaluationFilter);

  const evaluations = await MentorEvaluation.find({ $or: evaluationFilters });

  if (evaluations.length === 0) {
    return {
      overallRating: 5,
      totalEvaluations: 0,
      categoryAverages: {
        communication: 5,
        guidance: 5,
        availability: 5,
        knowledgeSharing: 5,
        overallExperience: 5,
      },
    };
  }

  const categories = [
    "communication",
    "guidance",
    "availability",
    "knowledgeSharing",
    "overallExperience",
  ];
  const totals = Object.fromEntries(categories.map((category) => [category, 0]));

  evaluations.forEach((evaluation) => {
    categories.forEach((category) => {
      totals[category] += evaluation.ratings[category];
    });
  });

  const count = evaluations.length;
  const categoryAverages = Object.fromEntries(
    categories.map((category) => [category, +(totals[category] / count).toFixed(2)])
  );
  const overallRating = +(
    categories.reduce((sum, category) => sum + categoryAverages[category], 0) / categories.length
  ).toFixed(2);

  return { overallRating, totalEvaluations: count, categoryAverages };
};

module.exports = { calculateMentorRating };
