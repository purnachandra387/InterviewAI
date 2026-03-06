const User = require("../models/User");
const Interview = require("../models/Interview");
const mongoose = require("mongoose");

exports.getProfile = async (req, res) => {
    try {
        let userId = "demo-user";
        let user;

        if (mongoose.Types.ObjectId.isValid(userId)) {
            user = await User.findById(userId);
        } else {
            user = await User.findOne();
            if (user) {
                userId = user._id.toString();
            } else {
                user = { name: "Demo User", email: "demo@example.com" };
            }
        }

        const interviews = await Interview.find({ userId });
        const totalInterviews = interviews.length;
        const totalScore = interviews.reduce((sum, i) => sum + (i.score || 0), 0);
        const avgScore = totalInterviews ? (totalScore / totalInterviews).toFixed(2) : 0;

        res.json({
            user,
            totalInterviews,
            avgScore
        });
    } catch (err) {
        console.error("Profile API Error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

exports.getBadges = async (req, res) => {
    try {
        const user = await User.findOne();
        res.json(user ? user.badges : []);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};
