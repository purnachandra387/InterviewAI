import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAchievements } from "../services/api";
import "./Achievements.css";

export default function Achievements() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // "all" | "earned" | "locked"

    useEffect(() => {
        getAchievements()
            .then(({ data }) => setData(data))
            .catch(err => {
                if (err?.response?.status === 401) { localStorage.clear(); navigate("/login"); }
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
            <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div>
        </div>
    );

    const achievements = data?.achievements || [];
    const stats = data?.stats || {};

    const earnedList = achievements.filter(a => a.earned);
    const lockedList = achievements.filter(a => !a.earned);

    const filtered = filter === "earned" ? earnedList
        : filter === "locked" ? lockedList
            : achievements;

    const progress = Math.round((earnedList.length / achievements.length) * 100);

    return (
        <div className="achievements-page">
            {/* Navbar */}
            <nav className="navbar">
                <div className="container navbar-inner">
                    <div className="navbar-logo">🧠 <span>Interview</span>AI</div>
                    <div className="navbar-user">
                        <Link to="/dashboard" className="btn" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-muted)", padding: "0.4rem 0.9rem", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 600 }}>← Dashboard</Link>
                        <button className="btn-logout" onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </nav>

            <div className="container ach-body">
                {/* Header */}
                <div className="ach-header fade-up">
                    <div className="ach-header-left">
                        <h1>🏆 Achievements</h1>
                        <p>Track your milestones and unlock badges as you practice</p>
                    </div>
                    <div className="ach-progress-wrap">
                        <div className="ach-progress-label">
                            <span>{earnedList.length} / {achievements.length} Earned</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="ach-progress-bar">
                            <div className="ach-progress-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Stats summary */}
                <div className="ach-stats-row fade-up">
                    <div className="ach-stat">
                        <div className="ach-stat-number">{stats.totalQuestions || 0}</div>
                        <div className="ach-stat-label">Questions</div>
                    </div>
                    <div className="ach-stat">
                        <div className="ach-stat-number">{stats.totalMocks || 0}</div>
                        <div className="ach-stat-label">Mock Interviews</div>
                    </div>
                    <div className="ach-stat">
                        <div className="ach-stat-number">{stats.bestMock || 0}%</div>
                        <div className="ach-stat-label">Best Score</div>
                    </div>
                    <div className="ach-stat">
                        <div className="ach-stat-number">🔥 {stats.streak || 0}</div>
                        <div className="ach-stat-label">Day Streak</div>
                    </div>
                    <div className="ach-stat">
                        <div className="ach-stat-number">{earnedList.length}</div>
                        <div className="ach-stat-label">Badges Earned</div>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="ach-filter-tabs">
                    {["all", "earned", "locked"].map(f => (
                        <button
                            key={f}
                            className={`ach-tab ${filter === f ? "active" : ""}`}
                            onClick={() => setFilter(f)}
                        >
                            {f === "all" ? `All (${achievements.length})`
                                : f === "earned" ? `🏅 Earned (${earnedList.length})`
                                    : `🔒 Locked (${lockedList.length})`}
                        </button>
                    ))}
                </div>

                {/* Achievement Grid */}
                <div className="ach-grid fade-up">
                    {filtered.map(ach => (
                        <div key={ach.slug} className={`ach-card ${ach.earned ? "earned" : "locked"}`}>
                            <div className="ach-card-icon">
                                {ach.earned ? ach.icon : "🔒"}
                            </div>
                            <div className="ach-card-title">{ach.title}</div>
                            <div className="ach-card-desc">{ach.desc}</div>
                            {ach.earned && (
                                <div className="ach-earned-badge">✓ Earned</div>
                            )}
                        </div>
                    ))}

                    {filtered.length === 0 && (
                        <div className="ach-empty">
                            <div style={{ fontSize: "3rem" }}>🎯</div>
                            <div>Start practicing to unlock achievements!</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
