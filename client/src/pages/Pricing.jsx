import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createOrder, demoUpgrade, verifyPayment } from "../services/api";
import "./Pricing.css";

const PricingSidebar = () => (
    <aside className="qg-sidebar">
        <Link to="/dashboard" className="sidebar-logo">🧠 <span>Interview</span>AI</Link>
        <nav className="sidebar-nav">
            <Link to="/dashboard" className="sidebar-link">📊 Dashboard</Link>
            <Link to="/generate" className="sidebar-link">🤖 AI Generator</Link>
            <Link to="/history" className="sidebar-link">📚 History</Link>
            <Link to="/mock" className="sidebar-link">🎯 Mock Interview</Link>
            <Link to="/resume" className="sidebar-link">📄 Resume Analyzer</Link>
            <Link to="/analytics" className="sidebar-link">📊 Analytics</Link>
            <Link to="/pricing" className="sidebar-link active">⭐ Upgrade to Pro</Link>
            <Link to="/settings" className="sidebar-link">⚙️ Settings</Link>
        </nav>
    </aside>
);

export default function Pricing() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const isPremium = currentUser.isPremium;

    // Trigger Razorpay checkout
    const handleUpgrade = async () => {
        setLoading(true);
        setError("");
        try {
            const { data: order } = await createOrder();

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID || "YOUR_RAZORPAY_KEY_ID",
                amount: order.amount,
                currency: "INR",
                name: "InterviewAI",
                description: "Pro Subscription",
                order_id: order.id,
                handler: async function (response) {
                    try {
                        await verifyPayment({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        
                        const updatedUser = { ...currentUser, isPremium: true };
                        localStorage.setItem("user", JSON.stringify(updatedUser));
                        navigate("/dashboard?payment=success");
                    } catch (err) {
                        alert("Payment verification failed");
                    }
                },
                theme: {
                    color: "#6c63ff"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response){
                setError("Payment failed: " + response.error.description);
            });
            rzp.open();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to initiate checkout");
        } finally {
            setLoading(false);
        }
    };

    // Fallback: Instant upgrade for dev/testing without real Stripe API keys
    const handleDemoUpgrade = async () => {
        setLoading(true);
        try {
            await demoUpgrade(); // Update DB
            // Update local storage so UI reflects it immediately
            const updatedUser = { ...currentUser, isPremium: true };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            navigate("/dashboard?payment=demo_success");
        } catch (err) {
            setError("Demo upgrade failed.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="pricing-wrapper">
            <PricingSidebar />
            <main className="pricing-main">
                <div className="pricing-header fade-up">
                    <h1>Upgrade your Career 🚀</h1>
                    <p>Unlock unlimited Mock Interviews, AI Resume Analyzer, and more to land your dream job faster.</p>
                    {isPremium && (
                        <div className="premium-badge-active">
                            ⭐ You are currently on the Pro Plan!
                        </div>
                    )}
                </div>

                {error && <div className="pricing-error fade-up">⚠️ {error}</div>}

                <div className="pricing-grid fade-up">
                    {/* Basic Plan */}
                    <div className="pricing-card">
                        <div className="pc-tier">Free</div>
                        <div className="pc-price">₹0 <span>/ forever</span></div>
                        <p className="pc-desc">Great for trying out the platform.</p>

                        <ul className="pc-features">
                            <li><span className="chk">✅</span> 10 AI Questions generated per month</li>
                            <li><span className="chk">✅</span> Basic Practice History</li>
                            <li className="missing"><span className="chk">❌</span> No Mock Interviews</li>
                            <li className="missing"><span className="chk">❌</span> No AI Resume Analyzer</li>
                        </ul>

                        <button className="btn-pricing btn-free" disabled>
                            {isPremium ? "Downgrade" : "Current Plan"}
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="pricing-card pro-card">
                        <div className="popular-tag">MOST POPULAR</div>
                        <div className="pc-tier" style={{ color: "#38bdf8" }}>Pro</div>
                        <div className="pc-price">₹99 <span>/ month</span></div>
                        <p className="pc-desc">Everything you need to successfully ace every interview.</p>

                        <ul className="pc-features">
                            <li><span className="chk">✅</span> <strong>Unlimited</strong> AI Questions Generated</li>
                            <li><span className="chk">✅</span> Full Practice History & Tracking</li>
                            <li><span className="chk">✅</span> <strong>Unlimited</strong> Mock Interviews</li>
                            <li><span className="chk">✅</span> Advanced AI Resume Analyzer</li>
                            <li><span className="chk">✅</span> Priority Support</li>
                        </ul>

                        {!isPremium ? (
                            <div className="upgrade-actions">
                                <button className="btn-pricing btn-pro" onClick={handleUpgrade} disabled={loading}>
                                    {loading ? <span className="spinner-sm"></span> : "💳 Upgrade with Razorpay"}
                                </button>
                                <button className="btn-pricing btn-demo" onClick={handleDemoUpgrade} disabled={loading}>
                                    🧪 Demo Upgrade (No CC needed)
                                </button>
                            </div>
                        ) : (
                            <button className="btn-pricing btn-pro-active" disabled>
                                ⭐ Active Plan
                            </button>
                        )}
                    </div>
                </div>

                {/* FAQ */}
                <div className="pricing-faq fade-up">
                    <h3 className="faq-title">Frequently Asked Questions</h3>
                    <div className="faq-grid">
                        <div className="faq-item">
                            <h4>Is this a recurring subscription?</h4>
                            <p>Yes, the Pro plan is billed monthly. You can cancel at any time from your dashboard.</p>
                        </div>
                        <div className="faq-item">
                            <h4>How does the Mock Interview work?</h4>
                            <p>You simulate a real interview scenario and our specialized AI evaluator grades your answers and gives you improvement tips.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
