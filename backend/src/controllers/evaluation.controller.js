const { calculateMentorRating } = require("../services/rating.service");

// Public (any authenticated role): get aggregated rating for a mentor
const getMentorRating = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { semesterId } = req.query; // optional filter

    const rating = await calculateMentorRating(mentorId, semesterId || null);
    res.json({ mentorId, ...rating });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getMentorRating };