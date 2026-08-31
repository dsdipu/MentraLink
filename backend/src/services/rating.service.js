const MentorEvaluation = require("../models/MentorEvaluation");

// Calculate aggregated rating for a mentor (optionally scoped to a semester)
const calculateMentorRating = async (mentorId, semesterId = null) => {
  const filter = { mentor: mentorId };
  if (semesterId) filter.semester = semesterId;

  const evaluations = await MentorEvaluation.find(filter);

  if (evaluations.length === 0) {
    return {
      overallRating: 0,
      totalEvaluations: 0,
      categoryAverages: {
        communication: 0,
        guidance: 0,
        availability: 0,
        knowledgeSharing: 0,
        overallExperience: 0,
      },
    };
  }

  const totals = {
    communication: 0,
    guidance: 0,
    availability: 0,
    knowledgeSharing: 0,
    overallExperience: 0,
  };

  evaluations.forEach((evalItem) => {
    totals.communication += evalItem.ratings.communication;
    totals.guidance += evalItem.ratings.guidance;
    totals.availability += evalItem.ratings.availability;
    totals.knowledgeSharing += evalItem.ratings.knowledgeSharing;
    totals.overallExperience += evalItem.ratings.overallExperience;
  });

  const count = evaluations.length;
  const categoryAverages = {
    communication: +(totals.communication / count).toFixed(2),
    guidance: +(totals.guidance / count).toFixed(2),
    availability: +(totals.availability / count).toFixed(2),
    knowledgeSharing: +(totals.knowledgeSharing / count).toFixed(2),
    overallExperience: +(totals.overallExperience / count).toFixed(2),
  };

  const overallRating = +(
    (categoryAverages.communication +
      categoryAverages.guidance +
      categoryAverages.availability +
      categoryAverages.knowledgeSharing +
      categoryAverages.overallExperience) /
    5
  ).toFixed(2);

  return { overallRating, totalEvaluations: count, categoryAverages };
};

module.exports = { calculateMentorRating };
