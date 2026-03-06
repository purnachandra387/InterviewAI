import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { mockStart, mockEvaluate, mockSave } from "../services/api";
import "./MockInterview.css";

const JOB_ROLES = [
    "Frontend Developer", "Backend Developer", "Full Stack Developer",
    "Data Scientist", "Machine Learning Engineer", "DevOps Engineer",
    "Android Developer", "iOS Developer", "UI/UX Designer",
    "Product Manager", "Java Developer", "Python Developer",
    "React Developer", "Node.js Developer", "Software Engineer",
];

const DIFFICULTY_CONFIG = {
    easy: { label: "Easy", desc: "Fresher / Entry-level", color: "#10b981", icon: "🌱" },
    medium: { label: "Medium", desc: "Intermediate / 1-3 yrs", color: "#f59e0b", icon: "🔥" },
    hard: { label: "Hard", desc: "Senior / Advanced", color: "#ef4444", icon: "⚡" },
};

// ─── Phase components ─────────────────────────────────────

function ScoreRing({ score, max = 10, size = 72 }) {
    const pct = score / max;
    const r = (size - 10) / 2;
    const circ = 2 * Math.PI * r;
    const dash = circ * pct;
    const color = score >= 8 ? "#10b981" : score >= 5 ? "#f59e0b" : "#ef4444";
    return (
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={8} />
            <circle
                cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={color} strokeWidth={8}
                strokeDasharray={`${dash} ${circ} `}
                strokeLinecap="round"
                style={{ transition: "stroke-dasharray 0.8s ease" }}
            />
            <text
                x="50%" y="50%"
                dominantBaseline="middle" textAnchor="middle"
                fill={color} fontSize={size * 0.22} fontWeight="700"
                style={{ transform: "rotate(90deg)", transformOrigin: "center", fontFamily: "inherit" }}
            >
                {score}/{max}
            </text>
        </svg>
    );
}

