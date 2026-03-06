import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import InterviewReport from "./InterviewReport";

export default function InterviewHistory() {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReportIndex, setSelectedReportIndex] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await API.get("/interview/history");
                setHistory(res.data);
            } catch (err) {
                if (err?.response?.status === 401) {
                    localStorage.clear();
                    navigate("/login");
                }
                console.error("Failed to fetch interview history:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [navigate]);

    return (
        <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto", fontFamily: "sans-serif" }}>
            <Link to="/dashboard" style={{ textDecoration: "none", color: "#3b82f6", display: "inline-block", marginBottom: "30px", fontSize: "16px", fontWeight: "bold" }}>
                ← Back to Dashboard
            </Link>

            <h1 style={{ marginBottom: "10px", fontSize: "32px", color: "var(--text-color, #fff)" }}>Interview History</h1>
            <p style={{ color: "var(--text-muted, #9ca3af)", marginBottom: "30px", fontSize: "16px" }}>
                Track your progress, scores, and feedback from past Day 15 AI interviews.
            </p>

            {loading ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>Loading your history...</div>
            ) : history.length === 0 ? (
                <div style={{
                    padding: "60px 20px",
                    textAlign: "center",
                    background: "rgba(255, 255, 255, 0.03)",
                    borderRadius: "16px",
                    border: "1px dashed rgba(255,255,255,0.1)"
                }}>
                    <div style={{ fontSize: "40px", marginBottom: "15px" }}>📭</div>
                    <h3 style={{ margin: "0 0 10px 0", color: "#fff" }}>No Interviews Yet</h3>
                    <p style={{ color: "#9ca3af", marginBottom: "20px" }}>Start an interview to see your scores and feedback here.</p>
                    <Link to="/day13" style={{ padding: "10px 20px", background: "#3b82f6", color: "#fff", textDecoration: "none", borderRadius: "8px", fontWeight: "bold" }}>
                        Start Interview
                    </Link>
                </div>
            ) : (
                <div style={{ display: "grid", gap: "20px" }}>
                    {history.map((item, index) => (
                        <div
                            key={index}
                            style={{
                                background: "rgba(255, 255, 255, 0.05)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                borderRadius: "12px",
                                padding: "24px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px"
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px" }}>
                                <div>
                                    <h3 style={{ margin: "0 0 5px 0", color: "var(--text-color, #fff)", textTransform: "capitalize", fontSize: "20px" }}>{item.role}</h3>
                                    <span style={{ fontSize: "14px", color: "#9ca3af" }}>
                                        {new Date(item.createdAt).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>

                                <div style={{
                                    background: item.score >= 4 ? "rgba(16, 185, 129, 0.15)" : item.score >= 3 ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)",
                                    color: item.score >= 4 ? "#10b981" : item.score >= 3 ? "#f59e0b" : "#ef4444",
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    fontWeight: "bold",
                                    fontSize: "18px"
                                }}>
                                    {item.score !== undefined ? item.score.toFixed(1) : "N/A"} <span style={{ fontSize: "14px", opacity: 0.7 }}>/ 5</span>
                                </div>
                            </div>

                            <div style={{ marginTop: "5px" }}>
                                <strong style={{ color: "#e5e7eb", fontSize: "15px", display: "block", marginBottom: "5px" }}>AI Feedback:</strong>
                                
                                {typeof item.feedback === 'string' ? (
                                    <p style={{ margin: 0, color: "#9ca3af", lineHeight: "1.5", fontSize: "15px" }}>{item.feedback || "No feedback generated."}</p>
                                ) : item.feedback ? (
                                    <div style={{ fontSize: "15px", color: "#9ca3af", lineHeight: "1.6" }}>
                                        {item.feedback.strengths?.length > 0 && <div><strong style={{color:"#10b981"}}>Strengths:</strong> {item.feedback.strengths.join(", ")}</div>}
                                        {item.feedback.weaknesses?.length > 0 && <div><strong style={{color:"#ef4444"}}>Weaknesses:</strong> {item.feedback.weaknesses.join(", ")}</div>}
                                        {item.feedback.suggestions?.length > 0 && <div><strong style={{color:"#f59e0b"}}>Suggestions:</strong> {item.feedback.suggestions.join(", ")}</div>}
                                    </div>
                                ) : (
                                    <p style={{ margin: 0, color: "#9ca3af", lineHeight: "1.5", fontSize: "15px" }}>No feedback generated.</p>
                                )}
                            </div>

                            {item.report && (
                                <div style={{ marginTop: "10px", display: "flex", justifyContent: "flex-end", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "15px" }}>
                                    <button
                                        onClick={() => setSelectedReportIndex(selectedReportIndex === index ? null : index)}
                                        style={{ padding: "8px 16px", background: selectedReportIndex === index ? "rgba(255,255,255,0.1)" : "rgba(59, 130, 246, 0.2)", color: selectedReportIndex === index ? "#e5e7eb" : "#3b82f6", border: selectedReportIndex === index ? "border: 1px solid rgba(255,255,255,0.2)" : "1px solid rgba(59, 130, 246, 0.4)", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}
                                    >
                                        {selectedReportIndex === index ? "Hide Report" : "View Report"}
                                    </button>
                                </div>
                            )}

                            {selectedReportIndex === index && item.report && (
                                <InterviewReport report={item.report} interviewId={item._id} />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
