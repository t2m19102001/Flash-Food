import express from "express";
import { 
    sendNotification, 
    getUserNotifications,
    getAdminNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from "../controllers/notificationController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const notificationRouter = express.Router();

// ========== USER ROUTES ==========
notificationRouter.get("/", authMiddleware, getUserNotifications);
notificationRouter.put("/:notificationId/read", authMiddleware, markAsRead);
notificationRouter.put("/read-all", authMiddleware, markAllAsRead);

// ========== ADMIN ROUTES ==========
notificationRouter.post("/send", authMiddleware, adminMiddleware, sendNotification);
notificationRouter.get("/admin", authMiddleware, adminMiddleware, getAdminNotifications);
notificationRouter.delete("/:id", authMiddleware, adminMiddleware, deleteNotification);
notificationRouter.put("/read-all", authMiddleware, markAllAsRead);

export default notificationRouter;