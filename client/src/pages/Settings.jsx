import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProfile, updateProfile, demoUpgrade } from "../services/api";
import "./Settings.css";

const Sidebar = ({ active }) => (
    <aside className="qg-sidebar">
        <Link to="/dashboard" className="sidebar-logo">🧠 <span>Interview</span>AI</Link>
        <nav className="sidebar-nav">
            <Link to="/dashboard" className="sidebar-link">📊 Dashboard</Link>
            <Link to="/generate" className="sidebar-link">🤖 AI Generator</Link>
            <Link to="/history" className="sidebar-link">📚 History</Link>
            <Link to="/mock" className="sidebar-link">🎯 Mock Interview</Link>
            <Link to="/resume" className="sidebar-link">📄 Resume Analyzer</Link>
            <Link to="/analytics" className="sidebar-link">📊 Analytics</Link>
            <Link to="/pricing" className="sidebar-link">⭐ Upgrade to Pro</Link>
            <Link to="/settings" className={`sidebar-link ${active === "settings" ? "active" : ""}`}>⚙️ Settings</Link>
        </nav>
    </aside>
);

export default function Settings() {
    const navigate = useNavigate();

    // Profile state
    const [user, setUser] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    // Name form
    const [name, setName] = useState("");
    const [nameLoading, setNameLoading] = useState(false);
    const [nameSuccess, setNameSuccess] = useState("");
    const [nameError, setNameError] = useState("");

    // Password form
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pwLoading, setPwLoading] = useState(false);
    const [pwSuccess, setPwSuccess] = useState("");
    const [pwError, setPwError] = useState("");

    // Danger zone
    const [upgradeLoading, setUpgradeLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await getProfile();
                setUser(data);
                setName(data.name || "");
            } catch (err) {
                if (err?.response?.status === 401) {
                    localStorage.clear();
                    navigate("/login");
                }
            } finally {
                setLoadingProfile(false);
            }
        };
        fetchUser();
    }, [navigate]);

    const handleNameUpdate = async (e) => {
        e.preventDefault();
        setNameLoading(true);
        setNameSuccess("");
        setNameError("");
        try {
            const { data } = await updateProfile({ name });
            setUser(data.user);
            // Update localStorage user object
            const stored = JSON.parse(localStorage.getItem("user") || "{}");
            localStorage.setItem("user", JSON.stringify({ ...stored, name: data.user.name }));
            setNameSuccess("Name updated successfully! ✅");
        } catch (err) {
            setNameError(err?.response?.data?.message || "Failed to update name");
        } finally {
            setNameLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setPwLoading(true);
        setPwSuccess("");
        setPwError("");

        if (newPassword !== confirmPassword) {
            setPwError("New passwords do not match");
            setPwLoading(false);
            return;
        }
        if (newPassword.length < 6) {
            setPwError("Password must be at least 6 characters");
            setPwLoading(false);
            return;
        }

        try {
            await updateProfile({ currentPassword, newPassword });
            setPwSuccess("Password changed successfully! ✅");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setPwError(err?.response?.data?.message || "Failed to change password");
        } finally {
            setPwLoading(false);
        }
    };

    const handleDemoUpgrade = async () => {
        setUpgradeLoading(true);
        try {
            await demoUpgrade();
            const stored = JSON.parse(localStorage.getItem("user") || "{}");
            localStorage.setItem("user", JSON.stringify({ ...stored, isPremium: true }));
            setUser((u) => ({ ...u, isPremium: true }));
        } catch {
            // do nothing
        } finally {
            setUpgradeLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    if (loadingProfile) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
                <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
            </div>
        );
    }

    return (
        <div className="settings-wrapper">
            <Sidebar active="settings" />
            <main className="settings-main">
                <div className="settings-header fade-up">
                    <h1>⚙️ Account Settings</h1>
                    <p>Manage your profile, security, and subscription.</p>
                </div>

                {/* ── Profile Section ── */}
                <section className="settings-section fade-up">
                    <div className="settings-section-header">
                        <div className="settings-section-icon">👤</div>
                        <div>
                            <h2>Profile Info</h2>
                            <p>Update your display name</p>
                        </div>
                    </div>

                    <div className="settings-avatar-row">
                        <div className="settings-avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
                        <div>
                            <div className="settings-user-name">{user?.name}</div>
                            <div className="settings-user-email">{user?.email}</div>
                            <div className={`settings-plan-badge ${user?.isPremium ? "settings-plan-badge--pro" : ""}`}>
                                {user?.isPremium ? "⭐ Pro Plan" : "Free Plan"}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleNameUpdate} className="settings-form">
                        {nameSuccess && <div className="settings-alert settings-alert--success">{nameSuccess}</div>}
                        {nameError && <div className="settings-alert settings-alert--error">{nameError}</div>}
                        <div className="settings-field">
                            <label htmlFor="settings-name">Display Name</label>
                            <input
                                id="settings-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your full name"
                                required
                            />
                        </div>
                        <div className="settings-field">
                            <label>Email Address</label>
                            <input type="email" value={user?.email || ""} disabled className="settings-input--disabled" />
                            <span className="settings-field-hint">Email cannot be changed</span>
                        </div>
                        <button id="save-name-btn" type="submit" className="settings-btn settings-btn--primary" disabled={nameLoading}>
                            {nameLoading ? <span className="spinner" /> : "Save Changes"}
                        </button>
                    </form>
                </section>

                {/* ── Password Section ── */}
                <section className="settings-section fade-up">
                    <div className="settings-section-header">
                        <div className="settings-section-icon">🔐</div>
                        <div>
                            <h2>Change Password</h2>
                            <p>Keep your account secure with a strong password</p>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordUpdate} className="settings-form">
                        {pwSuccess && <div className="settings-alert settings-alert--success">{pwSuccess}</div>}
                        {pwError && <div className="settings-alert settings-alert--error">{pwError}</div>}
                        <div className="settings-field">
                            <label htmlFor="current-pw">Current Password</label>
                            <input
                                id="current-pw"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Your current password"
                                required
                            />
                        </div>
                        <div className="settings-fields-row">
                            <div className="settings-field">
                                <label htmlFor="new-pw">New Password</label>
                                <input
                                    id="new-pw"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="At least 6 characters"
                                    required
                                />
                            </div>
                            <div className="settings-field">
                                <label htmlFor="confirm-pw">Confirm New Password</label>
                                <input
                                    id="confirm-pw"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repeat new password"
                                    required
                                />
                            </div>
                        </div>
                        <button id="change-pw-btn" type="submit" className="settings-btn settings-btn--primary" disabled={pwLoading}>
                            {pwLoading ? <span className="spinner" /> : "Update Password"}
                        </button>
                    </form>
                </section>

                {/* ── Subscription Section ── */}
                <section className="settings-section fade-up">
                    <div className="settings-section-header">
                        <div className="settings-section-icon">⭐</div>
                        <div>
                            <h2>Subscription</h2>
                            <p>Manage your plan and billing</p>
                        </div>
                    </div>

                    <div className="settings-sub-card">
                        <div className="settings-sub-info">
                            <div className={`settings-plan-big ${user?.isPremium ? "settings-plan-big--pro" : ""}`}>
                                {user?.isPremium ? "⭐ Pro Plan" : "🆓 Free Plan"}
                            </div>
                            <p className="settings-sub-desc">
                                {user?.isPremium
                                    ? "You have access to unlimited mock interviews, AI resume analysis, and more."
                                    : "Upgrade to Pro to unlock mock interviews, resume analysis, and unlimited questions."}
                            </p>
                        </div>
                        <div className="settings-sub-actions">
                            {!user?.isPremium ? (
                                <>
                                    <Link to="/pricing" id="view-pricing-btn" className="settings-btn settings-btn--primary">
                                        ⚡ Upgrade to Pro
                                    </Link>
                                    <button
                                        id="demo-upgrade-btn"
                                        className="settings-btn settings-btn--ghost"
                                        onClick={handleDemoUpgrade}
                                        disabled={upgradeLoading}
                                    >
                                        🧪 Demo Upgrade
                                    </button>
                                </>
                            ) : (
                                <div className="settings-pro-active">
                                    ✅ Pro plan is active
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── Danger Zone ── */}
                <section className="settings-section settings-section--danger fade-up">
                    <div className="settings-section-header">
                        <div className="settings-section-icon">⚠️</div>
                        <div>
                            <h2>Danger Zone</h2>
                            <p>Actions that cannot be undone</p>
                        </div>
                    </div>
                    <div className="settings-danger-row">
                        <div>
                            <div className="settings-danger-title">Log out of your account</div>
                            <div className="settings-danger-desc">You will be redirected to the login page.</div>
                        </div>
                        <button id="settings-logout-btn" className="settings-btn settings-btn--danger" onClick={handleLogout}>
                            🚪 Log Out
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
}
