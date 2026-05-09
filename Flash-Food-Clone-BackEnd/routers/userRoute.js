import express from "express";
import { 
    registerUser, 
    loginUser, 
    logoutUser,
    checkAuthStatus,
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

// 🔥 THÊM: Kiểm tra trạng thái đăng nhập
userRouter.get("/check-auth", authMiddleware, checkAuthStatus);

// 🔥 THÊM: Đăng xuất
userRouter.post("/logout", authMiddleware, logoutUser);

// Route cập nhật Profile: Cho phép sửa tên, email, SĐT, giới tính, ngày sinh, địa chỉ, ảnh...
userRouter.post("/update", 
    authMiddleware, 
    (req, res, next) => {
        // Hỗ trợ cả FormData và JSON
        uploadMiddleware.single("image")(req, res, (err) => {
            if (err) {
                return handleUploadError(err, req, res, next);
            }
            next();
        });
    }, 
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