import express from "express";
import { registerUser, loginUser, listUsers, deleteUser, updateUser, getProfile, changePassword, toggleUserStatus } from "../controllers/userController.js";
import { adminMiddleware, authMiddleware } from "../middleware/auth.js";
import { uploadMiddleware, handleUploadError } from "../middleware/upload.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/list", adminMiddleware, listUsers);
userRouter.post("/delete", adminMiddleware, deleteUser);
userRouter.post("/update", adminMiddleware, uploadMiddleware.single("image"), handleUploadError, updateUser);
userRouter.post("/toggle-status", adminMiddleware, toggleUserStatus);
userRouter.get("/profile", authMiddleware, getProfile);
userRouter.post("/change-password", authMiddleware, changePassword);

export default userRouter;