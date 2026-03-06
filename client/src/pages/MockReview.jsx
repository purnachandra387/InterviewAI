import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getMockSessionById } from "../services/api";
import "./MockReview.css";

const DIFFICULTY_CONFIG = {
    easy: { label: "Easy", color: "#10b981", icon: "🌱" },
    medium: { label: "Medium", color: "#f59e0b", icon: "🔥" },
    hard: { label: "Hard", color: "#ef4444", icon: "⚡" },
};

function ScoreArc({ score, size = 160 }) {
    const r = (size - 14) / 2;
    const circ = 2 * Math.PI * r;
    const pct = score / 100;
    const color = score >= 85 ? "#10b981" : score >= 70 ? "#06b6d4" : score >= 50 ? "#f59e0b" : "#ef4444";
    const grade = score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Fair" : "Needs Work";
    return (
        <div className="mr-arc-wrap">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={12} />
                <circle
                    cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke={color} strokeWidth={12}
                    strokeDasharray={`${circ * pct} ${circ}`}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ transition: "stroke-dasharray 1.2s ease" }}
                />
                <text x="50%" y="45%" textAnchor="middle" fill="white" fontSize={size * 0.2} fontWeight="800" fontFamily="inherit" dominantBaseline="middle">{score}%</text>
                <text x="50%" y="65%" textAnchor="middle" fill={color} fontSize={size * 0.095} fontWeight="700" fontFamily="inherit" dominantBaseline="middle">{grade}</text>
            </svg>
        </div>
    );
}

function ScoreBar({ score, max = 10 }) {
    const pct = (score / max) * 100;
    const color = score >= 8 ? "#10b981" : score >= 5 ? "#f59e0b" : "#ef4444";
    return (
        <div className="mr-score-bar-wrap">
            <div className="mr-score-bar-track">
                <div className="mr-score-bar-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className="mr-score-num" style={{ color }}>{score}/{max}</span>
        </div>
    );
}

