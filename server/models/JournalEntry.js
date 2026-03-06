const mongoose = require("mongoose");

const JournalEntrySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: { type: String, required: true, trim: true, maxlength: 120 },
        content: { type: String, required: true, maxlength: 5000 },
        tags: { type: [String], default: [] },
        mood: {
            type: String,
            enum: ["great", "good", "okay", "tough"],
            default: "good",
        },
        pinned: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("JournalEntry", JournalEntrySchema);
