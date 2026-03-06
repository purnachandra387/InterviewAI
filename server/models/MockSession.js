const mongoose = require("mongoose");

const QnASchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, default: "" },
    score: { type: Number, min: 0, max: 10, default: 0 },
    feedback: { type: String, default: "" },
    tip: { type: String, default: "" },
});

const MockSessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        role: { type: String, required: true, trim: true },
        difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
        qna: { type: [QnASchema], default: [] },
        overallScore: { type: Number, default: 0 },    // 0-100 percentage
        status: { type: String, enum: ["completed", "abandoned"], default: "completed" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("MockSession", MockSessionSchema);
