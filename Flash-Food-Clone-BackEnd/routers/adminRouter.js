import express from "express";
import { 
    adminLogin, 
    adminLogout, 
    checkAdminAuth, 
    changePassword,
    getAllAdmins,
    getAdminStats
} from "../controllers/adminController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const adminRouter = express.Router();

// ========== PUBLIC ROUTES ==========
adminRouter.post("/login", adminLogin);

// ========== PROTECTED ROUTES ==========
adminRouter.post("/logout", authMiddleware, adminLogout);
adminRouter.get("/check-auth", authMiddleware, checkAdminAuth);
adminRouter.post("/change-password", authMiddleware, changePassword);

// ========== ADMIN ONLY ROUTES ==========
adminRouter.get("/list", adminMiddleware, getAllAdmins);
adminRouter.get("/stats", adminMiddleware, getAdminStats);

// 🔥 TẠM THỜI TẮT SSE NOTIFICATION STREAM
// adminRouter.get("/notifications/stream", authMiddleware, notificationStream);

export default adminRouter;