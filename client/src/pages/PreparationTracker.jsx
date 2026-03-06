import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function PreparationTracker() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const navigate = useNavigate();

  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
        const res = await axios.get("https://interviewai-backend-0k7p.onrender.com/api/tasks", { headers });
        setTasks(res.data);
    } catch (err) {
        if (err?.response?.status === 401) {
            localStorage.clear();
            navigate("/login");
        }
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
        await axios.post(
          "https://interviewai-backend-0k7p.onrender.com/api/tasks/create",
          { title },
          { headers }
        );
        setTitle("");
        fetchTasks();
    } catch (err) {
        console.error("Failed to add task", err);
    }
  };

  const completeTask = async (id) => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
        await axios.put(`https://interviewai-backend-0k7p.onrender.com/api/tasks/complete/${id}`, {}, { headers });
        fetchTasks();
    } catch (err) {
        console.error("Failed to complete task", err);
    }
  };
  
  const deleteTask = async (id) => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
        await axios.delete(`https://interviewai-backend-0k7p.onrender.com/api/tasks/${id}`, { headers });
        fetchTasks();
    } catch (err) {
        console.error("Failed to delete task", err);
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div style={{ padding: "40px", maxWidth: "700px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <Link to="/dashboard" style={{ textDecoration: "none", color: "#3b82f6", display: "inline-block", marginBottom: "30px", fontSize: "16px", fontWeight: "bold" }}>
          ← Back to Dashboard
      </Link>

      <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>✅ Preparation Tracker</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Organize your interview preparation and track your progress.</p>
        
      {/* Progress Bar */}
      <div style={{ background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "12px", marginBottom: "30px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontWeight: "bold" }}>Overall Progress</span>
              <span style={{ color: "var(--primary)", fontWeight: "bold" }}>{progressPercent}%</span>
          </div>
          <div style={{ width: "100%", height: "10px", background: "rgba(255,255,255,0.1)", borderRadius: "5px", overflow: "hidden" }}>
              <div style={{ width: `${progressPercent}%`, height: "100%", background: "var(--primary)", transition: "width 0.3s ease" }}></div>
          </div>
          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "10px" }}>
              {completedCount} of {totalCount} tasks completed
          </p>
      </div>

      <form onSubmit={addTask} style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
        <input
          placeholder="e.g., Practice 10 DSA problems"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
          style={{ flex: 1, padding: "12px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.2)", color: "var(--text-color)", fontSize: "1rem" }}
        />
        <button type="submit" style={{ padding: "12px 24px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "1rem" }}>
          Add Task
        </button>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {tasks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                No tasks added yet. Start planning your prep!
            </div>
        ) : tasks.map(task => (
          <div key={task._id} style={{
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between",
              padding: "16px 20px", 
              background: "rgba(255,255,255,0.05)", 
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.05)",
              opacity: task.completed ? 0.6 : 1
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <div 
                    onClick={() => !task.completed && completeTask(task._id)}
                    style={{ 
                        width: "24px", 
                        height: "24px", 
                        borderRadius: "50%", 
                        border: `2px solid ${task.completed ? "var(--primary)" : "rgba(255,255,255,0.3)"}`,
                        background: task.completed ? "var(--primary)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: task.completed ? "default" : "pointer",
                        color: "#fff"
                    }}
                >
                    {task.completed && <span style={{ fontSize: "14px" }}>✓</span>}
                </div>
                <span style={{ 
                    fontSize: "1.1rem", 
                    textDecoration: task.completed ? "line-through" : "none",
                    color: task.completed ? "var(--text-muted)" : "var(--text-color)"
                }}>
                    {task.title}
                </span>
            </div>
            
            <button 
                onClick={() => deleteTask(task._id)}
                style={{
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                    opacity: 0.7
                }}
                onMouseOver={(e) => e.target.style.opacity = 1}
                onMouseOut={(e) => e.target.style.opacity = 0.7}
            >
                🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PreparationTracker;
