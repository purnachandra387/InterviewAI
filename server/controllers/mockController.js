const OpenAI = require("openai");
const MockSession = require("../models/MockSession");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─────────────────────────────────────────────
// @route   POST /api/mock/start
// @desc    Generate interview questions for the session
// @access  Private
// ─────────────────────────────────────────────
const startInterview = async (req, res) => {
    try {
        const { role, difficulty = "medium", questionCount = 5 } = req.body;

        if (!role) return res.status(400).json({ message: "Job role is required" });

        const count = Math.min(Math.max(parseInt(questionCount) || 5, 3), 10);

        const difficultyMap = {
            easy: "basic/fresher-level",
            medium: "intermediate",
            hard: "advanced/senior-level",
        };

        const prompt = `Generate exactly ${count} ${difficultyMap[difficulty]} interview questions for a ${role} candidate. Mix technical and behavioral questions. Return ONLY a numbered list, one question per line. No extra text.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are an expert technical interviewer. Generate clear, diverse, and well-scoped interview questions.",
                },
                { role: "user", content: prompt },
            ],
            max_tokens: 800,
            temperature: 0.75,
        });

        const raw = completion.choices[0].message.content;
        const questions = raw
            .split("\n")
            .map((l) => l.trim())
            .filter((l) => /^\d+[\.\)]/.test(l))
            .map((l) => l.replace(/^\d+[\.\)]\s*/, "").trim())
            .filter(Boolean)
            .slice(0, count);

        res.status(200).json({ questions, role, difficulty });
    } catch (err) {
        if (err.status === 401) return res.status(401).json({ message: "Invalid OpenAI API key." });
        if (err.status === 429) return res.status(429).json({ message: "OpenAI rate limit hit. Try again." });
        res.status(500).json({ message: "Failed to generate questions", error: err.message });
    }
};

// ─────────────────────────────────────────────
// @route   POST /api/mock/evaluate
// @desc    Evaluate a single answer with AI
// @access  Private
// ─────────────────────────────────────────────
const evaluateAnswer = async (req, res) => {
    try {
        const { role, question, answer, difficulty = "medium" } = req.body;

        if (!question || !answer) {
            return res.status(400).json({ message: "Question and answer are required" });
        }

        // Skipped answer
        if (answer.trim() === "") {
            return res.status(200).json({ score: 0, feedback: "Question was skipped.", tip: "" });
        }

        const prompt = `You are evaluating a mock interview for a "${role}" candidate (${difficulty} difficulty).

Question: ${question}
Candidate's Answer: ${answer}

Evaluate based on accuracy, completeness, and clarity. Respond in this EXACT JSON format (no markdown):
{
  "score": <integer 1-10>,
  "feedback": "<2-3 sentence evaluation of the answer>",
  "tip": "<one sentence improvement tip>"
}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 300,
            temperature: 0.4,
        });

        const raw = completion.choices[0].message.content.trim();
        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch {
            // Fallback if JSON is malformed
            parsed = { score: 5, feedback: raw, tip: "" };
        }

        res.status(200).json({
            score: Math.min(10, Math.max(0, parseInt(parsed.score) || 5)),
            feedback: parsed.feedback || "",
            tip: parsed.tip || "",
        });
    } catch (err) {
        if (err.status === 429) return res.status(429).json({ message: "Rate limit hit. Try again in a moment." });
        res.status(500).json({ message: "Evaluation failed", error: err.message });
    }
};

// ─────────────────────────────────────────────
// @route   POST /api/mock/save
// @desc    Save completed session to DB
// @access  Private
// ─────────────────────────────────────────────
const saveSession = async (req, res) => {
    try {
        const { role, difficulty, qna } = req.body;

        if (!role || !qna || !Array.isArray(qna) || qna.length === 0) {
            return res.status(400).json({ message: "Invalid session data" });
        }

        const totalScore = qna.reduce((sum, q) => sum + (q.score || 0), 0);
        const maxScore = qna.length * 10;
        const overallScore = Math.round((totalScore / maxScore) * 100);

        const session = await MockSession.create({
            userId: req.user._id,
            role,
            difficulty,
            qna,
            overallScore,
            status: "completed",
        });

        res.status(201).json({
            message: "Session saved ✅",
            sessionId: session._id,
            overallScore,
        });
    } catch (err) {
        res.status(500).json({ message: "Could not save session", error: err.message });
    }
};

// ─────────────────────────────────────────────
// @route   GET /api/mock/history
// @desc    Get user's mock interview history
// @access  Private
// ─────────────────────────────────────────────
const getMockHistory = async (req, res) => {
    try {
        const sessions = await MockSession.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20)
            .select("-qna"); // omit big qna array in list view
        res.status(200).json(sessions);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// ─────────────────────────────────────────────
// @route   GET /api/mock/history/:id
// @desc    Get a single mock session (with full QnA)
// @access  Private
// ─────────────────────────────────────────────
const getMockSession = async (req, res) => {
    try {
        const session = await MockSession.findById(req.params.id);
        if (!session) return res.status(404).json({ message: "Session not found" });
        if (session.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }
        res.status(200).json(session);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

module.exports = { startInterview, evaluateAnswer, saveSession, getMockHistory, getMockSession };
