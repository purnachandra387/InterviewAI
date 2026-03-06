import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    getJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry,
} from "../services/api";
import "./Journal.css";

const MOODS = [
    { key: "great", icon: "🚀", label: "Great", color: "#22c55e" },
    { key: "good", icon: "😊", label: "Good", color: "#6c63ff" },
    { key: "okay", icon: "😐", label: "Okay", color: "#f59e0b" },
    { key: "tough", icon: "😤", label: "Tough", color: "#ef4444" },
];

const MOOD_MAP = Object.fromEntries(MOODS.map(m => [m.key, m]));

export default function Journal() {
    const navigate = useNavigate();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEditor, setShowEditor] = useState(false);
    const [editing, setEditing] = useState(null); // null = new, entry = edit
    const [form, setForm] = useState({ title: "", content: "", tags: "", mood: "good" });
    const [saving, setSaving] = useState(false);
    const [searchQ, setSearchQ] = useState("");
    const [filter, setFilter] = useState("all"); // all | pinned

    const handleLogout = () => { localStorage.clear(); navigate("/login"); };

    const fetchEntries = async () => {
        try {
            const { data } = await getJournalEntries();
            setEntries(data);
        } catch (err) {
            if (err?.response?.status === 401) { localStorage.clear(); navigate("/login"); }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEntries(); }, [navigate]);

    const openNew = () => {
        setEditing(null);
        setForm({ title: "", content: "", tags: "", mood: "good" });
        setShowEditor(true);
        setTimeout(() => document.getElementById("journal-title-input")?.focus(), 100);
    };

    const openEdit = (entry) => {
        setEditing(entry);
        setForm({
            title: entry.title,
            content: entry.content,
            tags: entry.tags.join(", "),
            mood: entry.mood,
        });
        setShowEditor(true);
    };

    const handleSave = async () => {
        if (!form.title.trim() || !form.content.trim()) return;
        setSaving(true);
        try {
            const payload = {
                title: form.title.trim(),
                content: form.content.trim(),
                tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
                mood: form.mood,
            };
            if (editing) {
                const { data } = await updateJournalEntry(editing._id, payload);
                setEntries(prev => prev.map(e => e._id === editing._id ? data : e));
            } else {
                const { data } = await createJournalEntry(payload);
                setEntries(prev => [data, ...prev]);
            }
            setShowEditor(false);
        } catch { /* */ } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this journal entry?")) return;
        await deleteJournalEntry(id).catch(() => { });
        setEntries(prev => prev.filter(e => e._id !== id));
    };

    const togglePin = async (entry) => {
        try {
            const { data } = await updateJournalEntry(entry._id, { pinned: !entry.pinned });
            setEntries(prev => prev.map(e => e._id === entry._id ? data : e).sort((a, b) =>
                (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.createdAt) - new Date(a.createdAt)
            ));
        } catch { /* */ }
    };

    const displayed = entries
        .filter(e => filter === "pinned" ? e.pinned : true)
        .filter(e => !searchQ || e.title.toLowerCase().includes(searchQ.toLowerCase()) || e.content.toLowerCase().includes(searchQ.toLowerCase()));

    if (loading) return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
            <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
        </div>
    );

    return (
        <div className="journal-page">
            {/* Navbar */}
            <nav className="navbar">
                <div className="container navbar-inner">
                    <div className="navbar-logo">🧠 <span>Interview</span>AI</div>
                    <div className="navbar-user">
                        <Link to="/dashboard" className="btn" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-muted)", padding: "0.4rem 0.9rem", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 600 }}>← Dashboard</Link>
                        <button className="btn-logout" onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </nav>

            <div className="container journal-body">
                {/* Header */}
                <div className="journal-header fade-up">
                    <div>
                        <h1>📝 Practice Journal</h1>
                        <p>Reflect, document learnings, and track your interview journey.</p>
                    </div>
                    <button id="journal-new-btn" className="journal-new-btn" onClick={openNew}>
                        + New Entry
                    </button>
                </div>

                {/* Toolbar */}
                <div className="journal-toolbar fade-up">
                    <div className="journal-search-wrap">
                        <span>🔍</span>
                        <input
                            className="journal-search"
                            type="text"
                            placeholder="Search entries…"
                            value={searchQ}
                            onChange={e => setSearchQ(e.target.value)}
                        />
                    </div>
                    <div className="journal-filter-tabs">
                        <button className={`jf-tab ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All ({entries.length})</button>
                        <button className={`jf-tab ${filter === "pinned" ? "active" : ""}`} onClick={() => setFilter("pinned")}>📌 Pinned ({entries.filter(e => e.pinned).length})</button>
                    </div>
                </div>

                {/* Editor Modal Overlay */}
                {showEditor && (
                    <div className="journal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowEditor(false); }}>
                        <div className="journal-editor fade-up">
                            <div className="je-header">
                                <h2>{editing ? "Edit Entry" : "New Journal Entry"}</h2>
                                <button className="je-close" onClick={() => setShowEditor(false)}>✕</button>
                            </div>

                            <div className="je-body">
                                <div className="je-field">
                                    <label>Title</label>
                                    <input
                                        id="journal-title-input"
                                        className="je-input"
                                        type="text"
                                        placeholder="What's on your mind today?"
                                        value={form.title}
                                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                        maxLength={120}
                                    />
                                </div>

                                <div className="je-field">
                                    <label>How was your practice session?</label>
                                    <div className="je-mood-row">
                                        {MOODS.map(m => (
                                            <button
                                                key={m.key}
                                                type="button"
                                                className={`je-mood-btn ${form.mood === m.key ? "active" : ""}`}
                                                style={{ "--mood-color": m.color }}
                                                onClick={() => setForm(f => ({ ...f, mood: m.key }))}
                                            >
                                                {m.icon} {m.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="je-field">
                                    <label>Content</label>
                                    <textarea
                                        id="journal-content-input"
                                        className="je-textarea"
                                        placeholder="What did you practice? What did you learn? Any questions you struggled with?"
                                        value={form.content}
                                        onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                                        rows={8}
                                        maxLength={5000}
                                    />
                                    <div className="je-char-count">{form.content.length}/5000</div>
                                </div>

                                <div className="je-field">
                                    <label>Tags (comma-separated)</label>
                                    <input
                                        className="je-input"
                                        type="text"
                                        placeholder="e.g. system design, behavioral, mock"
                                        value={form.tags}
                                        onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="je-footer">
                                <button className="je-cancel-btn" onClick={() => setShowEditor(false)}>Cancel</button>
                                <button
                                    id="journal-save-btn"
                                    className="je-save-btn"
                                    onClick={handleSave}
                                    disabled={saving || !form.title.trim() || !form.content.trim()}
                                >
                                    {saving ? "Saving…" : editing ? "💾 Update Entry" : "💾 Save Entry"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Entry List */}
                {displayed.length === 0 ? (
                    <div className="journal-empty fade-up">
                        <div style={{ fontSize: "4rem" }}>📝</div>
                        <h3>{entries.length === 0 ? "Start Your Journey" : "No entries match your search"}</h3>
                        <p>{entries.length === 0 ? "Write your first journal entry to reflect on your practice and track progress." : "Try a different search or filter."}</p>
                        {entries.length === 0 && (
                            <button className="journal-new-btn" onClick={openNew}>Write First Entry</button>
                        )}
                    </div>
                ) : (
                    <div className="journal-grid fade-up">
                        {displayed.map(entry => {
                            const mood = MOOD_MAP[entry.mood] || MOODS[1];
                            return (
                                <div key={entry._id} className={`journal-card ${entry.pinned ? "pinned" : ""}`}>
                                    <div className="jc-top">
                                        <div className="jc-mood-badge" style={{ "--mood-color": mood.color }}>
                                            {mood.icon} {mood.label}
                                        </div>
                                        <div className="jc-actions">
                                            <button
                                                className={`jc-pin-btn ${entry.pinned ? "pinned" : ""}`}
                                                onClick={() => togglePin(entry)}
                                                title={entry.pinned ? "Unpin" : "Pin"}
                                            >
                                                📌
                                            </button>
                                            <button className="jc-edit-btn" onClick={() => openEdit(entry)} title="Edit">✏️</button>
                                            <button className="jc-del-btn" onClick={() => handleDelete(entry._id)} title="Delete">🗑️</button>
                                        </div>
                                    </div>
                                    <h3 className="jc-title">{entry.title}</h3>
                                    <p className="jc-content">{entry.content}</p>
                                    {entry.tags.length > 0 && (
                                        <div className="jc-tags">
                                            {entry.tags.map((tag, i) => (
                                                <span key={i} className="jc-tag">{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="jc-date">
                                        {new Date(entry.createdAt).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
