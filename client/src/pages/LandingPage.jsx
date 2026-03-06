import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LandingPage.css";

const FEATURES = [
    {
        icon: "🤖",
        title: "AI Question Generator",
        desc: "Get hyper-relevant interview questions tailored to any job role, experience level, and tech stack with a single click.",
    },
    {
        icon: "🎯",
        title: "Live Mock Interviews",
        desc: "Simulate a real interview environment with our AI evaluator. Get scored answers and instant improvement tips.",
    },
    {
        icon: "📄",
        title: "Resume Analyzer",
        desc: "Upload your resume and receive AI-powered feedback on structure, keywords, ATS compatibility, and more.",
    },
    {
        icon: "📊",
        title: "Progress Tracking",
        desc: "Track every session, monitor your growth over time, and identify weak areas with detailed history logs.",
    },
    {
        icon: "⚡",
        title: "Instant Feedback",
        desc: "Receive detailed, rubric-based feedback on your answers in seconds — not days.",
    },
    {
        icon: "🔒",
        title: "Secure & Private",
        desc: "Your data is yours. All sessions are encrypted and only you can access your interview history.",
    },
];

const TESTIMONIALS = [
    {
        name: "Aditya R.",
        role: "Software Engineer @ Google",
        avatar: "A",
        text: "I landed my dream job at Google after just 2 weeks of using this platform. The mock interviews were incredibly realistic.",
        stars: 5,
    },
    {
        name: "Priya M.",
        role: "Product Manager @ Flipkart",
        avatar: "P",
        text: "The resume analyzer caught things I would have never noticed. My callback rate doubled after implementing the suggestions.",
        stars: 5,
    },
    {
        name: "Karan S.",
        role: "Data Scientist @ Amazon",
        avatar: "K",
        text: "The AI question generator is mind-blowing. It predicted 3 out of 5 actual interview questions I was asked!",
        stars: 5,
    },
];

const STATS = [
    { value: "10,000+", label: "Interviews Practiced" },
    { value: "87%", label: "Success Rate" },
    { value: "500+", label: "Companies Covered" },
    { value: "4.9★", label: "Average Rating" },
];

