const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ["achievement", "streak", "tip", "system", "score"],
            default: "system",
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        icon: { type: String, default: "🔔" },
        read: { type: Boolean, default: false },
        link: { type: String, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
