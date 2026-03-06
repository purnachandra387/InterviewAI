const Notification = require("../models/Notification");
const Achievement = require("../models/Achievement");
const InterviewHistory = require("../models/InterviewHistory");
const MockSession = require("../models/MockSession");
const ResumeAnalysis = require("../models/ResumeAnalysis");

// ── All defined achievements ─────────────────────────────────
const ACHIEVEMENTS = [
    { slug: "first_question", icon: "🧠", title: "First Question", desc: "Generated your first interview question", check: (s) => s.totalQuestions >= 1 },
    { slug: "question_10", icon: "📚", title: "Question Machine", desc: "Generated 10+ interview questions", check: (s) => s.totalQuestions >= 10 },
    { slug: "question_50", icon: "🎓", title: "Question Scholar", desc: "Generated 50+ interview questions", check: (s) => s.totalQuestions >= 50 },
    { slug: "first_mock", icon: "🎯", title: "First Mock", desc: "Completed your first mock interview", check: (s) => s.totalMocks >= 1 },
    { slug: "mock_5", icon: "🏅", title: "Mock Pro", desc: "Completed 5+ mock interviews", check: (s) => s.totalMocks >= 5 },
    { slug: "mock_10", icon: "🥇", title: "Interview Ace", desc: "Completed 10+ mock interviews", check: (s) => s.totalMocks >= 10 },
    { slug: "perfect_score", icon: "💯", title: "Perfect Score", desc: "Scored 100/100 in a mock interview", check: (s) => s.bestMock >= 100 },
    { slug: "high_score_90", icon: "⭐", title: "High Achiever", desc: "Scored 90+ in a mock interview", check: (s) => s.bestMock >= 90 },
    { slug: "first_resume", icon: "📄", title: "Resume Reviewer", desc: "Analyzed your first resume", check: (s) => s.totalResumes >= 1 },
    { slug: "resume_5", icon: "📋", title: "Resume Master", desc: "Analyzed 5+ resumes", check: (s) => s.totalResumes >= 5 },
    { slug: "streak_3", icon: "🔥", title: "On Fire", desc: "Maintained a 3-day practice streak", check: (s) => s.streak >= 3 },
    { slug: "streak_7", icon: "⚡", title: "Week Warrior", desc: "Maintained a 7-day practice streak", check: (s) => s.streak >= 7 },
    { slug: "streak_30", icon: "🌟", title: "Consistency King", desc: "Maintained a 30-day practice streak", check: (s) => s.streak >= 30 },
];

// ── GET /api/notifications ───────────────────────────────────
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(30);
        const unreadCount = notifications.filter(n => !n.read).length;
        res.json({ notifications, unreadCount });
    } catch (err) {
        res.status(500).json({ message: "Failed to load notifications" });
    }
};

// ── POST /api/notifications/mark-read ───────────────────────
exports.markAllRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, read: false },
            { $set: { read: true } }
        );
        res.json({ message: "All marked as read" });
    } catch (err) {
        res.status(500).json({ message: "Failed to update notifications" });
    }
};

// ── POST /api/notifications/mark-read/:id ───────────────────
exports.markOneRead = async (req, res) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { $set: { read: true } }
        );
        res.json({ message: "Marked as read" });
    } catch (err) {
        res.status(500).json({ message: "Failed to update" });
    }
};

// ── DELETE /api/notifications/:id ───────────────────────────
exports.deleteNotification = async (req, res) => {
    try {
        await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete" });
    }
};

// ── GET /api/notifications/achievements ─────────────────────
exports.getAchievements = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch user stats
        const [histories, mocks, resumes] = await Promise.all([
            InterviewHistory.find({ userId }),
            MockSession.find({ userId, status: "completed" }),
            ResumeAnalysis ? ResumeAnalysis.find({ userId }) : Promise.resolve([]),
        ]);

        // Compute streak (last 30 days)
        function lastNDays(n) {
            const days = [];
            for (let i = n - 1; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                days.push(d.toISOString().split("T")[0]);
            }
            return days;
        }
        const days = lastNDays(30);
        const activitySet = new Set();
        histories.forEach(h => activitySet.add(new Date(h.createdAt).toISOString().split("T")[0]));
        mocks.forEach(m => activitySet.add(new Date(m.createdAt).toISOString().split("T")[0]));
        resumes.forEach(r => activitySet.add(new Date(r.createdAt).toISOString().split("T")[0]));
        let streak = 0;
        const today = new Date().toISOString().split("T")[0];
        for (let i = days.length - 1; i >= 0; i--) {
            if (activitySet.has(days[i])) streak++;
            else if (days[i] !== today) break;
        }

        const totalQuestions = histories.reduce((s, h) => s + (h.questions?.length || 1), 0);
        const bestMock = mocks.length ? Math.max(...mocks.map(m => m.overallScore)) : 0;

        const stats = {
            totalQuestions,
            totalMocks: mocks.length,
            totalResumes: resumes.length,
            bestMock,
            streak,
        };

        // Get existing earned achievements
        let achievementDoc = await Achievement.findOne({ userId });
        if (!achievementDoc) achievementDoc = await Achievement.create({ userId, earned: [] });

        const newlyEarned = [];
        for (const ach of ACHIEVEMENTS) {
            if (!achievementDoc.earned.includes(ach.slug) && ach.check(stats)) {
                achievementDoc.earned.push(ach.slug);
                newlyEarned.push(ach);

                // Create notification for new achievement
                await Notification.create({
                    userId,
                    type: "achievement",
                    title: `Achievement Unlocked: ${ach.title}`,
                    message: ach.desc,
                    icon: ach.icon,
                    link: "/analytics",
                });
            }
        }
        if (newlyEarned.length) await achievementDoc.save();

        // Return all achievements with earned status
        const allAchievements = ACHIEVEMENTS.map(ach => ({
            ...ach,
            earned: achievementDoc.earned.includes(ach.slug),
        }));

        res.json({ achievements: allAchievements, stats, newlyEarned: newlyEarned.length });
    } catch (err) {
        console.error("Achievements error:", err);
        res.status(500).json({ message: "Failed to load achievements" });
    }
};

