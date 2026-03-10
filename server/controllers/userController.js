const User = require("../models/User");
const Interview = require("../models/Interview");

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password").lean();

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const interviews = await Interview.find({ userId: userId.toString() }).select("score").lean();
        const totalInterviews = interviews.length;
        const totalScore = interviews.reduce((sum, interview) => sum + (interview.score || 0), 0);
        const avgScore = totalInterviews ? (totalScore / totalInterviews).toFixed(2) : 0;

        res.json({
            user,
            totalInterviews,
            avgScore,
        });
    } catch (err) {
        console.error("Profile API Error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

exports.getBadges = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("badges").lean();
        res.json(user ? user.badges : []);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};
