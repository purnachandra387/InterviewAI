import React from "react";
import { useTheme } from "../ThemeContext";

export default function ThemeToggle() {
    const { theme, toggle } = useTheme();
    return (
        <button
            id="theme-toggle-btn"
            onClick={toggle}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--text-muted)",
                padding: "0.4rem 0.7rem",
                borderRadius: "10px",
                fontSize: "1rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
            }}
        >
            {theme === "dark" ? "☀️" : "🌙"}
        </button>
    );
}
