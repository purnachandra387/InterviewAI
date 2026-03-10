import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { getProfile, getStats, getMockHistory, globalSearch } from "../services/api";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";

export default function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();

    // Check for payment success params
    const searchParams = new URLSearchParams(location.search);
    const paymentStatus = searchParams.get("payment");

    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ totalQuestions: 0, totalSessions: 0 });
    const [mockCount, setMockCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const [selectedRole, setSelectedRole] = useState("Frontend Developer");

    // ── Search ────────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const searchRef = useRef(null);
    const searchTimeout = useRef(null);

    const doSearch = useCallback(async (q) => {
        if (q.trim().length < 2) { setSearchResults([]); setSearchOpen(false); return; }
        setSearchLoading(true);
        try {
            const { data } = await globalSearch(q);
            setSearchResults(data.results || []);
            setSearchOpen(true);
        } catch { /* */ } finally { setSearchLoading(false); }
    }, []);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        clearTimeout(searchTimeout.current);
        if (val.trim().length < 2) { setSearchResults([]); setSearchOpen(false); return; }
        searchTimeout.current = setTimeout(() => doSearch(val), 350);
    };

    // Close search on outside click
    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await getProfile();
                setUser(data);
            } catch (err) {
                if (err?.response?.status === 401 || err?.response?.status === 403) {
                    localStorage.clear();
                    navigate("/login");
                    return;
                }
            }

            const [statsResult, mockResult] = await Promise.allSettled([
                getStats(),
                getMockHistory(),
            ]);

            if (statsResult.status === "fulfilled") {
                setStats(statsResult.value.data);
            }
            if (mockResult.status === "fulfilled") {
                setMockCount(mockResult.value.data.length);
            }

            setLoading(false);
        };
        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
                <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div>
            </div>
        );
    }

    const actions = [
        { icon: "🤖", title: "AI Question Generator", desc: "Generate smart interview questions by job role", link: "/generate" },
        { icon: "📚", title: "Question History", desc: "Review all your past practice sessions", link: "/history" },
        { icon: "🎯", title: "Mock Interview", desc: "Simulate a full AI-powered mock interview", link: "/mock" },
        { icon: "📄", title: "Resume Analyzer", desc: "Get AI feedback on your resume instantly", link: "/resume" },
        { icon: "🎓", title: "Day 13 Interview", desc: "Simple robust mock interview simulator built in Day 13", link: "/day13" },
        { icon: "📅", title: "Interview History", desc: "View your past AI Interview results and scores", link: "/interview-history" },
        { icon: "📊", title: "Analytics & Insights", desc: "Track scores, trends and your practice streak", link: "/analytics" },
        { icon: "🤝", title: "AI Coach", desc: "Get personalized daily tips and coaching advice", link: "/coach" },
        { icon: "🏆", title: "Achievements", desc: "View your badges and milestones earned so far", link: "/achievements" },
        { icon: "🏢", title: "Company Prep", desc: "Tailored questions and tips for your target company", link: "/company" },
        { icon: "📝", title: "Practice Journal", desc: "Log insights, lessons and interview reflections", link: "/journal" },
        { icon: "🗺️", title: "Career Roadmap", desc: "Generate a custom roadmap for your next role", link: "/roadmap" },
        { icon: "💬", title: "HR Interview", desc: "Practice common behavioral and HR questions", link: "/hr-interview" },
        { icon: "🔥", title: "Daily Challenge", desc: "3 new bite-sized interview questions every day", link: "/daily-challenge" },
        { icon: "📈", title: "Progress Tracker", desc: "View detailed performance charts and score averages", link: "/progress" },
        { icon: "✅", title: "Preparation Tracker", desc: "Manage and cross off all your interview prep tasks", link: "/tracker" },
        { icon: "⭐", title: "Upgrade to Pro", desc: "Unlock unlimited mock interviews and resume checks", link: "/pricing" },
    ];

    if (user?.role === "admin") {
        actions.unshift({ icon: "Admin", title: "Admin Dashboard", desc: "View platform-wide metrics and recent users", link: "/admin" });
    }

    return (
        <div className="dashboard">
            {/* Navbar */}
            <nav className="navbar">
                <div className="container navbar-inner">
                    <div className="navbar-logo">🧠 <span>Interview</span>AI</div>

                    {/* Search Bar */}
                    <div className="dash-search-wrap" ref={searchRef}>
                        <div className="dash-search-inner">
                            <span className="dash-search-icon">🔍</span>
                            <input
                                id="global-search-input"
                                className="dash-search-input"
                                type="text"
                                placeholder="Search roles, sessions…"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
                            />
                            {searchLoading && <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2, flexShrink: 0 }}></div>}
                        </div>
                        {searchOpen && (
                            <div className="dash-search-results">
                                {searchResults.length === 0 ? (
                                    <div className="dash-search-empty">No results found</div>
                                ) : searchResults.map((r, i) => (
                                    <div
                                        key={i}
                                        className="dash-search-item"
                                        onClick={() => { navigate(r.link); setSearchOpen(false); setSearchQuery(""); }}
                                    >
                                        <span>{r.icon}</span>
                                        <div>
                                            <div className="dsi-title">{r.title}</div>
                                            <div className="dsi-sub">{r.subtitle} · {r.date}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="navbar-user">
                        <span className="user-badge">👤 {user?.name}</span>
                        <ThemeToggle />
                        <NotificationBell />
                        <Link to="/settings" id="settings-nav-btn" className="btn" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>⚙️</Link>
                        <button id="logout-btn" className="btn-logout" onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </nav>

            {/* Body */}
            <div className="container dashboard-body">

                {/* Payment Success Banner */}
                {(paymentStatus === "success" || paymentStatus === "demo_success") && (
                    <div className="alert alert-success fade-up" style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "10px", padding: "1.2rem", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "12px", fontSize: "1.1rem" }}>
                        <span>🥳</span>
                        <div>
                            <strong>Payment Successful!</strong> Welcome to the Pro Plan.
                            {paymentStatus === "demo_success" && " (Demo Upgrade applied)."}
                        </div>
                    </div>
                )}

                {/* Welcome Banner */}
                <div className="welcome-banner fade-up">
                    <h1>Welcome back, <span>{user?.name?.split(" ")[0]}</span>! 🚀</h1>
                    <p>You're all set to ace your next interview. What do you want to do today?</p>
                </div>

                {/* Stats */}
                <div className="stats-grid fade-up">
                    <div className="stat-card">
                        <div className="stat-icon">🧠</div>
                        <div className="stat-value">{stats.totalQuestions}</div>
                        <div className="stat-label">Questions Generated</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📚</div>
                        <div className="stat-value">{stats.totalSessions}</div>
                        <div className="stat-label">Practice Sessions</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-value">{mockCount}</div>
                        <div className="stat-label">Mock Interviews Done</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⭐</div>
                        <div className="stat-value">{user?.isPremium ? "Pro" : "Free"}</div>
                        <div className="stat-label">Account Plan</div>
                    </div>
                </div>

                {/* Start Interview (Role Selector) */}
                <div className="section-title">🎙️ Start Practice Interview</div>
                <div className="role-selector-card fade-up" style={{ background: "rgba(255,255,255,0.03)", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "30px" }}>
                    <h3 style={{ marginTop: 0, marginBottom: "15px" }}>Choose Role</h3>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.2)", color: "var(--text-color)", marginBottom: "15px", fontSize: "1rem" }}
                    >
                        <option value="Frontend Developer">Frontend Developer</option>
                        <option value="Backend Developer">Backend Developer</option>
                        <option value="Java Developer">Java Developer</option>
                        <option value="Data Analyst">Data Analyst</option>
                    </select>
                    <button
                        onClick={() => navigate('/day13', { state: { role: selectedRole } })}
                        style={{ padding: "12px 24px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "1rem", width: "100%" }}
                    >
                        Start Interview
                    </button>
                </div>

                {/* Quick Actions */}
                <div className="section-title">⚡ Quick Actions</div>
                <div className="actions-grid fade-up">
                    {actions.map((a, i) => (
                        <Link key={i} to={a.link} id={`action-${i}`} className="action-card" style={{ display: "block", textDecoration: "none" }}>
                            <div className="action-card-icon">{a.icon}</div>
                            <div className="action-card-title">{a.title}</div>
                            <div className="action-card-desc">{a.desc}</div>
                        </Link>
                    ))}
                </div>

                {/* Account Info */}
                <div className="section-title">👤 Your Account</div>
                <div className="user-info-card fade-up">
                    <div className="user-info-row">
                        <span className="key">Name</span>
                        <span className="val">{user?.name}</span>
                    </div>
                    <div className="user-info-row">
                        <span className="key">Email</span>
                        <span className="val">{user?.email}</span>
                    </div>
                    <div className="user-info-row">
                        <span className="key">Plan</span>
                        <span className="val" style={{ color: user?.isPremium ? "var(--primary)" : "var(--text-muted)" }}>
                            {user?.isPremium ? "⭐ Premium" : "Free"}
                        </span>
                    </div>
                    <div className="user-info-row">
                        <span className="key">Access</span>
                        <span className="val">{user?.role === "admin" ? "Admin" : "User"}</span>
                    </div>
                    <div className="user-info-row">
                        <span className="key">Member Since</span>
                        <span className="val">{new Date(user?.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
                    </div>
                </div>

            </div>
        </div>
    );
}



