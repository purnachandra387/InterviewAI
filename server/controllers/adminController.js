const User = require("../models/User");
const Interview = require("../models/Interview");
const InterviewHistory = require("../models/InterviewHistory");
const MockSession = require("../models/MockSession");

const getAdminOverview = async (req, res) => {
    try {
        const [
            totalUsers,
            adminUsers,
            premiumUsers,
            totalDay13Interviews,
            totalQuestionGenerations,
            totalMockSessions,
            recentUsers,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: "admin" }),
            User.countDocuments({ isPremium: true }),
            Interview.countDocuments(),
            InterviewHistory.countDocuments(),
            MockSession.countDocuments(),
            User.find()
                .select("name email role isPremium createdAt")
                .sort({ createdAt: -1 })
                .limit(8)
                .lean(),
        ]);

        res.status(200).json({
            summary: {
                totalUsers,
                adminUsers,
                regularUsers: Math.max(totalUsers - adminUsers, 0),
                premiumUsers,
                totalDay13Interviews,
                totalQuestionGenerations,
                totalMockSessions,
            },
            recentUsers,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

module.exports = { getAdminOverview };
