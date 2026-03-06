import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCoachTip, getAchievements } from "../services/api";
import "./Coach.css";

const TIPS_CATEGORIES = [
    {
        icon: "🎯", cat: "Behavioral", color: "#6c63ff", tips: [
            "Use the STAR framework: Situation, Task, Action, Result for every behavioral question.",
            "Prepare at least 5 strong stories from your past experience covering leadership, conflict, failure, and success.",
            "Be specific with numbers. 'Improved performance by 40%' is better than 'improved performance significantly'.",
        ]
    },
    {
        icon: "⚡", cat: "Technical", color: "#ff6584", tips: [
            "Think aloud during technical interviews. Your reasoning process is as valuable as the answer.",
            "Practice whiteboard coding for 15 minutes daily. Focus on clean code, edge cases, and time complexity.",
            "Review the top 20 LeetCode problems for your target role. Patterns repeat more than you think.",
        ]
    },
    {
        icon: "🧠", cat: "Mindset", color: "#22c55e", tips: [
            "Treat every rejection as data. Ask for feedback when possible and iterate on your approach.",
            "Confidence comes from preparation. The more mock interviews you do, the more natural you'll feel.",
            "Interview anxiety is normal. Channel it into energy. Interviewers want you to succeed.",
        ]
    },
    {
        icon: "💼", cat: "Strategy", color: "#f59e0b", tips: [
            "Apply to your 'stretch' companies first, then dream companies after practice.",
            "Network actively. 70% of jobs are filled through referrals before being publicly posted.",
            "Research companies deeply: read their engineering blog, recent news, and glassdoor reviews.",
        ]
    },
];

export default function Coach() {
    const navigate = useNavigate();
    const [tip, setTip] = useState(null);
    const [date, setDate] = useState("");
    const [stats, setStats] = useState(null);
    const [activeCategory, setActiveCategory] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.allSettled([
            getCoachTip(),
            getAchievements(),
        ]).then(([tipRes, achRes]) => {
            if (tipRes.status === "fulfilled") {
                setTip(tipRes.value.data.tip);
                setDate(tipRes.value.data.date);
            }
            if (achRes.status === "fulfilled") {
                setStats(achRes.value.data.stats);
            }
        }).catch(err => {
            if (err?.response?.status === 401) { localStorage.clear(); navigate("/login"); }
        }).finally(() => setLoading(false));
    }, [navigate]);

    const handleLogout = () => { localStorage.clear(); navigate("/login"); };

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
            <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div>
        </div>
    );

    return (
        <div className="coach-page">
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

            <div className="container coach-body">

                {/* Daily Tip Hero */}
                <div className="coach-hero fade-up">
                    <div className="coach-hero-badge">📅 {date}</div>
                    <h1>Your Daily Coach Tip</h1>
                    <div className="coach-tip-card">
                        <div className="coach-tip-icon">{tip?.icon}</div>
                        <p className="coach-tip-text">{tip?.tip}</p>
                    </div>
                </div>

                {/* Progress Snapshot */}
                {stats && (
                    <div className="coach-progress-section fade-up">
                        <h2>📊 Your Progress Snapshot</h2>
                        <div className="coach-progress-grid">
                            <div className="coach-prog-card">
                                <div className="cpp-icon">🧠</div>
                                <div className="cpp-value">{stats.totalQuestions}</div>
                                <div className="cpp-label">Questions Generated</div>
                                <div className="cpp-bar-wrap">
                                    <div className="cpp-bar" style={{ width: `${Math.min((stats.totalQuestions / 50) * 100, 100)}%`, background: "#6c63ff" }}></div>
                                </div>
                                <div className="cpp-goal">Goal: 50</div>
                            </div>
                            <div className="coach-prog-card">
                                <div className="cpp-icon">🎯</div>
                                <div className="cpp-value">{stats.totalMocks}</div>
                                <div className="cpp-label">Mock Interviews</div>
                                <div className="cpp-bar-wrap">
                                    <div className="cpp-bar" style={{ width: `${Math.min((stats.totalMocks / 10) * 100, 100)}%`, background: "#ff6584" }}></div>
                                </div>
                                <div className="cpp-goal">Goal: 10</div>
                            </div>
                            <div className="coach-prog-card">
                                <div className="cpp-icon">⭐</div>
                                <div className="cpp-value">{stats.bestMock || 0}%</div>
                                <div className="cpp-label">Best Mock Score</div>
                                <div className="cpp-bar-wrap">
                                    <div className="cpp-bar" style={{ width: `${stats.bestMock || 0}%`, background: "#f59e0b" }}></div>
                                </div>
                                <div className="cpp-goal">Goal: 90%</div>
                            </div>
                            <div className="coach-prog-card">
                                <div className="cpp-icon">🔥</div>
                                <div className="cpp-value">{stats.streak || 0}</div>
                                <div className="cpp-label">Day Streak</div>
                                <div className="cpp-bar-wrap">
                                    <div className="cpp-bar" style={{ width: `${Math.min(((stats.streak || 0) / 7) * 100, 100)}%`, background: "#22c55e" }}></div>
                                </div>
                                <div className="cpp-goal">Goal: 7 days</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Advice Categories */}
                <div className="coach-advice-section fade-up">
                    <h2>🎓 Interview Playbook</h2>
                    <div className="coach-cat-tabs">
                        {TIPS_CATEGORIES.map((cat, i) => (
                            <button
                                key={i}
                                className={`coach-cat-tab ${activeCategory === i ? "active" : ""}`}
                                style={{ "--cat-color": cat.color }}
                                onClick={() => setActiveCategory(i)}
                            >
                                {cat.icon} {cat.cat}
                            </button>
                        ))}
                    </div>

                    <div className="coach-tips-list">
                        {TIPS_CATEGORIES[activeCategory].tips.map((t, i) => (
                            <div key={i} className="coach-tip-row" style={{ "--delay": `${i * 0.08}s` }}>
                                <div className="coach-tip-num">0{i + 1}</div>
                                <p>{t}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div className="coach-quick-links fade-up">
                    <h2>🚀 Keep Practicing</h2>
                    <div className="coach-links-grid">
                        <Link to="/generate" className="coach-link-card">
                            <span>🤖</span>
                            <div>
                                <div className="clc-title">Generate Questions</div>
                                <div className="clc-desc">Practice with AI-generated questions for your role</div>
                            </div>
                        </Link>
                        <Link to="/mock" className="coach-link-card">
                            <span>🎯</span>
                            <div>
                                <div className="clc-title">Start Mock Interview</div>
                                <div className="clc-desc">Simulate a full interview with AI evaluation</div>
                            </div>
                        </Link>
                        <Link to="/resume" className="coach-link-card">
                            <span>📄</span>
                            <div>
                                <div className="clc-title">Analyze Resume</div>
                                <div className="clc-desc">Get AI feedback on your resume to stand out</div>
                            </div>
                        </Link>
                        <Link to="/achievements" className="coach-link-card">
                            <span>🏆</span>
                            <div>
                                <div className="clc-title">View Achievements</div>
                                <div className="clc-desc">See your badges and unlocked milestones</div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