export default function LandingPage() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const heroRef = useRef(null);

    // Check if user already logged in — redirect to dashboard
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) navigate("/dashboard");
    }, [navigate]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div className="lp-root">
            {/* ── Navbar ── */}
            <nav className={`lp-nav ${scrolled ? "lp-nav--scrolled" : ""}`}>
                <div className="lp-nav-inner">
                    <div className="lp-logo">🧠 <span>Interview</span>AI</div>
                    <div className="lp-nav-links">
                        <a href="#features" className="lp-nav-link">Features</a>
                        <a href="#pricing" className="lp-nav-link">Pricing</a>
                        <a href="#testimonials" className="lp-nav-link">Reviews</a>
                    </div>
                    <div className="lp-nav-cta">
                        <Link to="/login" id="nav-login-btn" className="lp-btn lp-btn--ghost">Log in</Link>
                        <Link to="/register" id="nav-signup-btn" className="lp-btn lp-btn--primary">Get Started Free</Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="lp-hero" ref={heroRef}>
                <div className="lp-hero-bg">
                    <div className="lp-orb lp-orb--1" />
                    <div className="lp-orb lp-orb--2" />
                    <div className="lp-orb lp-orb--3" />
                </div>
                <div className="lp-hero-content">
                    <div className="lp-hero-badge">🚀 AI-Powered Interview Preparation</div>
                    <h1 className="lp-hero-title">
                        Land Your <span className="lp-gradient-text">Dream Job</span>
                        <br />with AI-Powered Practice
                    </h1>
                    <p className="lp-hero-sub">
                        Generate targeted interview questions, simulate real mock interviews,
                        and get instant AI feedback — all in one beautifully built platform.
                    </p>
                    <div className="lp-hero-buttons">
                        <Link to="/register" id="hero-cta-btn" className="lp-btn lp-btn--primary lp-btn--lg">
                            Start for Free — No CC Required
                        </Link>
                        <Link to="/login" id="hero-login-btn" className="lp-btn lp-btn--outline lp-btn--lg">
                            I already have an account →
                        </Link>
                    </div>
                    <div className="lp-hero-social-proof">
                        <div className="lp-avatars">
                            {["A", "K", "P", "S", "R"].map((l, i) => (
                                <div key={i} className="lp-avatar" style={{ zIndex: 5 - i }}>{l}</div>
                            ))}
                        </div>
                        <span>Join <strong>10,000+</strong> professionals already practicing</span>
                    </div>
                </div>
                <div className="lp-hero-visual">
                    <div className="lp-card-mock">
                        <div className="lp-card-mock-header">
                            <div className="lp-dot lp-dot--red" />
                            <div className="lp-dot lp-dot--yellow" />
                            <div className="lp-dot lp-dot--green" />
                            <span>Mock Interview — Software Engineer</span>
                        </div>
                        <div className="lp-card-mock-body">
                            <div className="lp-question-chip">Q1 / 5</div>
                            <p className="lp-mock-q">"Explain the difference between REST and GraphQL APIs and when you'd choose one over the other."</p>
                            <div className="lp-mock-answer-area">
                                <div className="lp-typing-indicator">
                                    <span /><span /><span />
                                </div>
                                <span className="lp-typing-label">AI is evaluating your answer...</span>
                            </div>
                            <div className="lp-score-bar">
                                <span>Score</span>
                                <div className="lp-bar-track">
                                    <div className="lp-bar-fill" />
                                </div>
                                <span className="lp-score-val">88/100</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Stats ── */}
            <section className="lp-stats">
                <div className="lp-container">
                    <div className="lp-stats-grid">
                        {STATS.map((s, i) => (
                            <div key={i} className="lp-stat-item">
                                <div className="lp-stat-value">{s.value}</div>
                                <div className="lp-stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className="lp-features" id="features">
                <div className="lp-container">
                    <div className="lp-section-label">Everything you need</div>
                    <h2 className="lp-section-title">Built for serious job seekers</h2>
                    <p className="lp-section-sub">
                        From question generation to resume analysis, every tool is powered by the
                        latest AI models to give you an unfair advantage.
                    </p>
                    <div className="lp-features-grid">
                        {FEATURES.map((f, i) => (
                            <div key={i} className="lp-feature-card">
                                <div className="lp-feature-icon">{f.icon}</div>
                                <h3 className="lp-feature-title">{f.title}</h3>
                                <p className="lp-feature-desc">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Testimonials ── */}
            <section className="lp-testimonials" id="testimonials">
                <div className="lp-container">
                    <div className="lp-section-label">Success Stories</div>
                    <h2 className="lp-section-title">Join thousands who cracked their interviews</h2>
                    <div className="lp-testimonials-grid">
                        {TESTIMONIALS.map((t, i) => (
                            <div key={i} className="lp-testimonial-card">
                                <div className="lp-t-stars">{"★".repeat(t.stars)}</div>
                                <p className="lp-t-text">"{t.text}"</p>
                                <div className="lp-t-author">
                                    <div className="lp-t-avatar">{t.avatar}</div>
                                    <div>
                                        <div className="lp-t-name">{t.name}</div>
                                        <div className="lp-t-role">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Pricing Preview ── */}
            <section className="lp-pricing" id="pricing">
                <div className="lp-container">
                    <div className="lp-section-label">Simple Pricing</div>
                    <h2 className="lp-section-title">Start free, upgrade when ready</h2>
                    <div className="lp-pricing-grid">
                        <div className="lp-price-card">
                            <div className="lp-price-tier">Free</div>
                            <div className="lp-price-amount">₹0<span>/month</span></div>
                            <ul className="lp-price-features">
                                <li>✅ 10 AI Questions / month</li>
                                <li>✅ Basic History</li>
                                <li className="lp-price-miss">❌ Mock Interviews</li>
                                <li className="lp-price-miss">❌ Resume Analyzer</li>
                            </ul>
                            <Link to="/register" id="free-plan-btn" className="lp-btn lp-btn--outline lp-price-btn">Get Started</Link>
                        </div>
                        <div className="lp-price-card lp-price-card--pro">
                            <div className="lp-popular-tag">MOST POPULAR</div>
                            <div className="lp-price-tier">Pro</div>
                            <div className="lp-price-amount">₹99<span>/month</span></div>
                            <ul className="lp-price-features">
                                <li>✅ Unlimited AI Questions</li>
                                <li>✅ Full History & Tracking</li>
                                <li>✅ Unlimited Mock Interviews</li>
                                <li>✅ Advanced Resume Analyzer</li>
                                <li>✅ Priority Support</li>
                            </ul>
                            <Link to="/register" id="pro-plan-btn" className="lp-btn lp-btn--primary lp-price-btn">Start Pro Trial</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Final CTA ── */}
            <section className="lp-final-cta">
                <div className="lp-container">
                    <div className="lp-cta-box">
                        <div className="lp-orb lp-orb--cta" />
                        <h2>Ready to ace your next interview?</h2>
                        <p>Join 10,000+ professionals. Start practicing for free today.</p>
                        <Link to="/register" id="final-cta-btn" className="lp-btn lp-btn--primary lp-btn--lg">
                            🚀 Create Your Free Account
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="lp-footer">
                <div className="lp-container lp-footer-inner">
                    <div className="lp-logo">🧠 <span>Interview</span>AI</div>
                    <div className="lp-footer-links">
                        <Link to="/login">Login</Link>
                        <Link to="/register">Sign Up</Link>
                        <a href="#features">Features</a>
                        <a href="#pricing">Pricing</a>
                    </div>
                    <div className="lp-footer-copy">© 2026 InterviewAI. All rights reserved.</div>
                </div>
            </footer>
        </div>
    );
}
