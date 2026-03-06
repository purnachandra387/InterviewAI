import React, { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { analyzeResume } from "../services/api";
import axios from "axios";
import "./ResumeAnalyzer.css";

const ResumeSidebar = () => (
    <aside className="qg-sidebar">
        <Link to="/dashboard" className="sidebar-logo">🧠 <span>Interview</span>AI</Link>
        <nav className="sidebar-nav">
            <Link to="/dashboard" className="sidebar-link">📊 Dashboard</Link>
            <Link to="/generate" className="sidebar-link">🤖 AI Generator</Link>
            <Link to="/history" className="sidebar-link">📚 History</Link>
            <Link to="/mock" className="sidebar-link">🎯 Mock Interview</Link>
            <Link to="/resume" className="sidebar-link active">📄 Resume Analyzer</Link>
            <Link to="/analytics" className="sidebar-link">📊 Analytics</Link>
            <Link to="/pricing" className="sidebar-link">⭐ Upgrade to Pro</Link>
            <Link to="/settings" className="sidebar-link">⚙️ Settings</Link>
        </nav>
    </aside>
);

// ─── Small score ring ────────────────────────────────────────
function ScoreRing({ score, size = 140 }) {
    const r = (size - 14) / 2;
    const circ = 2 * Math.PI * r;
    const fill = (score / 100) * circ;
    const color = score >= 80 ? "#10b981" : score >= 60 ? "#06b6d4" : score >= 40 ? "#f59e0b" : "#ef4444";
    const grade = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Needs Work";

    return (
        <div className="score-ring-wrap">
            <svg width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={12} />
                <circle
                    cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke={color} strokeWidth={12}
                    strokeDasharray={`${fill} ${circ}`}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ transition: "stroke-dasharray 1.2s ease" }}
                />
                <text x="50%" y="44%" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={size * 0.2} fontWeight="800" fontFamily="inherit">{score}</text>
                <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle" fill={color} fontSize={size * 0.1} fontWeight="600" fontFamily="inherit">{grade}</text>
            </svg>
        </div>
    );
}

// ─── Section checklist item ──────────────────────────────────
function SectionItem({ label, present }) {
    return (
        <div className={`section-item ${present ? "present" : "missing"}`}>
            <span className="section-dot">{present ? "✅" : "❌"}</span>
            <span>{label}</span>
        </div>
    );
}

