import React, { useEffect, useState } from "react";
import axios from "axios";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [badges, setBadges] = useState([]);

    useEffect(() => {
        axios.get("https://interviewai-backend-0k7p.onrender.com/api/user/profile")
            .then(res => setProfile(res.data));
        axios.get("https://interviewai-backend-0k7p.onrender.com/api/user/badges")
            .then(res => setBadges(res.data))
            .catch(err => console.error(err));
    }, []);

    if (!profile) return <p>Loading...</p>;

    return (
        <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
            <h2>User Profile</h2>

            <p><strong>Name:</strong> {profile.user?.name || 'N/A'}</p>
            <p><strong>Email:</strong> {profile.user?.email || 'N/A'}</p>

            <h3>Statistics</h3>
            <p>Total Interviews: {profile.totalInterviews}</p>
            <p>Average Score: {profile.avgScore}</p>

            <h3>Your Badges</h3>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
                {badges && badges.length > 0 ? (
                    badges.map((badge, index) => (
                        <div key={index} style={{ padding: "10px 15px", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #ddd", fontWeight: "bold" }}>
                            🏅 {badge}
                        </div>
                    ))
                ) : (
                    <p style={{ color: "#777" }}>No badges earned yet. Keep practicing!</p>
                )}
            </div>

        </div>
    );
}

export default Profile;
