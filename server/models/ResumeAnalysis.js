const mongoose = require("mongoose");

const ResumeAnalysisSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        filename: { type: String, default: "resume.pdf" },
        overallScore: { type: Number, default: 0 },       // 0-100
        summary: { type: String, default: "" },
        strengths: { type: [String], default: [] },
        weaknesses: { type: [String], default: [] },
        improvements: { type: [String], default: [] },
        atsKeywords: { type: [String], default: [] },
        missingKeywords: { type: [String], default: [] },
        sections: {
            contact: { type: Boolean, default: false },
            summary: { type: Boolean, default: false },
            experience: { type: Boolean, default: false },
            education: { type: Boolean, default: false },
            skills: { type: Boolean, default: false },
            projects: { type: Boolean, default: false },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ResumeAnalysis", ResumeAnalysisSchema);
