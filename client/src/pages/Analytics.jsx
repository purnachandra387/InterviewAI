import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAnalytics } from "../services/api";
import "./Analytics.css";

/* ── Tiny pure-CSS donut chart ── */
function DonutChart({ segments, size = 120, strokeWidth = 18 }) {
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    const displayTotal = total || 0;
    let offset = 0;
    return (
        <svg className="an-donut-svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
            {segments.map((seg, i) => {
                const dash = (seg.value / (total || 1)) * circ;
                const gap = circ - dash;
                const rot = (offset / (total || 1)) * 360 - 90;
                offset += seg.value;
                return (
                    <circle key={i}
                        cx={size / 2} cy={size / 2} r={r}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${dash} ${gap}`}
                        strokeDashoffset={0}
                        transform={`rotate(${rot} ${size / 2} ${size / 2})`}
                        style={{ filter: `drop-shadow(0 0 4px ${seg.color}80)` }}
                    />
                );
            })}
            {displayTotal > 0 && (
                <text x={size / 2} y={size / 2 + 5}
                    textAnchor="middle" fill="#fffffe"
                    fontSize={size * 0.13} fontWeight="800">
                    {displayTotal}
                </text>
            )}
        </svg>
    );
}

/* ── SVG line chart for mock scores ── */
function ScoreLineChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="an-empty">
                <div className="an-empty-icon">🎯</div>
                <p>Complete mock interviews to see your score trend.</p>
            </div>
        );
    }
    const W = 400, H = 120, PAD = 16;
    const scores = data.map(d => d.score);
    const min = Math.max(0, Math.min(...scores) - 10);
    const max = Math.min(100, Math.max(...scores) + 10);
    const range = max - min || 1;
    const pts = data.map((d, i) => ({
        x: PAD + (i / Math.max(data.length - 1, 1)) * (W - PAD * 2),
        y: H - PAD - ((d.score - min) / range) * (H - PAD * 2),
        ...d,
    }));
    const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const areaD = `${pathD} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;

    return (
        <>
            <div className="an-score-chart">
                <svg className="an-score-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6c63ff" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#6c63ff" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path className="an-score-area" d={areaD} />
                    <path className="an-score-line" d={pathD} />
                    {pts.map((p, i) => (
                        <g key={i}>
                            <circle className="an-score-dot" cx={p.x} cy={p.y} r={4} />
                            <title>{p.role} — {p.score}/100 ({p.date})</title>
                        </g>
                    ))}
                </svg>
            </div>
            <div className="an-score-labels">
                {pts.map((p, i) => (
                    <span key={i} style={{ fontSize: "0.62rem" }}>{p.date}</span>
                ))}
            </div>
        </>
    );
}

/* ── Activity bar chart (last 30 days) ── */
function ActivityBarChart({ data }) {
    const maxTotal = Math.max(...data.map(d => d.total), 1);
    // Show every 5th label
    return (
        <>
            <div className="an-bar-chart">
                {data.map((d, i) => (
                    <div key={i} className="an-bar-wrap">
                        <div className="an-tooltip">
                            <strong>{d.label}</strong><br />
                            📝 {d.questions} Q&nbsp;&nbsp;🎯 {d.mocks} Mock&nbsp;&nbsp;📄 {d.resumes} Resume
                        </div>
                        <div className="an-bar an-bar--r"
                            style={{ height: `${(d.resumes / maxTotal) * 90}%` }} />
                        <div className="an-bar an-bar--m"
                            style={{ height: `${(d.mocks / maxTotal) * 90}%` }} />
                        <div className="an-bar an-bar--q"
                            style={{ height: `${(d.questions / maxTotal) * 90}%` }} />
                    </div>
                ))}
            </div>
            <div className="an-bar-xlabels">
                {data.map((d, i) => (
                    <span key={i}>{i % 5 === 0 ? d.label : ""}</span>
                ))}
            </div>
            <div className="an-legend">
                <div className="an-legend-item">
                    <div className="an-legend-dot" style={{ background: "var(--primary)" }} />
                    Questions
                </div>
                <div className="an-legend-item">
                    <div className="an-legend-dot" style={{ background: "var(--accent)" }} />
                    Mock Interviews
                </div>
                <div className="an-legend-item">
                    <div className="an-legend-dot" style={{ background: "var(--success)" }} />
                    Resume Analyses
                </div>
            </div>
        </>
    );
}

export default function Analytics() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getAnalytics()
            .then(res => setData(res.data))
            .catch(err => {
                if (err?.response?.status === 401) navigate("/login");
                else setError("Failed to load analytics. Please try again.");
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="analytics-page">
                <div className="an-loading">
                    <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
                </div>
            </div>
        );
    }

    const { summary, dailyActivity, mockScoreTrend, typeBreakdown, diffBreakdown, topRoles } = data || {};
    const maxRoleCount = topRoles?.length ? Math.max(...topRoles.map(r => r.count)) : 1;

    const summaryCards = [
        { icon: "📝", label: "Questions Generated", value: summary?.totalQuestions ?? 0 },
        { icon: "📚", label: "Practice Sessions", value: summary?.totalSessions ?? 0 },
        { icon: "🎯", label: "Mock Interviews", value: summary?.totalMocks ?? 0 },
        { icon: "📄", label: "Resume Analyses", value: summary?.totalResumes ?? 0 },
        { icon: "⭐", label: "Avg Mock Score", value: summary?.totalMocks ? `${summary.avgMockScore}%` : "—" },
        { icon: "🏆", label: "Best Mock Score", value: summary?.totalMocks ? `${summary.bestMock}%` : "—" },
    ];

    return (
        <div className="analytics-page">
            {/* Navbar */}
            <nav className="navbar">
                <div className="container navbar-inner">
                    <div className="navbar-logo">🧠 <span>Interview</span>AI</div>
                    <div className="navbar-user">
                        <Link to="/dashboard" id="back-dashboard-btn" className="btn"
                            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-muted)", padding: "0.4rem 0.9rem", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 600 }}>
                            ← Dashboard
                        </Link>
                        <button id="analytics-logout-btn" className="btn-logout" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container analytics-body">

                {/* Header */}
                <div className="analytics-header fade-up">
                    <h1>📊 Your <span>Analytics</span></h1>
                    <p>Track your preparation progress, identify trends, and find areas to improve.</p>
                </div>

                {error && (
                    <div className="alert alert-error fade-up">{error}</div>
                )}

                {/* Streak Banner */}
                {summary?.streak > 0 && (
                    <div className="an-streak-banner fade-up">
                        <div className="an-streak-icon">🔥</div>
                        <div className="an-streak-text">
                            <h3><span>{summary.streak}-Day</span> Practice Streak!</h3>
                            <p>You've been consistently preparing. Keep the momentum going!</p>
                        </div>
                    </div>
                )}

                {/* Summary Cards */}
                <div className="an-summary-grid fade-up">
                    {summaryCards.map((c, i) => (
                        <div key={i} className="an-sum-card">
                            <div className="an-sum-icon">{c.icon}</div>
                            <div className="an-sum-value">{c.value}</div>
                            <div className="an-sum-label">{c.label}</div>
                        </div>
                    ))}
                </div>

                {/* Charts Grid */}
                <div className="an-charts-grid fade-up">

                    {/* Activity Bar Chart — full width */}
                    <div className="an-chart-card an-chart-card--full">
                        <div className="an-chart-title">📅 Daily Activity — Last 30 Days</div>
                        <div className="an-chart-sub">Stacked view of questions, mock interviews and resume analyses per day</div>
                        {dailyActivity && dailyActivity.some(d => d.total > 0)
                            ? <ActivityBarChart data={dailyActivity} />
                            : (
                                <div className="an-empty">
                                    <div className="an-empty-icon">📅</div>
                                    <p>No activity yet. Start practicing to see your daily progress!</p>
                                </div>
                            )
                        }
                    </div>

                    {/* Mock Score Trend */}
                    <div className="an-chart-card">
                        <div className="an-chart-title">📈 Mock Score Trend</div>
                        <div className="an-chart-sub">Your last {mockScoreTrend?.length || 0} session scores (0–100)</div>
                        <ScoreLineChart data={mockScoreTrend} />
                    </div>

                    {/* Interview Type Donut */}
                    <div className="an-chart-card">
                        <div className="an-chart-title">🗂️ Question Type Breakdown</div>
                        <div className="an-chart-sub">HR vs Technical vs Mixed sessions</div>
                        {typeBreakdown?.length > 0 ? (
                            <div className="an-donut-wrap">
                                <DonutChart segments={typeBreakdown} />
                                <div className="an-donut-legend">
                                    {typeBreakdown.map((seg, i) => (
                                        <div key={i} className="an-donut-legend-item">
                                            <div className="an-donut-legend-label">
                                                <div className="an-donut-legend-dot" style={{ background: seg.color }} />
                                                {seg.label}
                                            </div>
                                            <div className="an-donut-legend-val">{seg.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="an-empty">
                                <div className="an-empty-icon">🗂️</div>
                                <p>Generate questions to see your type breakdown.</p>
                            </div>
                        )}
                    </div>

                    {/* Difficulty Donut */}
                    <div className="an-chart-card">
                        <div className="an-chart-title">⚡ Mock Difficulty Breakdown</div>
                        <div className="an-chart-sub">Easy, Medium and Hard mock sessions</div>
                        {diffBreakdown?.length > 0 ? (
                            <div className="an-donut-wrap">
                                <DonutChart segments={diffBreakdown} />
                                <div className="an-donut-legend">
                                    {diffBreakdown.map((seg, i) => (
                                        <div key={i} className="an-donut-legend-item">
                                            <div className="an-donut-legend-label">
                                                <div className="an-donut-legend-dot" style={{ background: seg.color }} />
                                                {seg.label}
                                            </div>
                                            <div className="an-donut-legend-val">{seg.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="an-empty">
                                <div className="an-empty-icon">⚡</div>
                                <p>Complete mock interviews to see difficulty breakdown.</p>
                            </div>
                        )}
                    </div>

                    {/* Top Roles */}
                    <div className="an-chart-card an-chart-card--full">
                        <div className="an-chart-title">🏆 Top Roles Practiced</div>
                        <div className="an-chart-sub">Your most-practiced job roles across all sessions</div>
                        {topRoles?.length > 0 ? (
                            <div className="an-roles-list">
                                {topRoles.map((r, i) => (
                                    <div key={i} className="an-role-item">
                                        <div className="an-role-rank">#{i + 1}</div>
                                        <div className="an-role-name">{r.role}</div>
                                        <div className="an-role-bar-track">
                                            <div className="an-role-bar-fill"
                                                style={{ width: `${(r.count / maxRoleCount) * 100}%` }} />
                                        </div>
                                        <div className="an-role-count">{r.count}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="an-empty">
                                <div className="an-empty-icon">🏆</div>
                                <p>Practice different roles to see your top picks here.</p>
                            </div>
                        )}
                    </div>

                </div>

                {/* CTA */}
                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                    <Link to="/mock" id="analytics-mock-cta" className="btn btn-primary"
                        style={{ display: "inline-flex", maxWidth: 260 }}>
                        🎯 Practice a Mock Interview
                    </Link>
                </div>

            </div>
        </div>
    );
}
