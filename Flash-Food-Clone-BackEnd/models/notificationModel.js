import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["info", "success", "warning", "error"], default: "info" },
    target: { type: String, enum: ["all", "users", "admins"], default: "all" },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    sentAt: { type: Date, default: Date.now },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }]
}, { timestamps: true });

const notificationModel = mongoose.models.notification || mongoose.model("notification", notificationSchema);
export default notificationModel;