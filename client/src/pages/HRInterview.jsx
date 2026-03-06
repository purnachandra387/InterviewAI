import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function HRInterview() {
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios.get("http://localhost:5000/api/hr/start", { headers })
      .then(res => setQuestions(res.data.questions))
      .catch(err => {
          if (err?.response?.status === 401) {
              localStorage.clear();
              navigate("/login");
          }
          console.error("Error fetching HR questions:", err);
      });
  }, [navigate]);

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <Link to="/dashboard" style={{ textDecoration: "none", color: "#3b82f6", display: "inline-block", marginBottom: "30px", fontSize: "16px", fontWeight: "bold" }}>
          ← Back to Dashboard
      </Link>

      <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>💬 HR Mock Interview</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "30px" }}>Practice the most common behavioral and HR questions.</p>

      {questions.length === 0 ? (
          <p>Loading questions...</p>
      ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            {questions.map((q, i) => (
              <div key={i} style={{ 
                  background: "rgba(255,255,255,0.05)",
                  padding: "20px", 
                  borderRadius: "12px", 
                  border: "1px solid rgba(255,255,255,0.1)" 
              }}>
                <h3 style={{ margin: "0 0 15px 0", color: "var(--text-color)" }}>{i + 1}. {q}?</h3>
                <textarea 
                  placeholder="Draft your answer here..."
                  rows="4" 
                  style={{ 
                      width: "100%", 
                      padding: "15px", 
                      borderRadius: "8px", 
                      border: "1px solid rgba(255,255,255,0.2)", 
                      background: "rgba(0,0,0,0.2)", 
                      color: "var(--text-color)",
                      fontSize: "1rem",
                      resize: "vertical"
                  }}
                />
              </div>
            ))}
            
            <button style={{
                marginTop: "10px",
                padding: "15px",
                background: "var(--primary)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "1.1rem",
                fontWeight: "bold",
                cursor: "pointer"
            }}>
                Submit Answers
            </button>
          </div>
      )}
    </div>
  );
}

export default HRInterview;
