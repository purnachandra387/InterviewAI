const mongoose = require("mongoose");

const InterviewSchema = new mongoose.Schema({
    userId: String,
    role: String,
    questions: [String],
    answers: [String],
    score: Number,
    feedback: Object,
    report: Object,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Interview", InterviewSchema);
