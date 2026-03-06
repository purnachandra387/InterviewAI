import React, { useState } from "react";
import axios from "axios";
import "./Roadmap.css"; // Basic styling optionally, or rely on global

function Roadmap() {

  const [role, setRole] = useState("");
  const [roadmap, setRoadmap] = useState(null);

  const generateRoadmap = async () => {

    const res = await axios.post(
      "http://localhost:5000/api/roadmap/generate",
      { role }
    );

    setRoadmap(res.data);
  };

  return (
    <div style={{ padding: "2rem" }}>

      <h2>Career Roadmap</h2>

      <input
        placeholder="Enter job role"
        onChange={(e) => setRole(e.target.value)}
        style={{ padding: "0.5rem", marginRight: "1rem" }}
      />

      <button onClick={generateRoadmap} style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
        Generate Roadmap
      </button>

      {roadmap && !roadmap.message && (

        <div style={{ marginTop: "2rem" }}>

          <h3>Required Skills</h3>

          {roadmap.skills.map(skill => (
            <p key={skill}>✅ {skill}</p>
          ))}

          <h3 style={{ marginTop: "1rem" }}>Learning Steps</h3>

          {roadmap.steps.map((step, index) => (
            <p key={step}>{index + 1}. {step}</p>
          ))}

        </div>

      )}
      
      {roadmap && roadmap.message && (
        <div style={{ marginTop: "2rem", color: "red" }}>
          <p>{roadmap.message}</p>
        </div>
      )}

    </div>
  );
}

export default Roadmap;
