export const CATEGORY_LABELS = {
  communication: "Communication",
  guidance: "Guidance",
  availability: "Availability",
  knowledgeSharing: "Knowledge Sharing",
  overallExperience: "Overall Experience",
};

const round2 = (value) => Math.round(value * 100) / 100;

// average of the 5 rating categories of one evaluation
export const evaluationAverage = (ratings = {}) => {
  const values = Object.keys(CATEGORY_LABELS)
    .map((key) => Number(ratings[key]))
    .filter((value) => Number.isFinite(value) && value > 0);
  return values.length ? round2(values.reduce((sum, v) => sum + v, 0) / values.length) : 0;
};

// Groups evaluations by session (Session 1, Session 2, ...) with per-session averages.
export const groupEvaluationsBySession = (evaluations = []) => {
  const groups = new Map();

  evaluations.forEach((evaluation) => {
    const key = String(evaluation.sessionId || evaluation.sessionTitle || "unknown");
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        sessionNumber: evaluation.sessionNumber ?? null,
        title: evaluation.sessionTitle || "Session",
        date: evaluation.sessionDate || null,
        evaluations: [],
      });
    }
    groups.get(key).evaluations.push(evaluation);
  });

  return [...groups.values()]
    .map((group) => {
      const categoryTotals = {};
      Object.keys(CATEGORY_LABELS).forEach((key) => {
        const values = group.evaluations.map((e) => Number(e.ratings?.[key])).filter((v) => v > 0);
        categoryTotals[key] = values.length
          ? round2(values.reduce((sum, v) => sum + v, 0) / values.length)
          : 0;
      });

      const averages = group.evaluations.map((e) => evaluationAverage(e.ratings)).filter(Boolean);
      return {
        ...group,
        averageRating: averages.length
          ? round2(averages.reduce((sum, v) => sum + v, 0) / averages.length)
          : 0,
        categoryAverages: categoryTotals,
        commentCount: group.evaluations.filter((e) => (e.comment || "").trim()).length,
      };
    })
    .sort((a, b) => {
      if (a.sessionNumber !== null && b.sessionNumber !== null) return a.sessionNumber - b.sessionNumber;
      return new Date(a.date || 0) - new Date(b.date || 0);
    });
};