// ── POST /api/notifications/coach-tip ─────────────────────── 
// Returns a daily AI coaching tip (mock if no AI key)
const DAILY_TIPS = [
    { icon: "🎯", tip: "The STAR method (Situation, Task, Action, Result) is your best friend for behavioral questions. Practice it daily." },
    { icon: "⚡", tip: "When stuck on a technical question, always think out loud. Interviewers value your problem-solving process over the final answer." },
    { icon: "🧠", tip: "Study system design basics: load balancers, CDNs, databases, and caching. These come up constantly in senior roles." },
    { icon: "💡", tip: "Research the company's tech stack before the interview. Showing familiarity with their tools signals genuine interest." },
    { icon: "🔥", tip: "Practice mock interviews out loud, not just in your head. Speaking fluently under pressure is a separate skill from knowing the answer." },
    { icon: "📚", tip: "For every role you apply to, customize your resume to match 3-5 keywords from the job description." },
    { icon: "🚀", tip: "Ask smart closing questions in interviews. 'What does success look like in the first 90 days?' shows initiative and foresight." },
    { icon: "💪", tip: "Build projects that solve real problems. Interviewers are more impressed by a useful CRUD app than a perfect but pointless algorithm." },
    { icon: "🎓", tip: "Don't just memorize algorithms — understand their time and space complexity so you can compare trade-offs confidently." },
    { icon: "🌟", tip: "Soft skills matter more than you think. Practice clear communication, active listening, and asking clarifying questions." },
    { icon: "📊", tip: "Quantify your experience: instead of 'improved performance', say 'reduced API response time by 40%'." },
    { icon: "🤝", tip: "Network actively. 70%+ of jobs are filled through referrals. Connect with engineers on LinkedIn after company events." },
    { icon: "🔍", tip: "Read the job description at least 3 times. Identify the core requirements and map each point to your experience." },
    { icon: "⏰", tip: "Time-box your answers in mock sessions. Most interview answers should be 1-3 minutes — practice being concise." },
    { icon: "🏋️", tip: "Treat your interview preparation like athletic training. Regular short sessions beat marathon cramming every time." },
];

exports.getCoachTip = async (req, res) => {
    try {
        // Cycle through tips based on the day of year for consistency
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        const tip = DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
        res.json({ tip, date: new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" }) });
    } catch (err) {
        res.status(500).json({ message: "Failed to load tip" });
    }
};

// ── GET /api/notifications/search?q= ────────────────────────
exports.searchHistory = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 2) return res.json({ results: [] });

        const userId = req.user._id;
        const regex = new RegExp(q.trim(), "i");

        const [histories, mocks] = await Promise.all([
            InterviewHistory.find({ userId, role: regex }).select("role type createdAt").limit(5),
            MockSession.find({ userId, role: regex }).select("role difficulty overallScore createdAt").limit(5),
        ]);

        const results = [
            ...histories.map(h => ({
                type: "question",
                icon: "🧠",
                title: h.role,
                subtitle: `${h.type} interview questions`,
                date: new Date(h.createdAt).toLocaleDateString(),
                link: "/history",
            })),
            ...mocks.map(m => ({
                type: "mock",
                icon: "🎯",
                title: m.role,
                subtitle: `Mock interview — Score: ${m.overallScore}%`,
                date: new Date(m.createdAt).toLocaleDateString(),
                link: "/history",
            })),
        ];

        res.json({ results });
    } catch (err) {
        res.status(500).json({ message: "Search failed" });
    }
};
