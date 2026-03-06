const Interview = require("../models/Interview");
const User = require("../models/User");
const questions = require("../data/questions");
const evaluateAnswer = require("../utils/evaluateAnswer");
const getBadges = require("../utils/badgeSystem");
const getRandomQuestions = require("../utils/randomQuestions");
const generateFeedback = require("../utils/feedbackGenerator");
const generateReport = require("../utils/reportGenerator");

exports.startInterview = async (req, res) => {
    try {
        const { role } = req.body;
        const roleKey = role.toLowerCase();

        const roleQuestions = questions[roleKey];

        if (!roleQuestions) {
            return res.json({ message: "Role not supported" });
        }

        const selectedQuestions = getRandomQuestions(roleQuestions, 5);

        const interview = await Interview.create({
            userId: req.user?._id || "demo-user",
            role,
            questions: selectedQuestions,
            answers: []
        });

        res.json(interview);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.saveAnswer = async (req, res) => {
    try {
        const { id } = req.params;
        const { answer } = req.body;

        const interview = await Interview.findById(id);
        if (!interview) return res.status(404).json({ message: "Interview not found" });

        interview.answers.push(answer);
        await interview.save();

        res.json({ message: "Answer saved", interview });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.submitAnswers = async (req, res) => {
    try {
        const { interviewId, answers } = req.body;

        let totalScore = 0;

        answers.forEach(ans => {
            totalScore += evaluateAnswer(ans);
        });

        const finalScore = totalScore / answers.length;

        const feedback = generateFeedback(answers);
        const report = generateReport(finalScore, feedback);

        const interview = await Interview.findByIdAndUpdate(
            interviewId,
            { answers, score: finalScore.toFixed(1), feedback, report },
            { new: true }
        );

        let demoUser = await User.findOne();
        if (demoUser) {
            const badges = getBadges((demoUser.totalInterviews || 0) + 1, finalScore);
            await User.findByIdAndUpdate(demoUser._id, {
                $inc: { totalInterviews: 1 },
                avgScore: finalScore,
                badges
            });
        }

        res.json(interview);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getInterviewHistory = async (req, res) => {
    try {
        const interviews = await Interview.find({
            userId: req.user?._id || "demo-user"
        }).sort({ createdAt: -1 });

        res.json(interviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProgress = async (req, res) => {
    try {
        const interviews = await Interview.find({
            userId: req.user?._id || "demo-user"
        });

        const total = interviews.length;

        const totalScore = interviews.reduce(
            (sum, i) => sum + (parseFloat(i.score) || 0),
            0
        );

        const avgScore = total
            ? (totalScore / total).toFixed(2)
            : 0;

        res.json({
            totalInterviews: total,
            avgScore,
            interviews
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};
