const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true,
    },
    password: String,
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    isPremium: {
        type: Boolean,
        default: false,
    },
    totalInterviews: {
        type: Number,
        default: 0,
    },
    avgScore: {
        type: Number,
        default: 0,
    },
    badges: {
        type: [String],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("User", UserSchema);
