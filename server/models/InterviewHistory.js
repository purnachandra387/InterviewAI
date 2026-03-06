const mongoose = require("mongoose");

const InterviewHistorySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        role: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ["hr", "technical", "both"],
            default: "both",
        },
        questions: {
            type: [String],
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("InterviewHistory", InterviewHistorySchema);
