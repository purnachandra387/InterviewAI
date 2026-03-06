import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getNotifications, markAllNotificationsRead, deleteNotification } from "../services/api";
import "./Notifications.css";

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const { data } = await getNotifications();
            setNotifications(data.notifications || []);
            setUnread(data.unreadCount || 0);
        } catch {
            /* silently fail */
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // poll every minute
        return () => clearInterval(interval);
    }, []);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleOpen = () => {
        setOpen(v => !v);
        if (!open && unread > 0) {
            markAllNotificationsRead().then(fetchNotifications).catch(() => { });
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        await deleteNotification(id).catch(() => { });
        setNotifications(prev => prev.filter(n => n._id !== id));
    };

    const handleClick = (n) => {
        setOpen(false);
        if (n.link) navigate(n.link);
    };

    return (
        <div className="notif-bell-wrap" ref={dropRef}>
            <button
                id="notif-bell-btn"
                className={`notif-bell-btn ${open ? "active" : ""}`}
                onClick={handleOpen}
                title="Notifications"
            >
                🔔
                {unread > 0 && (
                    <span className="notif-badge">{unread > 9 ? "9+" : unread}</span>
                )}
            </button>

            {open && (
                <div className="notif-dropdown">
                    <div className="notif-header">
                        <span>🔔 Notifications</span>
                        {notifications.length > 0 && (
                            <button
                                className="notif-clear-all"
                                onClick={async () => {
                                    await markAllNotificationsRead().catch(() => { });
                                    fetchNotifications();
                                }}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="notif-list">
                        {loading && notifications.length === 0 ? (
                            <div className="notif-empty">Loading…</div>
                        ) : notifications.length === 0 ? (
                            <div className="notif-empty">
                                <div className="notif-empty-icon">🎉</div>
                                <div>You're all caught up!</div>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n._id}
                                    className={`notif-item ${!n.read ? "unread" : ""}`}
                                    onClick={() => handleClick(n)}
                                >
                                    <div className="notif-item-icon">{n.icon}</div>
                                    <div className="notif-item-body">
                                        <div className="notif-item-title">{n.title}</div>
                                        <div className="notif-item-msg">{n.message}</div>
                                        <div className="notif-item-time">
                                            {new Date(n.createdAt).toLocaleDateString("en-IN", {
                                                month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                                            })}
                                        </div>
                                    </div>
                                    <button
                                        className="notif-item-del"
                                        onClick={(e) => handleDelete(e, n._id)}
                                        title="Dismiss"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
