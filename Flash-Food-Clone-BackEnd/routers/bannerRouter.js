import express from "express";
import { getBanners, addBanner, updateBanner, deleteBanner } from "../controllers/bannerController.js";
import { authMiddleware } from "../middleware/auth.js";
import { uploadMiddleware, handleUploadError } from "../middleware/upload.js";

const bannerRouter = express.Router();

bannerRouter.get("/list", authMiddleware, getBanners);
bannerRouter.post("/add", authMiddleware, uploadMiddleware.single("image"), handleUploadError, addBanner);
bannerRouter.put("/update", authMiddleware, uploadMiddleware.single("image"), handleUploadError, updateBanner);
bannerRouter.delete("/delete", authMiddleware, deleteBanner);

export default bannerRouter;