// ─── Main component ───────────────────────────────────────
export default function MockInterview() {
    const navigate = useNavigate();

    // Auth & Premium Check
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const isPremium = currentUser.isPremium;

    // ── Phase: "setup" | "interview" | "results"
    const [phase, setPhase] = useState("setup");

    // ── Setup state
    const [role, setRole] = useState("");
    const [difficulty, setDifficulty] = useState("medium");
    const [questionCount, setQuestionCount] = useState(5);
    const [starting, setStarting] = useState(false);
    const [startError, setStartError] = useState("");

    // ── Interview state
    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answer, setAnswer] = useState("");
    const [evaluating, setEvaluating] = useState(false);
    const [evalError, setEvalError] = useState("");
    const [qna, setQna] = useState([]);   // { question, answer, score, feedback, tip }
    const [skipping, setSkipping] = useState(false);
    const textareaRef = useRef(null);

    // ── Results state
    const [saving, setSaving] = useState(false);
    const [overallScore, setOverallScore] = useState(0);

    // ────────────────── Handlers ──────────────────────────

    const handleStart = async (e) => {
        e.preventDefault();
        if (!role.trim()) return;
        setStartError("");
        setStarting(true);
        try {
            const { data } = await mockStart({ role, difficulty, questionCount });
            setQuestions(data.questions);
            setCurrentIdx(0);
            setQna([]);
            setAnswer("");
            setPhase("interview");
        } catch (err) {
            setStartError(err.response?.data?.message || "Failed to start interview. Try again.");
        } finally {
            setStarting(false);
        }
    };

    const submitAnswer = async (skipped = false) => {
        const finalAnswer = skipped ? "(Skipped)" : answer.trim();
        setEvalError("");
        setEvaluating(true);

        try {
            const { data } = await mockEvaluate({
                role, question: questions[currentIdx], answer: finalAnswer, difficulty,
            });
            const record = {
                question: questions[currentIdx],
                answer: finalAnswer,
                score: data.score,
                feedback: data.feedback,
                tip: data.tip,
            };
            const newQna = [...qna, record];
            setQna(newQna);

            if (currentIdx + 1 < questions.length) {
                setCurrentIdx((i) => i + 1);
                setAnswer("");
                setTimeout(() => textareaRef.current?.focus(), 100);
            } else {
                // All questions done — save & show results
                await finishInterview(newQna);
            }
        } catch (err) {
            setEvalError(err.response?.data?.message || "Evaluation failed. Please try again.");
        } finally {
            setEvaluating(false);
            setSkipping(false);
        }
    };

    const finishInterview = async (finalQna) => {
        setSaving(true);
        try {
            const { data } = await mockSave({ role, difficulty, qna: finalQna });
            setOverallScore(data.overallScore);
        } catch {
            // Still show results even if save fails
            const total = finalQna.reduce((s, q) => s + q.score, 0);
            setOverallScore(Math.round((total / (finalQna.length * 10)) * 100));
        } finally {
            setSaving(false);
            setPhase("results");
        }
    };

    const resetInterview = () => {
        setPhase("setup");
        setRole("");
        setDifficulty("medium");
        setQuestionCount(5);
        setQuestions([]);
        setQna([]);
        setAnswer("");
        setCurrentIdx(0);
        setOverallScore(0);
    };

    // ──────────────── PHASE: SETUP ───────────────────────
    if (phase === "setup") {
        return (
            <div className="mock-wrapper">
                <aside className="qg-sidebar">
                    <Link to="/dashboard" className="sidebar-logo">🧠 <span>AI </span>Interview</Link>
                    <nav className="sidebar-nav">
                        <Link to="/dashboard" className="sidebar-link">📊 Dashboard</Link>
                        <Link to="/generate" className="sidebar-link">🤖 AI Generator</Link>
                        <Link to="/history" className="sidebar-link">📚 History</Link>
                        <Link to="/mock" className="sidebar-link active">🎯 Mock Interview</Link>
                        <Link to="/resume" className="sidebar-link">📄 Resume Analyzer</Link>
                        <Link to="/pricing" className="sidebar-link">⭐ Upgrade to Pro</Link>
                        <Link to="/settings" className="sidebar-link">⚙️ Settings</Link>
                    </nav>
                </aside>

                <main className="mock-main">
                    {!isPremium ? (
                        <div className="paywall-container fade-up" style={{ textAlign: "center", marginTop: "4rem" }}>
                            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔒</div>
                            <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Premium Feature Locked</h2>
                            <p style={{ color: "var(--text-muted)", fontSize: "1.2rem", maxWidth: "500px", margin: "0 auto 2rem auto", lineHeight: "1.6" }}>
                                Unlimited Mock Interviews are only available for <strong>Pro</strong> members.
                                Upgrade your plan to unlock this and start practicing effectively.
                            </p>
                            <Link to="/pricing" className="btn btn-primary" style={{ fontSize: "1.1rem", padding: "1rem 2rem", borderRadius: "8px", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", border: "none" }}>
                                ⭐ View Pricing & Upgrade
                            </Link>
                        </div>
                    ) : (
                        <div className="mock-setup-container">
                            <div className="mock-setup-header">
                                <h1>🎯 Mock Interview</h1>
                                <p>Simulate a real interview. Get AI feedback on every answer.</p>
                            </div>

                            <form className="mock-setup-card fade-up" onSubmit={handleStart}>
                                {/* Role */}
                                <div className="mock-field">
                                    <label>Job Role</label>
                                    <div className="mock-role-wrap">
                                        <input
                                            id="mock-role-input"
                                            type="text"
                                            placeholder="e.g. Frontend Developer"
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            list="mock-role-suggestions"
                                            required
                                            className="mock-input"
                                        />
                                        <datalist id="mock-role-suggestions">
                                            {JOB_ROLES.map((r) => <option key={r} value={r} />)}
                                        </datalist>
                                    </div>
                                </div>

                                {/* Difficulty */}
                                <div className="mock-field">
                                    <label>Difficulty Level</label>
                                    <div className="difficulty-grid">
                                        {Object.entries(DIFFICULTY_CONFIG).map(([key, cfg]) => (
                                            <button
                                                key={key} type="button"
                                                id={`difficulty - ${key} `}
                                                className={`difficulty - card ${difficulty === key ? "active" : ""} `}
                                                style={difficulty === key ? { borderColor: cfg.color, boxShadow: `0 0 0 3px ${cfg.color} 22` } : {}}
                                                onClick={() => setDifficulty(key)}
                                            >
                                                <span className="diff-icon">{cfg.icon}</span>
                                                <span className="diff-label" style={difficulty === key ? { color: cfg.color } : {}}>{cfg.label}</span>
                                                <span className="diff-desc">{cfg.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Question Count */}
                                <div className="mock-field">
                                    <label>Number of Questions — <strong>{questionCount}</strong></label>
                                    <input
                                        id="mock-count-slider"
                                        type="range" min={3} max={10} step={1}
                                        value={questionCount}
                                        onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                                        className="mock-slider"
                                    />
                                    <div className="slider-labels">
                                        <span>3 (Quick)</span>
                                        <span>10 (Full)</span>
                                    </div>
                                </div>

                                {startError && <div className="mock-error">⚠️ {startError}</div>}

                                <button id="start-interview-btn" type="submit" className="btn-start-mock" disabled={starting || !role.trim()}>
                                    {starting ? <><span className="spinner-sm"></span> Preparing Interview…</> : "🎯 Start Interview"}
                                </button>
                            </form>
                        </div>
                    )}
                </main>
            </div>
        );
    }

    // ──────────────── PHASE: INTERVIEW ──────────────────
    if (phase === "interview") {
        const progress = ((currentIdx) / questions.length) * 100;
        return (
            <div className="mock-interview-screen">
                {/* Top Bar */}
                <div className="interview-topbar">
                    <div className="topbar-left">
                        <span className="topbar-logo">🧠 Mock Interview</span>
                        <span className="topbar-role">{role}</span>
                        <span
                            className="topbar-diff"
                            style={{ color: DIFFICULTY_CONFIG[difficulty].color }}
                        >
                            {DIFFICULTY_CONFIG[difficulty].icon} {DIFFICULTY_CONFIG[difficulty].label}
                        </span>
                    </div>
                    <div className="topbar-right">
                        <span className="topbar-counter">{currentIdx + 1} / {questions.length}</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="interview-progress-track">
                    <div className="interview-progress-fill" style={{ width: `${progress}% ` }}></div>
                </div>

                {/* Question + Answer */}
                <div className="interview-body">
                    <div className="interview-q-card fade-up">
                        <div className="iq-number">Q{currentIdx + 1}</div>
                        <div className="iq-text">{questions[currentIdx]}</div>
                    </div>

                    <div className="interview-answer-block fade-up">
                        <label className="answer-label">Your Answer</label>
                        <textarea
                            ref={textareaRef}
                            id="answer-textarea"
                            className="answer-textarea"
                            placeholder="Type your answer here… Be clear, concise, and specific."
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            rows={7}
                            disabled={evaluating}
                            autoFocus
                        />

                        {evalError && <div className="mock-error" style={{ marginTop: "0.75rem" }}>⚠️ {evalError}</div>}

                        <div className="interview-actions">
                            <button
                                id="skip-btn"
                                className="btn-skip"
                                onClick={() => { setSkipping(true); submitAnswer(true); }}
                                disabled={evaluating}
                            >
                                {skipping ? "Skipping…" : "⏭ Skip"}
                            </button>
                            <button
                                id="submit-answer-btn"
                                className="btn-submit-answer"
                                onClick={() => submitAnswer(false)}
                                disabled={evaluating || !answer.trim()}
                            >
                                {evaluating && !skipping
                                    ? <><span className="spinner-sm"></span> Evaluating…</>
                                    : currentIdx + 1 === questions.length ? "✅ Finish Interview" : "Submit & Next →"
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ──────────────── PHASE: RESULTS ────────────────────
    if (phase === "results") {
        const totalScore = qna.reduce((s, q) => s + q.score, 0);
        const maxPossible = qna.length * 10;
        const grade =
            overallScore >= 85 ? { label: "Excellent 🏆", color: "#10b981" } :
                overallScore >= 70 ? { label: "Good 👍", color: "#06b6d4" } :
                    overallScore >= 50 ? { label: "Fair 💪", color: "#f59e0b" } :
                        { label: "Needs Work 📚", color: "#ef4444" };

        return (
            <div className="mock-results-screen">
                {saving && (
                    <div className="saving-overlay">
                        <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }}></div>
                        <p>Saving your session…</p>
                    </div>
                )}

                <div className="results-container">
                    {/* Score Hero */}
                    <div className="results-hero fade-up">
                        <h1>Interview Complete! 🎉</h1>
                        <p className="results-sub">{role} · {DIFFICULTY_CONFIG[difficulty].label}</p>

                        <div className="overall-score-ring">
                            <svg viewBox="0 0 180 180" width="180" height="180">
                                {/* Background circle */}
                                <circle cx="90" cy="90" r="78" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
                                {/* Score arc */}
                                <circle
                                    cx="90" cy="90" r="78" fill="none"
                                    stroke={grade.color} strokeWidth="12"
                                    strokeDasharray={`${(overallScore / 100) * 2 * Math.PI * 78} ${2 * Math.PI * 78} `}
                                    strokeLinecap="round"
                                    transform="rotate(-90 90 90)"
                                    style={{ transition: "stroke-dasharray 1s ease" }}
                                />
                                <text x="90" y="82" textAnchor="middle" fill="white" fontSize="36" fontWeight="800" fontFamily="inherit">{overallScore}%</text>
                                <text x="90" y="108" textAnchor="middle" fill={grade.color} fontSize="14" fontWeight="600" fontFamily="inherit">{grade.label}</text>
                            </svg>
                        </div>

                        <div className="results-meta-row">
                            <div className="results-meta-chip">🧠 {totalScore}/{maxPossible} pts</div>
                            <div className="results-meta-chip">📋 {qna.length} Questions</div>
                            <div className="results-meta-chip" style={{ color: DIFFICULTY_CONFIG[difficulty].color }}>
                                {DIFFICULTY_CONFIG[difficulty].icon} {DIFFICULTY_CONFIG[difficulty].label}
                            </div>
                        </div>
                    </div>

                    {/* Q&A Breakdown */}
                    <div className="results-breakdown">
                        <h2>📋 Detailed Breakdown</h2>
                        {qna.map((item, i) => (
                            <div key={i} id={`result - card - ${i} `} className="result-qa-card fade-up" style={{ animationDelay: `${i * 0.08} s` }}>
                                <div className="rqa-top">
                                    <div className="rqa-q">
                                        <span className="rqa-num">Q{i + 1}</span>
                                        <span className="rqa-text">{item.question}</span>
                                    </div>
                                    <div className="rqa-score-ring">
                                        <ScoreRing score={item.score} />
                                    </div>
                                </div>

                                {item.answer !== "(Skipped)" && (
                                    <div className="rqa-answer">
                                        <span className="rqa-label">Your Answer</span>
                                        <p>{item.answer}</p>
                                    </div>
                                )}
                                {item.answer === "(Skipped)" && (
                                    <div className="rqa-skipped">⏭ Question skipped</div>
                                )}

                                <div className="rqa-feedback">
                                    <span className="rqa-label">AI Feedback</span>
                                    <p>{item.feedback}</p>
                                </div>

                                {item.tip && (
                                    <div className="rqa-tip">
                                        <span>💡</span>
                                        <p>{item.tip}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="results-actions fade-up">
                        <button id="retry-btn" className="btn-retry" onClick={resetInterview}>
                            🔄 Try Again
                        </button>
                        <Link to="/history" className="btn-view-history">
                            📚 View History
                        </Link>
                        <Link to="/dashboard" className="btn-dashboard-link">
                            📊 Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
