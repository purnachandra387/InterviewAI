const InterviewHistory = require("../models/InterviewHistory");
const MockSession = require("../models/MockSession");
const ResumeAnalysis = require("../models/ResumeAnalysis");

// Helper — last N days labels
function lastNDays(n) {
    const days = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split("T")[0]); // "YYYY-MM-DD"
    }
    return days;
}

exports.getAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;

        // ── Fetch raw data in parallel ──────────────────────────────
        const [histories, mocks, resumes] = await Promise.all([
            InterviewHistory.find({ userId }).sort({ createdAt: 1 }),
            MockSession.find({ userId, status: "completed" }).sort({ createdAt: 1 }),
            ResumeAnalysis ? ResumeAnalysis.find({ userId }).sort({ createdAt: 1 }) : Promise.resolve([]),
        ]);

        // ── 1. Daily Activity (last 30 days) ────────────────────────
        const days = lastNDays(30);
        const activityMap = {};
        days.forEach(d => (activityMap[d] = { questions: 0, mocks: 0, resumes: 0 }));

        histories.forEach(h => {
            const d = new Date(h.createdAt).toISOString().split("T")[0];
            if (activityMap[d]) activityMap[d].questions++;
        });
        mocks.forEach(m => {
            const d = new Date(m.createdAt).toISOString().split("T")[0];
            if (activityMap[d]) activityMap[d].mocks++;
        });
        resumes.forEach(r => {
            const d = new Date(r.createdAt).toISOString().split("T")[0];
            if (activityMap[d]) activityMap[d].resumes++;
        });

        const dailyActivity = days.map(d => ({
            date: d,
            label: new Date(d).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
            ...activityMap[d],
            total: activityMap[d].questions + activityMap[d].mocks + activityMap[d].resumes,
        }));

        // ── 2. Mock Score Trend (last 10 sessions) ──────────────────
        const recentMocks = mocks.slice(-10);
        const mockScoreTrend = recentMocks.map((m, i) => ({
            session: i + 1,
            label: `Session ${mocks.indexOf(m) + 1}`,
            score: m.overallScore,
            role: m.role,
            difficulty: m.difficulty,
            date: new Date(m.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
        }));

        // ── 3. Interview Type Breakdown ─────────────────────────────
        const typeCounts = { hr: 0, technical: 0, both: 0 };
        histories.forEach(h => { if (typeCounts[h.type] !== undefined) typeCounts[h.type]++; });
        const typeBreakdown = [
            { label: "HR", value: typeCounts.hr, color: "#6c63ff" },
            { label: "Technical", value: typeCounts.technical, color: "#ff6584" },
            { label: "Mixed", value: typeCounts.both, color: "#22c55e" },
        ].filter(t => t.value > 0);

        // ── 4. Difficulty Breakdown (from mocks) ────────────────────
        const diffCounts = { easy: 0, medium: 0, hard: 0 };
        mocks.forEach(m => { if (diffCounts[m.difficulty] !== undefined) diffCounts[m.difficulty]++; });
        const diffBreakdown = [
            { label: "Easy", value: diffCounts.easy, color: "#22c55e" },
            { label: "Medium", value: diffCounts.medium, color: "#f59e0b" },
            { label: "Hard", value: diffCounts.hard, color: "#ef4444" },
        ].filter(d => d.value > 0);

        // ── 5. Top Roles practiced ───────────────────────────────────
        const roleMap = {};
        [...histories, ...mocks].forEach(item => {
            const r = item.role?.trim();
            if (r) roleMap[r] = (roleMap[r] || 0) + 1;
        });
        const topRoles = Object.entries(roleMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([role, count]) => ({ role, count }));

        // ── 6. Summary Stats ────────────────────────────────────────
        const avgMockScore = mocks.length
            ? Math.round(mocks.reduce((s, m) => s + m.overallScore, 0) / mocks.length)
            : 0;

        const bestMock = mocks.length
            ? Math.max(...mocks.map(m => m.overallScore))
            : 0;

        const streak = (() => {
            let count = 0;
            const today = new Date().toISOString().split("T")[0];
            for (let i = days.length - 1; i >= 0; i--) {
                if (activityMap[days[i]].total > 0) count++;
                else if (days[i] !== today) break;
            }
            return count;
        })();

        const totalQuestions = histories.reduce((s, h) => s + (h.questions?.length || 1), 0);

        res.json({
            summary: {
                totalSessions: histories.length,
                totalQuestions,
                totalMocks: mocks.length,
                totalResumes: resumes.length,
                avgMockScore,
                bestMock,
                streak,
            },
            dailyActivity,
            mockScoreTrend,
            typeBreakdown,
            diffBreakdown,
            topRoles,
        });
    } catch (err) {
        console.error("Analytics error:", err);
        res.status(500).json({ message: "Failed to load analytics" });
    }
};
