import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "./QuestionGenerator.css";

const JOB_ROLES = [
    "Frontend Developer", "Backend Developer", "Full Stack Developer",
    "Data Scientist", "Machine Learning Engineer", "DevOps Engineer",
    "Android Developer", "iOS Developer", "UI/UX Designer",
    "Product Manager", "Java Developer", "Python Developer",
    "React Developer", "Node.js Developer", "Software Engineer",
];

export default function QuestionGenerator() {
    const [role, setRole] = useState("");
    const [type, setType] = useState("both");
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [generated, setGenerated] = useState(false);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!role.trim()) return;
        setError("");
        setLoading(true);
        setQuestions([]);
        setGenerated(false);

        try {
            const { data } = await API.post("/ai/generate", { role, type });
            setQuestions(data.questions);
            setGenerated(true);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to generate questions. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const typeLabels = { hr: "🤝 HR", technical: "💻 Technical", both: "🎯 Mixed" };

    return (
        <div className="qg-wrapper">
            {/* Sidebar */}
            <aside className="qg-sidebar">
                <Link to="/dashboard" className="sidebar-logo">🧠 <span>Interview</span>AI</Link>
                <nav className="sidebar-nav">
                    <Link to="/dashboard" className="sidebar-link">📊 Dashboard</Link>
                    <Link to="/generate" className="sidebar-link active">🤖 AI Generator</Link>
                    <Link to="/history" className="sidebar-link">📚 History</Link>
                    <Link to="/mock" className="sidebar-link">🎯 Mock Interview</Link>
                    <Link to="/resume" className="sidebar-link">📄 Resume Analyzer</Link>
                    <Link to="/analytics" className="sidebar-link">📊 Analytics</Link>
                    <Link to="/pricing" className="sidebar-link">⭐ Upgrade to Pro</Link>
                    <Link to="/settings" className="sidebar-link">⚙️ Settings</Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="qg-main">
                <div className="qg-header">
                    <h1>🤖 AI Question Generator</h1>
                    <p>Generate smart, role-specific interview questions instantly</p>
                </div>

                {/* Generator Form */}
                <div className="qg-form-card">
                    <form onSubmit={handleGenerate}>
                        <div className="qg-inputs">
                            {/* Role Input */}
                            <div className="qg-field">
                                <label>Job Role</label>
                                <div className="qg-role-input">
                                    <input
                                        id="role-input"
                                        type="text"
                                        placeholder="e.g. Frontend Developer"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        list="role-suggestions"
                                        required
                                    />
                                    <datalist id="role-suggestions">
                                        {JOB_ROLES.map((r) => <option key={r} value={r} />)}
                                    </datalist>
                                </div>
                            </div>

                            {/* Question Type */}
                            <div className="qg-field">
                                <label>Question Type</label>
                                <div className="type-tabs">
                                    {["both", "hr", "technical"].map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            id={`type-${t}`}
                                            className={`type-tab ${type === t ? "active" : ""}`}
                                            onClick={() => setType(t)}
                                        >
                                            {typeLabels[t]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {error && <div className="qg-error">⚠️ {error}</div>}

                        <button id="generate-btn" type="submit" className="btn-generate" disabled={loading || !role.trim()}>
                            {loading ? (
                                <><span className="spinner-sm"></span> Generating with AI…</>
                            ) : (
                                <> ✨ Generate Questions</>
                            )}
                        </button>
                    </form>
                </div>

                {/* Loading shimmer */}
                {loading && (
                    <div className="questions-list">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="question-card shimmer"></div>
                        ))}
                    </div>
                )}

                {/* Results */}
                {generated && !loading && questions.length > 0 && (
                    <div className="qg-results">
                        <div className="results-header">
                            <h2>📋 Questions for <span>{role}</span></h2>
                            <span className="results-count">{questions.length} questions</span>
                        </div>
                        <div className="questions-list">
                            {questions.map((q, i) => (
                                <div key={i} id={`question-${i}`} className="question-card fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
                                    <div className="q-number">{i + 1}</div>
                                    <div className="q-text">{q}</div>
                                    <button
                                        className="q-copy"
                                        title="Copy question"
                                        onClick={() => navigator.clipboard.writeText(q)}
                                    >📋</button>
                                </div>
                            ))}
                        </div>
                        <button
                            id="regenerate-btn"
                            className="btn-regenerate"
                            onClick={handleGenerate}
                        >
                            🔄 Regenerate
                        </button>
                    </div>
                )}

                {generated && !loading && questions.length === 0 && (
                    <div className="qg-empty">
                        <p>No questions returned. Please try a different role or type.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
