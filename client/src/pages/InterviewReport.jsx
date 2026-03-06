import React from "react";

function InterviewReport({ report, interviewId }) {
  if (!report) return null;

  return (
    <div style={{ 
      marginTop: "20px", 
      padding: "20px", 
      background: "rgba(255,255,255,0.02)", 
      border: "1px solid rgba(255,255,255,0.1)", 
      borderRadius: "12px" 
    }}>
      <h2 style={{ color: "var(--primary)", marginTop: 0, marginBottom: "15px" }}>📊 Interview Report</h2>

      <h3 style={{ fontSize: "1.2rem", marginBottom: "20px", color: "var(--text-color)" }}>{report.summary}</h3>

      {report.strengths && report.strengths.length > 0 && (
        <div style={{ marginBottom: "15px" }}>
          <h4 style={{ color: "#10b981", margin: "0 0 10px 0", fontSize: "1.1rem" }}>Strengths</h4>
          {report.strengths.map((s, i) => (
            <p key={i} style={{ margin: "5px 0", color: "#d1d5db" }}>✔ {s}</p>
          ))}
        </div>
      )}

      {report.weaknesses && report.weaknesses.length > 0 && (
        <div style={{ marginBottom: "15px" }}>
          <h4 style={{ color: "#ef4444", margin: "0 0 10px 0", fontSize: "1.1rem" }}>Weaknesses</h4>
          {report.weaknesses.map((w, i) => (
            <p key={i} style={{ margin: "5px 0", color: "#d1d5db" }}>⚠ {w}</p>
          ))}
        </div>
      )}

      {report.suggestions && report.suggestions.length > 0 && (
        <div>
          <h4 style={{ color: "#f59e0b", margin: "0 0 10px 0", fontSize: "1.1rem" }}>Suggestions</h4>
          {report.suggestions.map((s, i) => (
            <p key={i} style={{ margin: "5px 0", color: "#d1d5db" }}>💡 {s}</p>
          ))}
        </div>
      )}

      {interviewId && (
        <div style={{ marginTop: "25px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px" }}>
            <button
                onClick={() => window.open(`http://localhost:5000/api/report/download/${interviewId}`)}
                style={{
                    padding: "12px 24px",
                    background: "#3b82f6",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px"
                }}
            >
                📥 Download PDF Report
            </button>
        </div>
      )}

    </div>
  );
}

export default InterviewReport;
