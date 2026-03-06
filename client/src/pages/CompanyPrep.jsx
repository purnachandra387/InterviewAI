import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCompanyPrep } from "../services/api";
import "./CompanyPrep.css";

const POPULAR_COMPANIES = [
    "Google", "Amazon", "Microsoft", "Meta", "Apple",
    "Netflix", "Uber", "Airbnb", "Stripe", "Salesforce",
    "Adobe", "Oracle", "IBM", "Infosys", "TCS",
    "Wipro", "Flipkart", "Zomato", "Swiggy", "Razorpay",
];

const JOB_ROLES = [
    "Software Engineer", "Frontend Developer", "Backend Developer",
    "Full Stack Developer", "Data Scientist", "Machine Learning Engineer",
    "DevOps Engineer", "Product Manager", "Data Analyst", "Cloud Engineer",
];

export default function CompanyPrep() {
    const navigate = useNavigate();
    const [company, setCompany] = useState("");
    const [role, setRole] = useState("Software Engineer");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [pack, setPack] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");

    const handleLogout = () => { localStorage.clear(); navigate("/login"); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!company.trim()) return;
        setError("");
        setLoading(true);
        setPack(null);
        try {
            const { data } = await getCompanyPrep({ company: company.trim(), role });
            setPack(data);
            setActiveTab("overview");
        } catch (err) {
            if (err?.response?.status === 401) { localStorage.clear(); navigate("/login"); return; }
            setError(err.response?.data?.message || "Failed to generate prep pack. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cp-page">
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

            <div className="container cp-body">
                {/* Hero */}
                <div className="cp-hero fade-up">
                    <div className="cp-hero-badge">🏢 Company-Specific Prep</div>
                    <h1>Targeted Interview Prep</h1>
                    <p>Get AI-generated questions, interview process breakdown, and insider tips tailored to your target company and role.</p>
                </div>

                {/* Search Form */}
                <div className="cp-form-card fade-up">
                    <form onSubmit={handleSubmit}>
                        <div className="cp-form-row">
                            <div className="cp-form-group">
                                <label htmlFor="cp-company-input">Company Name</label>
                                <div className="cp-input-wrap">
                                    <span className="cp-input-icon">🏢</span>
                                    <input
                                        id="cp-company-input"
                                        type="text"
                                        placeholder="e.g. Google, Amazon, Zomato…"
                                        value={company}
                                        onChange={e => setCompany(e.target.value)}
                                        list="cp-company-list"
                                        required
                                        className="cp-input"
                                    />
                                    <datalist id="cp-company-list">
                                        {POPULAR_COMPANIES.map(c => <option key={c} value={c} />)}
                                    </datalist>
                                </div>
                            </div>
                            <div className="cp-form-group">
                                <label htmlFor="cp-role-select">Job Role</label>
                                <div className="cp-input-wrap">
                                    <span className="cp-input-icon">💼</span>
                                    <select
                                        id="cp-role-select"
                                        value={role}
                                        onChange={e => setRole(e.target.value)}
                                        className="cp-select"
                                    >
                                        {JOB_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button
                                id="cp-generate-btn"
                                type="submit"
                                className="cp-submit-btn"
                                disabled={loading || !company.trim()}
                            >
                                {loading
                                    ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />  Generating…</>
                                    : "🚀 Generate Prep Pack"}
                            </button>
                        </div>
                    </form>

                    {/* Popular Companies Quick-Select */}
                    <div className="cp-popular">
                        <span className="cp-popular-label">Popular:</span>
                        {POPULAR_COMPANIES.slice(0, 8).map(c => (
                            <button
                                key={c}
                                className={`cp-chip ${company === c ? "active" : ""}`}
                                onClick={() => setCompany(c)}
                                type="button"
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {error && <div className="alert alert-error fade-up">{error}</div>}

                {/* Loading shimmer */}
                {loading && (
                    <div className="cp-loading fade-up">
                        <div className="cp-loading-spinner">
                            <div className="spinner" style={{ width: 48, height: 48, borderWidth: 4 }} />
                        </div>
                        <p>Generating your personalized prep pack for <strong>{company}</strong>…</p>
                        <p className="cp-loading-sub">This takes 10-20 seconds</p>
                    </div>
                )}

                {/* Results */}
                {pack && !loading && (
                    <div className="cp-result fade-up">
                        <div className="cp-result-header">
                            <div className="cp-result-title">
                                <div className="cp-company-badge">{pack.company}</div>
                                <span>Interview Prep Pack</span>
                                <span className="cp-role-badge">{pack.role}</span>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="cp-tabs">
                            {[
                                { id: "overview", icon: "📋", label: "Overview" },
                                { id: "process", icon: "🗺️", label: "Interview Process" },
                                { id: "technical", icon: "⚡", label: "Technical Q's" },
                                { id: "behavioral", icon: "🤝", label: "Behavioral Q's" },
                                { id: "tips", icon: "💡", label: "Insider Tips" },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    className={`cp-tab ${activeTab === tab.id ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="cp-tab-content">
                            {activeTab === "overview" && (
                                <div className="cp-overview">
                                    <div className="cp-overview-icon">🏢</div>
                                    <p>{pack.overview}</p>
                                    <div className="cp-cta-row">
                                        <button className="cp-tab-btn" onClick={() => setActiveTab("technical")}>
                                            ⚡ View Technical Questions →
                                        </button>
                                        <button className="cp-tab-btn" onClick={() => setActiveTab("tips")}>
                                            💡 See Insider Tips →
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === "process" && (
                                <div className="cp-process">
                                    {(pack.process || []).map((step, i) => (
                                        <div key={i} className="cp-process-step">
                                            <div className="cp-step-num">Round {i + 1}</div>
                                            <div className="cp-step-text">{step}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === "technical" && (
                                <div className="cp-questions">
                                    {(pack.technicalQuestions || []).map((q, i) => (
                                        <div key={i} className="cp-question-item" style={{ "--delay": `${i * 0.07}s` }}>
                                            <span className="cp-q-num">Q{i + 1}</span>
                                            <p>{q}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === "behavioral" && (
                                <div className="cp-questions">
                                    {(pack.behavioralQuestions || []).map((q, i) => (
                                        <div key={i} className="cp-question-item" style={{ "--delay": `${i * 0.07}s` }}>
                                            <span className="cp-q-num">Q{i + 1}</span>
                                            <p>{q}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === "tips" && (
                                <div className="cp-tips">
                                    {(pack.tips || []).map((tip, i) => (
                                        <div key={i} className="cp-tip-item" style={{ "--delay": `${i * 0.07}s` }}>
                                            <span className="cp-tip-num">0{i + 1}</span>
                                            <p>{tip}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!pack && !loading && !error && (
                    <div className="cp-empty fade-up">
                        <div className="cp-empty-grid">
                            {POPULAR_COMPANIES.slice(0, 6).map(c => (
                                <button key={c} className="cp-empty-card" onClick={() => setCompany(c)}>
                                    <div className="cp-ec-icon">🏢</div>
                                    <div className="cp-ec-name">{c}</div>
                                    <div className="cp-ec-sub">Click to prep →</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
