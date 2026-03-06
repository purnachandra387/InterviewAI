const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const mockRoutes = require("./routes/mockRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const stripeRoutes = require("./routes/stripeRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const journalRoutes = require("./routes/journalRoutes");
const userRoutes = require("./routes/userRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const taskRoutes = require("./routes/taskRoutes");
const hrRoutes = require("./routes/hrRoutes");
const reportRoutes = require("./routes/reportRoutes");
const { webhook } = require("./controllers/stripeController");

const app = express();

app.use(cors());

// ── STRIPE WEBHOOK MUST BE BEFORE express.json() To verify raw buffer signatures ─
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), webhook);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/mock", mockRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/interview", require("./routes/interviewRoutes"));
app.use("/api/user", userRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/challenge", challengeRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/report", reportRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "AI Interview SaaS Backend Running 🚀" });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
    });
  })
  .catch((err) => {
    console.log("❌ Mongo Connection Error:", err.message);
    process.exit(1);
  });
