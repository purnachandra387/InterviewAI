import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Progress() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // We get actual token so we can get correct info if authenticated
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios
      .get("https://interviewai-backend-0k7p.onrender.com/api/interview/progress", { headers })
      .then((res) => setData(res.data))
      .catch((err) => console.error("Error fetching progress:", err));
  }, []);

  if (!data) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <p>Loading your progress...</p>
      </div>
    );
  }

  // Formatting chart data
  const chartData = {
    labels: data.interviews.map((_, i) => `Interview ${i + 1}`),
    datasets: [
      {
        label: "Score",
        data: data.interviews.map((interview) => parseFloat(interview.score) || 0),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 5,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: false },
    },
    scales: {
      y: { min: 0, max: 10 },
    },
  };

  return (
    <div style={{ padding: "3rem", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", fontSize: "2rem", marginBottom: "2rem" }}>
        📈 Your Interview Progress
      </h2>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: "1.5rem", 
        marginBottom: "3rem" 
      }}>
        <div style={{
          background: "rgba(255,255,255,0.05)",
          padding: "2rem",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "1.2rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Total Practice Sessions</div>
          <div style={{ fontSize: "3rem", fontWeight: "bold", color: "var(--primary)" }}>{data.totalInterviews}</div>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.05)",
          padding: "2rem",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "1.2rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Average Score</div>
          <div style={{ fontSize: "3rem", fontWeight: "bold", color: "var(--primary)" }}>{data.avgScore} <span style={{fontSize: "1.2rem"}}>/ 10</span></div>
        </div>
      </div>

      <div style={{
        background: "rgba(255,255,255,0.02)",
        padding: "2rem",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        <h3 style={{ marginBottom: "1.5rem", textAlign: "center", color: "var(--text-muted)" }}>Performance Over Time</h3>
        <div style={{ width: "100%", height: "400px", display: "flex", justifyContent: "center" }}>
          <Line options={chartOptions} data={chartData} />
        </div>
      </div>

    </div>
  );
}

export default Progress;
