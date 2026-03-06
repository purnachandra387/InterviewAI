import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { data } = await loginUser(form);
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Check credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-logo">🧠 <span>Interview</span>AI</div>

                <h2 className="auth-title">Welcome back 👋</h2>
                <p className="auth-subtitle">Sign in to continue your preparation</p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            id="login-email"
                            type="email"
                            name="email"
                            placeholder="john@example.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            id="login-password"
                            type="password"
                            name="password"
                            placeholder="Your password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button id="login-btn" className="btn btn-primary" type="submit" disabled={loading}>
                        {loading ? <><span className="spinner"></span> Signing in…</> : "Sign In →"}
                    </button>
                </form>

                <div className="auth-link">
                    Don't have an account? <Link to="/register">Sign up free</Link>
                </div>
            </div>
        </div>
    );
}
