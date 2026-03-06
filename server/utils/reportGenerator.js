function generateReport(score, feedback) {

  const report = {
    summary: "",
    strengths: feedback?.strengths || [],
    weaknesses: feedback?.weaknesses || [],
    suggestions: feedback?.suggestions || []
  };

  if (score >= 4) {
    report.summary = "Excellent interview performance";
  } else if (score >= 3) {
    report.summary = "Good performance but needs improvement";
  } else {
    report.summary = "Needs more preparation";
  }

  return report;
}

module.exports = generateReport;
