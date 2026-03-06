const express = require("express");
const multer = require("multer");
const router = express.Router();
const fs = require("fs");
const pdfParse = require("pdf-parse");
const analyzeResumeLocal = require("../utils/resumeAnalyzer");
const { getResumeHistory, getResumeById } = require("../controllers/resumeController");
const { protect } = require("../middleware/authMiddleware");

// Store PDF in memory (buffer) — no disk writes needed
const uploadMemory = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed"), false);
        }
    },
});

// Day 20 feature: Disk storage for /upload
const diskStorage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const uploadDisk = multer({ storage: diskStorage });

// Routes
router.post("/analyze", uploadDisk.single("resume"), async (req, res) => {
    try {
        let text = "";
        try {
            const data = await pdfParse(fs.readFileSync(req.file.path));
            text = data.text;
        } catch {
            text = fs.readFileSync(req.file.path, "utf8");
        }

        const result = analyzeResumeLocal(text);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get("/history", protect, getResumeHistory);
router.get("/history/:id", protect, getResumeById);

router.post("/upload", uploadDisk.single("resume"), (req, res) => {
    res.json({
        message: "Resume uploaded successfully",
        file: req.file.filename
    });
});

// Multer error handler
router.use((err, req, res, next) => {
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ message: "File too large. Maximum size is 5 MB." });
    }
    if (err.message === "Only PDF files are allowed") {
        return res.status(415).json({ message: "Only PDF files are accepted." });
    }
    next(err);
});

module.exports = router;
