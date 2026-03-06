import React, { useState } from "react";
import API from "../services/api";
import { Link, useLocation } from "react-router-dom";
import "./Interview.css";

export default function Day13Interview() {
    const location = useLocation();
    const [role, setRole] = useState(location.state?.role || "");
    const [interview, setInterview] = useState(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answer, setAnswer] = useState("");

    // Day 14 Logic: Accumulate answers manually until the end
    const [answersList, setAnswersList] = useState([]);

    const [loading, setLoading] = useState(false);
    const [finished, setFinished] = useState(false);

    // Day 14 Logic: Store final result
    const [result, setResult] = useState(null);

    const startInterview = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await API.post("/interview/start", { role });
            if (res.data.questions) {
                setInterview(res.data);
                setCurrentIdx(0);
                setFinished(false);
                setAnswer("");
                setAnswersList([]);
                setResult(null);
            } else {
                alert(res.data.message || "Failed to start interview");
            }
        } catch (err) {
            console.error(err);
            alert("Error starting interview");
        }
        setLoading(false);
    };

    const nextQuestion = async () => {
        if (!answer.trim()) return alert("Please enter an answer!");

        setLoading(true);
        try {
            const newAnswersList = [...answersList, answer];
            setAnswersList(newAnswersList);

            // Move to next question or submit the entire bundle if finished
            if (currentIdx + 1 < interview.questions.length) {
                setCurrentIdx(prev => prev + 1);
                setAnswer("");
                setLoading(false);
            } else {
                // Day 14: Submit all answers at once to get evaluation score
                const evaluateRes = await API.post(`/interview/submit`, {
                    interviewId: interview._id,
                    answers: newAnswersList
                });

                setResult(evaluateRes.data);
                setFinished(true);
                setLoading(false);
            }
        } catch (err) {
            console.error("Failed to submit answers", err);
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto", fontFamily: "sans-serif" }}>
            <Link to="/dashboard" style={{ textDecoration: "none", color: "#3b82f6", display: "inline-block", marginBottom: "20px" }}>← Back to Dashboard</Link>

            {!interview && !finished && (
                <div>
                    <h2>Start Mock Interview</h2>
                    <form onSubmit={startInterview}>
                        <div style={{ marginBottom: "15px" }}>
                            <label style={{ display: "block", marginBottom: "8px" }}>Enter Role:</label>
                            <input
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                placeholder="e.g. Frontend Developer"
                                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading} style={{ padding: "10px 20px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                            {loading ? "Starting..." : "Start Interview"}
                        </button>
                    </form>
                </div>
            )}

            {interview && !finished && (
                <div>
                    <h2>Question {currentIdx + 1}:</h2>
                    <p style={{ fontSize: "18px", fontWeight: "500" }}>{interview.questions[currentIdx]}</p>

                    <div style={{ marginTop: "20px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Your Answer:</label>
                        <textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            rows="5"
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                            placeholder="Type your answer here..."
                        ></textarea>
                    </div>

                    <button onClick={nextQuestion} disabled={loading} style={{ marginTop: "15px", padding: "10px 20px", background: "#10b981", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                        {loading ? "Saving..." : currentIdx + 1 === interview.questions.length ? "Submit Interview" : "Next Question"}
                    </button>
                </div>
            )}

            {finished && result && (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <h2>🎉 Interview Result</h2>
                    <div style={{ background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "8px", margin: "20px 0" }}>
                        <h1 style={{ color: "#10b981", fontSize: "40px", margin: "10px 0" }}>{result.score} <span style={{ fontSize: "20px", color: "var(--text-muted)" }}>/ 5</span></h1>
                        
                        {typeof result.feedback === 'string' ? (
                            <p style={{ fontSize: "18px", fontStyle: "italic" }}>{result.feedback}</p>
                        ) : (
                            <div style={{ textAlign: "left", marginTop: "20px" }}>
                                {result.feedback?.strengths?.length > 0 && (
                                    <>
                                        <h3 style={{ color: "#10b981", marginBottom: "5px" }}>Strengths</h3>
                                        {result.feedback.strengths.map((s, i) => <p key={i} style={{ margin: "5px 0" }}>✔ {s}</p>)}
                                    </>
                                )}
                                {result.feedback?.weaknesses?.length > 0 && (
                                    <>
                                        <h3 style={{ color: "#ef4444", marginTop: "15px", marginBottom: "5px" }}>Weaknesses</h3>
                                        {result.feedback.weaknesses.map((w, i) => <p key={i} style={{ margin: "5px 0" }}>⚠ {w}</p>)}
                                    </>
                                )}
                                {result.feedback?.suggestions?.length > 0 && (
                                    <>
                                        <h3 style={{ color: "#f59e0b", marginTop: "15px", marginBottom: "5px" }}>Suggestions</h3>
                                        {result.feedback.suggestions.map((s, i) => <p key={i} style={{ margin: "5px 0" }}>💡 {s}</p>)}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    <button onClick={() => { setInterview(null); setRole(""); setResult(null); }} style={{ marginTop: "20px", padding: "10px 20px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                        Start New Interview
                    </button>
                </div>
            )}
        </div>
    );
}