// ─── Main component ──────────────────────────────────────────
export default function ResumeAnalyzer() {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const isPremium = currentUser.isPremium;
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);

    // ── File handling
    const handleFile = (f) => {
        if (!f) return;
        if (f.type !== "application/pdf") {
            setError("Only PDF files are accepted.");
            return;
        }
        if (f.size > 5 * 1024 * 1024) {
            setError("File is too large. Maximum size is 5 MB.");
            return;
        }
        setError("");
        setFile(f);
        setResult(null);
    };

    const onInputChange = (e) => handleFile(e.target.files[0]);

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        handleFile(f);
    }, []);

    const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
    const onDragLeave = () => setDragging(false);

    // ── Analyze
    const handleAnalyze = async () => {
        if (!file) return;
        setError("");
        setAnalyzing(true);
        setProgress(0);
        setResult(null);

        // Fake progress animation
        const interval = setInterval(() => {
            setProgress((p) => (p < 88 ? p + Math.random() * 12 : p));
        }, 600);

        try {
            const formData = new FormData();
            formData.append("resume", file);

            const res = await axios.post("https://interviewai-backend-0k7p.onrender.com/api/resume/analyze", formData);

            setProgress(100);
            setTimeout(() => {
                setResult(res.data);
            }, 500);
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Analysis failed. Please try again.");
        } finally {
            clearInterval(interval);
            setAnalyzing(false);
        }
    };

    const resetAll = () => {
        setFile(null);
        setResult(null);
        setError("");
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };


    // ────────────────── Results view ─────────────────────────
    if (result) {
        return (
            <div className="resume-wrapper">
                <ResumeSidebar />
                <main className="resume-main">
                    <div className="resume-results-header">
                        <div>
                            <h1>📄 Resume Analysis</h1>
                            <p className="resume-filename">📎 {file?.name}</p>
                        </div>
                        <button id="analyze-another-btn" className="btn-analyze-another" onClick={resetAll}>
                            ⬆️ Analyze Another
                        </button>
                    </div>

                    <div className="score-hero fade-up">
                        <ScoreRing score={Math.min(result.score, 100)} />
                        <div className="score-hero-text">
                            <h2>Overall Score: {Math.min(result.score, 100)} / 100</h2>
                            <p className="score-summary">Based on your technical keywords and basic layout structures.</p>
                        </div>
                    </div>

                    <div className="sw-grid fade-up">
                        <div className="sw-card strengths-card">
                            <h3>✅ Detected Skills</h3>
                            {result.foundSkills && result.foundSkills.length > 0 ? (
                                <div className="kw-chips" style={{ marginTop: "15px" }}>
                                    {result.foundSkills.map((skill, index) => (
                                        <span key={index} className="kw-chip found" style={{ textTransform: "capitalize" }}>{skill}</span>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ marginTop: "15px", color: "#777" }}>No known technical skills matched.</p>
                            )}
                        </div>
                        <div className="sw-card weaknesses-card">
                            <h3>🚀 Suggestions for Improvement</h3>
                            <ul style={{ marginTop: "15px", paddingLeft: "20px" }}>
                                {result.suggestions && result.suggestions.length > 0 ? (
                                    result.suggestions.map((suggestion, index) => (
                                        <li key={index} style={{ marginBottom: "10px", lineHeight: 1.5 }}>{suggestion}</li>
                                    ))
                                ) : (
                                    <p style={{ color: "#777" }}>Your resume looks solid. Keep it up!</p>
                                )}
                            </ul>
                        </div>
                    </div>

                </main>
            </div>
        );
    }

    // Removed premium paywall to enable free resume uploading feature per request

    return (
        <div className="resume-wrapper">
            <ResumeSidebar />
            <main className="resume-main">
                <div className="resume-upload-header fade-up">
                    <h1>📄 Resume Analyzer</h1>
                    <p>Upload your PDF resume and get instant AI-powered feedback to land your dream job.</p>
                </div>

                {/* Drop Zone */}
                <div
                    id="drop-zone"
                    className={`drop-zone fade-up ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onClick={() => !file && fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={onInputChange}
                        style={{ display: "none" }}
                        id="resume-file-input"
                    />

                    {!file ? (
                        <>
                            <div className="drop-icon">📤</div>
                            <p className="drop-title">Drag & drop your resume here</p>
                            <p className="drop-sub">or click to browse — PDF only, max 5 MB</p>
                        </>
                    ) : (
                        <>
                            <div className="drop-icon">📄</div>
                            <p className="drop-title file-name">{file.name}</p>
                            <p className="drop-sub">{(file.size / 1024).toFixed(1)} KB · PDF</p>
                            <button
                                className="btn-change-file"
                                onClick={(e) => { e.stopPropagation(); resetAll(); }}
                            >✕ Remove</button>
                        </>
                    )}
                </div>

                {error && <div className="resume-error fade-up">⚠️ {error}</div>}

                {/* Analyze Button */}
                {file && !analyzing && (
                    <button
                        id="analyze-btn"
                        className="btn-analyze fade-up"
                        onClick={handleAnalyze}
                    >
                        🔍 Analyze Resume
                    </button>
                )}

                {/* Progress */}
                {analyzing && (
                    <div className="analyze-progress fade-up">
                        <div className="progress-label">
                            <span>🤖 AI is analyzing your resume…</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className="progress-hint">Checking ATS score, keywords, strengths &amp; improvements…</p>
                    </div>
                )}

                {/* Tips */}
                <div className="upload-tips fade-up">
                    <h3>💡 Tips for a better score</h3>
                    <ul>
                        <li>✅ Use a text-based PDF (not a scanned image)</li>
                        <li>✅ Include all key sections: Contact, Summary, Experience, Education, Skills</li>
                        <li>✅ Use industry-standard keywords for your target role</li>
                        <li>✅ Quantify achievements (e.g. "Increased sales by 30%")</li>
                        <li>✅ Keep formatting clean — avoid heavy graphics or tables</li>
                    </ul>
                </div>
            </main>
        </div>
    );
}
