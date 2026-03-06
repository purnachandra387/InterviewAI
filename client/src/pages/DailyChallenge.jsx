import React, { useEffect, useState } from "react";
import axios from "axios";

function DailyChallenge() {

  const [challenge, setChallenge] = useState(null);

  useEffect(() => {
    // You can swap local API for production endpoints
    axios.get("http://localhost:5000/api/challenge/today")
      .then(res => setChallenge(res.data))
      .catch(err => console.error("Error fetching daily challenge:", err));
  }, []);

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>

      <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>🔥 Today's Interview Challenge</h2>

      {challenge ? (
        <div style={{ background: "rgba(255,255,255,0.05)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>Date: {challenge.date}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {challenge.questions.map((q, i) => (
              <div key={i} style={{ padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "8px", borderLeft: "4px solid var(--primary)" }}>
                <strong>Question {i + 1}:</strong> {q}
              </div>
            ))}
          </div>
          <button style={{ marginTop: "2rem", width: "100%", padding: "1rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "8px", fontSize: "1rem", fontWeight: "bold", cursor: "pointer" }}>
            Start Challenge
          </button>
        </div>
      ) : (
        <p style={{ textAlign: "center" }}>Loading challenge...</p>
      )}

    </div>
  );
}

export default DailyChallenge;