export default function MockReview() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeQIdx, setActiveQIdx] = useState(null);

    const handleLogout = () => { localStorage.clear(); navigate("/login"); };

    useEffect(() => {
        getMockSessionById(id)
            .then(({ data }) => setSession(data))
            .catch(err => {
                if (err?.response?.status === 401) { localStorage.clear(); navigate("/login"); return; }
                setError("Session not found or access denied.");
            })
            .finally(() => setLoading(false));
    }, [id, navigate]);

    const handlePrint = () => window.print();

    if (loading) return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
            <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
        </div>
    );
    if (error) return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", flexDirection: "column", gap: "1rem" }}>
            <div style={{ fontSize: "3rem" }}>❌</div>
            <p>{error}</p>
            <Link to="/history" className="btn btn-primary" style={{ maxWidth: 200, display: "flex" }}>← View History</Link>
        </div>
    );

    const diff = DIFFICULTY_CONFIG[session.difficulty] || DIFFICULTY_CONFIG.medium;
    const qna = session.qna || [];
    const totalScore = qna.reduce((s, q) => s + q.score, 0);
    const maxScore = qna.length * 10;
    const avgScore = qna.length ? (totalScore / qna.length).toFixed(1) : 0;
    const bestQ = qna.length ? Math.max(...qna.map(q => q.score)) : 0;
    const lowestQ = qna.length ? Math.min(...qna.map(q => q.score)) : 0;

    return (
        <div className="mr-page">
            {/* Navbar — hidden when printing */}
            <nav className="navbar no-print">
                <div className="container navbar-inner">
                    <div className="navbar-logo">🧠 <span>Interview</span>AI</div>
                    <div className="navbar-user">
                        <Link to="/history" className="btn" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-muted)", padding: "0.4rem 0.9rem", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 600 }}>← History</Link>
                        <button id="print-report-btn" className="mr-print-btn" onClick={handlePrint}>🖨️ Print Report</button>
                        <button className="btn-logout" onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </nav>

            <div className="container mr-body">

                {/* Print Header */}
                <div className="mr-print-header print-only">
                    <div className="mr-ph-logo">🧠 InterviewAI Report</div>
                    <div className="mr-ph-date">Generated: {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
                </div>

                {/* Hero Score Card */}
                <div className="mr-hero fade-up">
                    <div className="mr-hero-left">
                        <div className="mr-hero-meta">
                            <span className="mr-role-badge">{session.role}</span>
                            <span className="mr-diff-badge" style={{ color: diff.color, borderColor: diff.color + "44" }}>
                                {diff.icon} {diff.label}
                            </span>
                            <span className="mr-date-badge">
                                📅 {new Date(session.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                        </div>
                        <h1>Mock Interview Review</h1>
                        <p>Detailed analysis of your performance across {qna.length} questions</p>

                        {/* Quick Stats */}
                        <div className="mr-quick-stats">
                            <div className="mr-qs-item">
                                <div className="mr-qs-val">{qna.length}</div>
                                <div className="mr-qs-label">Questions</div>
                            </div>
                            <div className="mr-qs-item">
                                <div className="mr-qs-val">{totalScore}/{maxScore}</div>
                                <div className="mr-qs-label">Total Points</div>
                            </div>
                            <div className="mr-qs-item">
                                <div className="mr-qs-val">{avgScore}</div>
                                <div className="mr-qs-label">Avg Score</div>
                            </div>
                            <div className="mr-qs-item">
                                <div className="mr-qs-val" style={{ color: "#10b981" }}>{bestQ}/10</div>
                                <div className="mr-qs-label">Best Answer</div>
                            </div>
                            <div className="mr-qs-item">
                                <div className="mr-qs-val" style={{ color: "#ef4444" }}>{lowestQ}/10</div>
                                <div className="mr-qs-label">Lowest Score</div>
                            </div>
                        </div>
                    </div>
                    <ScoreArc score={session.overallScore} />
                </div>

                {/* Score Distribution */}
                <div className="mr-section fade-up">
                    <h2>📊 Score Distribution</h2>
                    <div className="mr-score-grid">
                        {qna.map((q, i) => (
                            <div
                                key={i}
                                className={`mr-score-tile ${activeQIdx === i ? "active" : ""}`}
                                onClick={() => setActiveQIdx(activeQIdx === i ? null : i)}
                            >
                                <div className="mr-st-label">Q{i + 1}</div>
                                <div className="mr-st-bar">
                                    <div
                                        className="mr-st-fill"
                                        style={{
                                            height: `${(q.score / 10) * 100}%`,
                                            background: q.score >= 8 ? "#10b981" : q.score >= 5 ? "#f59e0b" : "#ef4444",
                                        }}
                                    />
                                </div>
                                <div className="mr-st-score">{q.score}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Q&A Breakdown */}
                <div className="mr-section fade-up">
                    <h2>📋 Question-by-Question Breakdown</h2>
                    <div className="mr-qna-list">
                        {qna.map((item, i) => (
                            <div
                                key={i}
                                id={`review-q-${i}`}
                                className={`mr-qna-card ${activeQIdx === i ? "highlighted" : ""}`}
                                onClick={() => setActiveQIdx(activeQIdx === i ? null : i)}
                            >
                                <div className="mr-qna-header">
                                    <div className="mr-qna-q">
                                        <span className="mr-qna-num">Q{i + 1}</span>
                                        <span>{item.question}</span>
                                    </div>
                                    <div className="mr-qna-score-col">
                                        <ScoreBar score={item.score} />
                                    </div>
                                </div>

                                {item.answer !== "(Skipped)" && (
                                    <div className="mr-qna-answer">
                                        <div className="mr-qna-label">Your Answer</div>
                                        <p>{item.answer}</p>
                                    </div>
                                )}
                                {item.answer === "(Skipped)" && (
                                    <div className="mr-qna-skipped">⏭ Question was skipped</div>
                                )}

                                <div className="mr-qna-feedback">
                                    <div className="mr-qna-label">AI Feedback</div>
                                    <p>{item.feedback}</p>
                                </div>

                                {item.tip && (
                                    <div className="mr-qna-tip">
                                        <span>💡</span>
                                        <p>{item.tip}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="mr-actions no-print fade-up">
                    <Link to="/mock" className="mr-action-btn primary">🎯 Try Another Mock</Link>
                    <Link to="/history" className="mr-action-btn secondary">📚 Back to History</Link>
                    <button className="mr-action-btn secondary" onClick={handlePrint}>🖨️ Print Report</button>
                    <Link to="/coach" className="mr-action-btn secondary">🤖 Get Coaching</Link>
                </div>
            </div>
        </div>
    );
}
