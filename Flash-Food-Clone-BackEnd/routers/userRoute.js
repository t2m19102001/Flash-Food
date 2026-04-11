import express from "express";
import { 
    registerUser, 
    loginUser, 
    listUsers, 
    deleteUser, 
    updateUser, 
    getProfile, 
    changePassword, 
    toggleUserStatus 
} from "../controllers/userController.js";
import { adminMiddleware, authMiddleware } from "../middleware/auth.js";
import { uploadMiddleware, handleUploadError } from "../middleware/upload.js";

const userRouter = express.Router();

/**
 * 1. CÁC ROUTE CÔNG KHAI (Không cần Token)
 */
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

/**
 * 2. CÁC ROUTE CHO NGƯỜI DÙNG (Yêu cầu Đăng nhập - authMiddleware)
 * Dùng authMiddleware để lấy được req.userId từ token, giúp user tự sửa profile của mình.
 */
userRouter.get("/profile", authMiddleware, getProfile);
userRouter.post("/change-password", authMiddleware, changePassword);

// Route cập nhật Profile: Cho phép sửa Email, tên, ảnh...
userRouter.post("/update", 
    authMiddleware, 
    uploadMiddleware.single("image"), 
    handleUploadError, 
    updateUser
);

/**
 * 3. CÁC ROUTE CHO ADMIN (Yêu cầu Quyền Admin - adminMiddleware)
 * Dùng để quản lý danh sách người dùng trong trang Dashboard Admin.
 */
userRouter.get("/list", adminMiddleware, listUsers);
userRouter.post("/delete", adminMiddleware, deleteUser);
userRouter.post("/toggle-status", adminMiddleware, toggleUserStatus);

export default userRouter;
