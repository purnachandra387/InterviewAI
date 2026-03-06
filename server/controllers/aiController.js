const OpenAI = require("openai");
const InterviewHistory = require("../models/InterviewHistory");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


// ─────────────────────────────────────────────
// @route   POST /api/ai/generate
// @desc    Generate interview questions for a role
// @access  Private
// ─────────────────────────────────────────────
const generateQuestions = async (req, res) => {
    const { role, type = "both" } = req.body;

    if (!role) {
        return res.status(400).json({ message: "Job role is required" });
    }

    try {

        // Build prompt based on type
        let prompt = "";
        if (type === "hr") {
            prompt = `Generate 5 HR/behavioral interview questions for a ${role} fresher. Format as a numbered list. Keep them concise and practical.`;
        } else if (type === "technical") {
            prompt = `Generate 5 technical interview questions for a ${role} fresher. Format as a numbered list. Keep them specific and practical.`;
        } else {
            prompt = `Generate 3 HR/behavioral and 3 technical interview questions for a ${role} fresher. Label them clearly. Format as a numbered list.`;
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content:
                        "You are an expert technical interviewer. Generate clear, relevant, and concise interview questions tailored to the job role provided.",
                },
                { role: "user", content: prompt },
            ],
            max_tokens: 800,
            temperature: 0.7,
        });

        const rawText = completion.choices[0].message.content;

        // Parse numbered list into array
        const questions = rawText
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => /^\d+[\.\)]/.test(line))
            .map((line) => line.replace(/^\d+[\.\)]\s*/, "").trim());

        // Save to DB
        const history = await InterviewHistory.create({
            userId: req.user._id,
            role,
            type,
            questions,
        });

        res.status(200).json({
            message: "Questions generated ✅",
            role,
            questions,
            historyId: history._id,
        });
    } catch (err) {
        if (err.status === 401 || err.status === 429 || err?.message?.includes("API key")) {
            // Fallback to static AI logic on rate limit or auth failure
            const fallbackDB = require("../data/questions");
            const hrDB = require("../data/hrQuestions") || [];
            
            const roleKey = Object.keys(fallbackDB).find(r => role.toLowerCase().includes(r.toLowerCase())) || "frontend developer";
            let offlineQues = [];

            if (type === "hr") {
                offlineQues = hrDB.slice(0, 5);
            } else if (type === "technical") {
                offlineQues = fallbackDB[roleKey] || fallbackDB["frontend developer"];
            } else {
                offlineQues = [
                    ...hrDB.slice(0, 3),
                    ...(fallbackDB[roleKey] || fallbackDB["frontend developer"]).slice(0, 3)
                ];
            }

            // Save fallback to DB
            const history = await InterviewHistory.create({
                userId: req.user._id,
                role,
                type,
                questions: offlineQues,
            });

            return res.status(200).json({
                message: "Questions generated (using offline dataset ✅)",
                role,
                questions: offlineQues,
                historyId: history._id,
            });
        }
        res.status(500).json({ message: "AI generation failed", error: err.message });
    }
};

// ─────────────────────────────────────────────
// @route   GET /api/ai/history
// @desc    Get user's question history
// @access  Private
// ─────────────────────────────────────────────
const getHistory = async (req, res) => {
    try {
        const history = await InterviewHistory.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.status(200).json(history);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// ─────────────────────────────────────────────
// @route   GET /api/ai/stats
// @desc    Get user's aggregate stats
// @access  Private
// ─────────────────────────────────────────────
const getStats = async (req, res) => {
    try {
        const sessions = await InterviewHistory.find({ userId: req.user._id });
        const totalSessions = sessions.length;
        const totalQuestions = sessions.reduce((acc, s) => acc + s.questions.length, 0);
        res.status(200).json({ totalSessions, totalQuestions });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// ─────────────────────────────────────────────
// @route   DELETE /api/ai/history/:id
// @desc    Delete a history session
// @access  Private
// ─────────────────────────────────────────────
const deleteHistory = async (req, res) => {
    try {
        const session = await InterviewHistory.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        // Ensure the session belongs to the requesting user
        if (session.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }
        await session.deleteOne();
        res.status(200).json({ message: "Session deleted ✅" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// ─────────────────────────────────────────────
// @route   POST /api/ai/company-prep
// @desc    Generate company-specific prep pack
// @access  Private
// ─────────────────────────────────────────────
const getCompanyPrep = async (req, res) => {
    try {
        const { company, role = "Software Engineer" } = req.body;
        if (!company) return res.status(400).json({ message: "Company name is required" });

        const prompt = `You are an expert tech career coach. A candidate is preparing for a "${role}" interview at "${company}".

Provide a structured prep pack in this EXACT JSON format (no markdown, no extra text):
{
  "overview": "<2-3 sentence description of the company culture and what they look for in candidates>",
  "process": ["<interview round 1 description>", "<round 2>", "<round 3>", "<round 4 if applicable>"],
  "technicalQuestions": ["<question 1>", "<question 2>", "<question 3>", "<question 4>", "<question 5>"],
  "behavioralQuestions": ["<question 1>", "<question 2>", "<question 3>", "<question 4>"],
  "tips": ["<specific tip 1 for this company>", "<tip 2>", "<tip 3>", "<tip 4>"]
}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1200,
            temperature: 0.5,
        });

        const raw = completion.choices[0].message.content.trim();
        let pack;
        try {
            pack = JSON.parse(raw);
        } catch {
            const match = raw.match(/\{[\s\S]*\}/);
            if (match) pack = JSON.parse(match[0]);
            else return res.status(500).json({ message: "AI returned unexpected format. Try again." });
        }

        // Save combined questions to InterviewHistory
        const allQuestions = [
            ...(pack.technicalQuestions || []),
            ...(pack.behavioralQuestions || []),
        ];
        if (allQuestions.length > 0) {
            await InterviewHistory.create({
                userId: req.user._id,
                role: `${company} – ${role}`,
                type: "both",
                questions: allQuestions,
            });
        }

        res.status(200).json({ company, role, ...pack });
    } catch (err) {
        if (err.status === 429) return res.status(429).json({ message: "Rate limit hit. Try again." });
        res.status(500).json({ message: "Company prep failed", error: err.message });
    }
}

module.exports = { generateQuestions, getHistory, getStats, deleteHistory, getCompanyPrep };
