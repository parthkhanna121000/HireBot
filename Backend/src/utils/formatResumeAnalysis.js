function formatResumeAnalysis(data) {
  return {
    score: data.overallScore,

    breakdown: [
      { label: "Skills match", pct: data.skillsMatch },
      { label: "Experience match", pct: data.experienceMatch },
      { label: "Keywords match", pct: data.keywordsMatch },
      { label: "ATS compatibility", pct: data.atsScore },
    ],

    missingSkills: data.missingSkills || [],

    matchedSkills: [], // optional: you can extract later

    suggestions: data.suggestions || [],

    atsIssues: data.problems || [],

    highlightedLines: [
      {
        type: "section",
        text: "AI Analysis",
      },
      ...(data.goodParts || []).map((text) => ({
        parts: [{ text, highlight: "good" }],
      })),
      ...(data.weakParts || []).map((text) => ({
        parts: [{ text, highlight: "issue" }],
      })),
    ],
  };
}

module.exports = formatResumeAnalysis;
