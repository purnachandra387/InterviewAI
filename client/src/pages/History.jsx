import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getHistory, deleteHistorySession, getMockHistory } from "../services/api";
import "./History.css";

const TYPE_LABELS = {
    hr: { label: "HR", color: "#06b6d4" },
    technical: { label: "Technical", color: "#8b5cf6" },
    both: { label: "Mixed", color: "#f59e0b" },
};

const DIFF_LABELS = {
    easy: { label: "Easy", color: "#10b981", icon: "🌱" },
    medium: { label: "Medium", color: "#f59e0b", icon: "🔥" },
    hard: { label: "Hard", color: "#ef4444", icon: "⚡" },
};

export default function History() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [mockSessions, setMockSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState("questions"); // "questions" | "mocks"
    const [filter, setFilter] = useState("all");   // all | hr | technical | both | easy | medium | hard
    const [search, setSearch] = useState("");
    const [expanded, setExpanded] = useState({});      // { [id]: bool }
    const [deletingId, setDeletingId] = useState(null);

    const fetchHistory = useCallback(async () => {
        try {
            const [qRes, mRes] = await Promise.all([
                getHistory().catch(() => ({ data: [] })),
                getMockHistory().catch(() => ({ data: [] }))
            ]);
            setSessions(qRes.data || []);
            setMockSessions(mRes.data || []);
        } catch (err) {
            if (err?.response?.status === 401 || err?.response?.status === 403) {
                localStorage.clear();
                navigate("/login");
                return;
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const toggleExpand = (id) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this session? This cannot be undone.")) return;
        setDeletingId(id);
        try {
            if (view === "questions") {
                await deleteHistorySession(id);
                setSessions((prev) => prev.filter((s) => s._id !== id));
            } else {
                // Not implementing mock deletion here immediately, but keeping UI intact for future
                alert("Mock session deletion is disabled in this view.");
            }
        } catch {
            alert("Failed to delete. Please try again.");
        } finally {
            setDeletingId(null);
        }
    };

    const currentList = view === "questions" ? sessions : mockSessions;

    const filtered = currentList.filter((s) => {
        const matchType = filter === "all" || (view === "questions" ? s.type === filter : s.difficulty === filter);
        const matchSearch = s.role.toLowerCase().includes(search.toLowerCase());
        return matchType && matchSearch;
    });

    const getFilterTabs = () => {
        if (view === "questions") {
            return ["all", "both", "hr", "technical"].map((f) => (
                <button
                    key={f} id={`filter-${f}`}
                    className={`filter-tab ${filter === f ? "active" : ""}`}
                    onClick={() => setFilter(f)}
                >
                    {f === "all" ? "🗂 All" : f === "both" ? "🎯 Mixed" : f === "hr" ? "🤝 HR" : "💻 Technical"}
                </button>
            ));
        } else {
            return ["all", "easy", "medium", "hard"].map((f) => (
                <button
                    key={f} id={`filter-${f}`}
                    className={`filter-tab ${filter === f ? "active" : ""}`}
                    onClick={() => setFilter(f)}
                >
                    {f === "all" ? "🗂 All" : f === "easy" ? "🌱 Easy" : f === "medium" ? "🔥 Medium" : "⚡ Hard"}
                </button>
            ));
        }
    };

    return (
        <div className="history-wrapper">
            {/* Sidebar */}
            <aside className="qg-sidebar">
                <Link to="/dashboard" className="sidebar-logo">🧠 <span>Interview</span>AI</Link>
                <nav className="sidebar-nav">
                    <Link to="/dashboard" className="sidebar-link">📊 Dashboard</Link>
                    <Link to="/generate" className="sidebar-link">🤖 AI Generator</Link>
                    <Link to="/history" className="sidebar-link active">📚 History</Link>
                    <Link to="/mock" className="sidebar-link">🎯 Mock Interview</Link>
                    <Link to="/resume" className="sidebar-link">📄 Resume Analyzer</Link>
                    <Link to="/analytics" className="sidebar-link">📊 Analytics</Link>
                    <Link to="/pricing" className="sidebar-link">⭐ Upgrade to Pro</Link>
                    <Link to="/settings" className="sidebar-link">⚙️ Settings</Link>
                </nav>
            </aside>

            {/* Main */}
            <main className="history-main">
                <div className="history-header">
                    <div>
                        <h1>📚 History</h1>
                        <p>All your past practice sessions and mock interviews</p>
                    </div>
                    <Link to={view === "questions" ? "/generate" : "/mock"} id="new-session-btn" className="btn-new-session">
                        ✨ New {view === "questions" ? "Questions" : "Mock"}
                    </Link>
                </div>

                {/* Main View Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <button
                        style={{ background: 'none', border: 'none', borderBottom: view === 'questions' ? '2px solid var(--primary)' : '2px solid transparent', color: view === 'questions' ? 'var(--primary)' : 'var(--text-muted)', padding: '0.8rem 1.2rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                        onClick={() => { setView("questions"); setFilter("all"); }}
                    >📋 Question Practice</button>
                    <button
                        style={{ background: 'none', border: 'none', borderBottom: view === 'mocks' ? '2px solid var(--primary)' : '2px solid transparent', color: view === 'mocks' ? 'var(--primary)' : 'var(--text-muted)', padding: '0.8rem 1.2rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                        onClick={() => { setView("mocks"); setFilter("all"); }}
                    >🎯 Mock Interviews</button>
                </div>

                {/* Controls */}
                <div className="history-controls">
                    <div className="history-search-wrap">
                        <span className="search-icon">🔍</span>
                        <input
                            id="history-search"
                            type="text"
                            placeholder="Search by role…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="history-search"
                        />
                    </div>
                    <div className="filter-tabs">
                        {getFilterTabs()}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="history-loading">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="session-card shimmer" style={{ height: 88 }}></div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="history-empty fade-up">
                        <div className="empty-icon">📭</div>
                        <h3>{currentList.length === 0 ? "No sessions yet!" : "No matches found"}</h3>
                        <p>
                            {currentList.length === 0
                                ? `Complete your first ${view === "questions" ? "question generation" : "mock interview"} to see it here.`
                                : "Try adjusting your search or filter."}
                        </p>
                        {currentList.length === 0 && (
                            <Link to={view === "questions" ? "/generate" : "/mock"} className="btn-new-session" style={{ marginTop: "1rem", display: "inline-block" }}>
                                ✨ Start Now
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="sessions-list">
                        <div className="sessions-count">{filtered.length} session{filtered.length !== 1 ? "s" : ""}</div>
                        {filtered.map((s) => {
                            if (view === "mocks") {
                                const diff = DIFF_LABELS[s.difficulty || "medium"];
                                const rankColor = s.overallScore >= 80 ? "#10b981" : s.overallScore >= 50 ? "#f59e0b" : "#ef4444";
                                return (
                                    <div key={s._id} className="session-card fade-up">
                                        <div className="session-header">
                                            <div className="session-meta">
                                                <span className="session-role">{s.role}</span>
                                                <span className="session-badges">
                                                    <span className="type-badge" style={{ background: diff.color + "22", color: diff.color, border: `1px solid ${diff.color}44` }}>
                                                        {diff.icon} {diff.label}
                                                    </span>
                                                    <span className="q-count-badge" style={{ color: rankColor, borderColor: rankColor + "44", background: rankColor + "11" }}>
                                                        {s.overallScore}%
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="session-right">
                                                <span className="session-date">
                                                    {new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                </span>
                                                <Link to={`/mock/review/${s._id}`} className="btn-new-session" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>View Detail →</Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            } else {
                                const isOpen = !!expanded[s._id];
                                const typeInfo = TYPE_LABELS[s.type] || TYPE_LABELS["both"];
                                return (
                                    <div key={s._id} id={`session-${s._id}`} className={`session-card fade-up ${isOpen ? "open" : ""}`}>
                                        <div className="session-header" onClick={() => toggleExpand(s._id)}>
                                            <div className="session-meta">
                                                <span className="session-role">{s.role}</span>
                                                <span className="session-badges">
                                                    <span className="type-badge" style={{ background: typeInfo.color + "22", color: typeInfo.color, border: `1px solid ${typeInfo.color}44` }}>
                                                        {typeInfo.label}
                                                    </span>
                                                    <span className="q-count-badge">{s.questions.length} Qs</span>
                                                </span>
                                            </div>
                                            <div className="session-right">
                                                <span className="session-date">
                                                    {new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                </span>
                                                <span className={`chevron ${isOpen ? "up" : "down"}`}>▾</span>
                                            </div>
                                        </div>

                                        {isOpen && (
                                            <div className="session-questions">
                                                {s.questions.map((q, qi) => (
                                                    <div key={qi} className="session-q-item">
                                                        <span className="q-num">{qi + 1}</span>
                                                        <span className="q-body">{q}</span>
                                                        <button
                                                            className="q-copy-btn"
                                                            title="Copy question"
                                                            onClick={() => navigator.clipboard.writeText(q)}
                                                        >📋</button>
                                                    </div>
                                                ))}
                                                <div className="session-footer">
                                                    <button id={`delete-${s._id}`} className="btn-delete-session" onClick={() => handleDelete(s._id)} disabled={deletingId === s._id}>
                                                        {deletingId === s._id ? "Deleting…" : "🗑 Delete Session"}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
