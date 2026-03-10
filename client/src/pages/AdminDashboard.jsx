import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAdminOverview } from "../services/api";

const cardStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
};

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadOverview = async () => {
            try {
                const { data: overview } = await getAdminOverview();
                setData(overview);
            } catch (err) {
                if (err?.response?.status === 401) {
                    localStorage.clear();
                    navigate("/login");
                    return;
                }

                if (err?.response?.status === 403) {
                    navigate("/dashboard");
                    return;
                }

                setError(err?.response?.data?.message || "Failed to load admin overview.");
            } finally {
                setLoading(false);
            }
        };

        loadOverview();
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

    const summary = data?.summary || {};
    const recentUsers = data?.recentUsers || [];

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #07111f 0%, #0e1726 100%)", color: "#f8fafc", padding: "32px 20px" }}>
            <div style={{ maxWidth: 1180, margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 28, flexWrap: "wrap" }}>
                    <div>
                        <div style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: "0.12em", color: "#7dd3fc", marginBottom: 8 }}>Admin Only</div>
                        <h1 style={{ margin: 0, fontSize: "2.2rem" }}>Platform Overview</h1>
                        <p style={{ margin: "8px 0 0", color: "rgba(248,250,252,0.72)" }}>This area is protected on both the frontend and backend.</p>
                    </div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <Link to="/dashboard" className="btn" style={{ ...cardStyle, padding: "10px 16px", textDecoration: "none", color: "#f8fafc" }}>
                            Back to Dashboard
                        </Link>
                        <button onClick={handleLogout} className="btn-logout">Logout</button>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: 20 }}>
                        {error}
                    </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
                    <div style={cardStyle}>
                        <div style={{ color: "#93c5fd", marginBottom: 8 }}>Total Users</div>
                        <div style={{ fontSize: "2rem", fontWeight: 700 }}>{summary.totalUsers || 0}</div>
                    </div>
                    <div style={cardStyle}>
                        <div style={{ color: "#86efac", marginBottom: 8 }}>Admins</div>
                        <div style={{ fontSize: "2rem", fontWeight: 700 }}>{summary.adminUsers || 0}</div>
                    </div>
                    <div style={cardStyle}>
                        <div style={{ color: "#fcd34d", marginBottom: 8 }}>Premium Users</div>
                        <div style={{ fontSize: "2rem", fontWeight: 700 }}>{summary.premiumUsers || 0}</div>
                    </div>
                    <div style={cardStyle}>
                        <div style={{ color: "#c4b5fd", marginBottom: 8 }}>Question Generations</div>
                        <div style={{ fontSize: "2rem", fontWeight: 700 }}>{summary.totalQuestionGenerations || 0}</div>
                    </div>
                    <div style={cardStyle}>
                        <div style={{ color: "#fda4af", marginBottom: 8 }}>Mock Sessions</div>
                        <div style={{ fontSize: "2rem", fontWeight: 700 }}>{summary.totalMockSessions || 0}</div>
                    </div>
                    <div style={cardStyle}>
                        <div style={{ color: "#67e8f9", marginBottom: 8 }}>Day 13 Interviews</div>
                        <div style={{ fontSize: "2rem", fontWeight: 700 }}>{summary.totalDay13Interviews || 0}</div>
                    </div>
                </div>

                <div style={cardStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
                        <h2 style={{ margin: 0 }}>Recent Users</h2>
                        <div style={{ color: "rgba(248,250,252,0.66)", fontSize: 14 }}>
                            Regular users: {summary.regularUsers || 0}
                        </div>
                    </div>

                    {recentUsers.length === 0 ? (
                        <p style={{ margin: 0, color: "rgba(248,250,252,0.66)" }}>No user records found yet.</p>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ textAlign: "left", color: "#93c5fd" }}>
                                        <th style={{ padding: "10px 8px" }}>Name</th>
                                        <th style={{ padding: "10px 8px" }}>Email</th>
                                        <th style={{ padding: "10px 8px" }}>Role</th>
                                        <th style={{ padding: "10px 8px" }}>Plan</th>
                                        <th style={{ padding: "10px 8px" }}>Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentUsers.map((user) => (
                                        <tr key={user._id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                                            <td style={{ padding: "12px 8px" }}>{user.name}</td>
                                            <td style={{ padding: "12px 8px" }}>{user.email}</td>
                                            <td style={{ padding: "12px 8px" }}>{user.role === "admin" ? "Admin" : "User"}</td>
                                            <td style={{ padding: "12px 8px" }}>{user.isPremium ? "Pro" : "Free"}</td>
                                            <td style={{ padding: "12px 8px" }}>
                                                {new Date(user.createdAt).toLocaleDateString("en-IN", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
