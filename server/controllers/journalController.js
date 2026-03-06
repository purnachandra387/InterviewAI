const JournalEntry = require("../models/JournalEntry");

// GET /api/journal  — list all entries (newest first)
exports.getEntries = async (req, res) => {
    try {
        const entries = await JournalEntry.find({ userId: req.user._id })
            .sort({ pinned: -1, createdAt: -1 })
            .select("-__v");
        res.json(entries);
    } catch (err) {
        res.status(500).json({ message: "Failed to load journal" });
    }
};

// POST /api/journal  — create entry
exports.createEntry = async (req, res) => {
    try {
        const { title, content, tags = [], mood = "good" } = req.body;
        if (!title?.trim() || !content?.trim()) {
            return res.status(400).json({ message: "Title and content are required" });
        }
        const entry = await JournalEntry.create({
            userId: req.user._id,
            title: title.trim(),
            content: content.trim(),
            tags: tags.filter(Boolean),
            mood,
        });
        res.status(201).json(entry);
    } catch (err) {
        res.status(500).json({ message: "Failed to create entry" });
    }
};

// PUT /api/journal/:id  — update entry
exports.updateEntry = async (req, res) => {
    try {
        const { title, content, tags, mood, pinned } = req.body;
        const entry = await JournalEntry.findOne({ _id: req.params.id, userId: req.user._id });
        if (!entry) return res.status(404).json({ message: "Entry not found" });

        if (title !== undefined) entry.title = title.trim();
        if (content !== undefined) entry.content = content.trim();
        if (tags !== undefined) entry.tags = tags.filter(Boolean);
        if (mood !== undefined) entry.mood = mood;
        if (pinned !== undefined) entry.pinned = pinned;

        await entry.save();
        res.json(entry);
    } catch (err) {
        res.status(500).json({ message: "Failed to update entry" });
    }
};

// DELETE /api/journal/:id  — delete entry
exports.deleteEntry = async (req, res) => {
    try {
        const entry = await JournalEntry.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!entry) return res.status(404).json({ message: "Entry not found" });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete entry" });
    }
};
