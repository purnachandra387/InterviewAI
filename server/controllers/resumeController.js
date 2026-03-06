const OpenAI = require("openai");
const pdfParse = require("pdf-parse");
const ResumeAnalysis = require("../models/ResumeAnalysis");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─────────────────────────────────────────────
// @route   POST /api/resume/analyze
// @desc    Upload PDF, extract text, analyze with AI
// @access  Private
// ─────────────────────────────────────────────
const analyzeResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please upload a PDF resume." });
        }

        // Extract text from PDF buffer
        let extractedText = "";
        try {
            const pdfData = await pdfParse(req.file.buffer);
            extractedText = pdfData.text?.trim();
        } catch {
            return res.status(422).json({ message: "Could not read PDF. Please make sure it's a valid, text-based PDF (not a scanned image)." });
        }

        if (!extractedText || extractedText.length < 50) {
            return res.status(422).json({ message: "The PDF appears to be empty or image-only. Please upload a text-based PDF." });
        }

        // Truncate to ~3000 chars to stay within token limits
        const truncated = extractedText.slice(0, 3000);

        const prompt = `You are an expert resume reviewer and ATS (Applicant Tracking System) specialist. Analyze the following resume text and provide a structured JSON response.

Resume Text:
"""
${truncated}
"""

Respond ONLY with valid JSON (no markdown, no extra text) in this exact format:
{
  "overallScore": <integer 0-100, ATS + quality score>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "improvements": ["<actionable improvement 1>", "<actionable improvement 2>", "<actionable improvement 3>", "<actionable improvement 4>"],
  "atsKeywords": ["<keyword present in resume>", ...],
  "missingKeywords": ["<important missing keyword>", ...],
  "sections": {
    "contact": <true if contact info present>,
    "summary": <true if professional summary/objective present>,
    "experience": <true if work experience present>,
    "education": <true if education section present>,
    "skills": <true if skills section present>,
    "projects": <true if projects section present>
  }
}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1000,
            temperature: 0.3,
        });

        const raw = completion.choices[0].message.content.trim();

        let analysis;
        try {
            analysis = JSON.parse(raw);
        } catch {
            // Try to extract JSON from response
            const match = raw.match(/\{[\s\S]*\}/);
            if (match) {
                analysis = JSON.parse(match[0]);
            } else {
                return res.status(500).json({ message: "AI returned unexpected format. Please try again." });
            }
        }

        // Save to DB
        const saved = await ResumeAnalysis.create({
            userId: req.user._id,
            filename: req.file.originalname,
            overallScore: Math.min(100, Math.max(0, parseInt(analysis.overallScore) || 50)),
            summary: analysis.summary || "",
            strengths: Array.isArray(analysis.strengths) ? analysis.strengths.slice(0, 6) : [],
            weaknesses: Array.isArray(analysis.weaknesses) ? analysis.weaknesses.slice(0, 6) : [],
            improvements: Array.isArray(analysis.improvements) ? analysis.improvements.slice(0, 6) : [],
            atsKeywords: Array.isArray(analysis.atsKeywords) ? analysis.atsKeywords.slice(0, 12) : [],
            missingKeywords: Array.isArray(analysis.missingKeywords) ? analysis.missingKeywords.slice(0, 8) : [],
            sections: analysis.sections || {},
        });

        res.status(200).json({
            message: "Resume analyzed ✅",
            analysisId: saved._id,
            ...saved.toObject(),
        });
    } catch (err) {
        if (err.status === 401) return res.status(401).json({ message: "Invalid OpenAI API key." });
        if (err.status === 429) return res.status(429).json({ message: "OpenAI rate limit hit. Please try again." });
        res.status(500).json({ message: "Analysis failed", error: err.message });
    }
};

// ─────────────────────────────────────────────
// @route   GET /api/resume/history
// @desc    Get user's past resume analyses
// @access  Private
// ─────────────────────────────────────────────
const getResumeHistory = async (req, res) => {
    try {
        const analyses = await ResumeAnalysis.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(10)
            .select("filename overallScore createdAt summary");
        res.status(200).json(analyses);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// ─────────────────────────────────────────────
// @route   GET /api/resume/history/:id
// @desc    Get full resume analysis by ID
// @access  Private
// ─────────────────────────────────────────────
const getResumeById = async (req, res) => {
    try {
        const doc = await ResumeAnalysis.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: "Analysis not found" });
        if (doc.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }
        res.status(200).json(doc);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

module.exports = { analyzeResume, getResumeHistory, getResumeById };
