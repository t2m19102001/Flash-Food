import express from "express";
import { addCategory, listCategories, updateCategory, removeCategory } from "../controllers/categoryController.js";
import { uploadMiddleware, handleUploadError } from "../middleware/upload.js";
import { adminMiddleware } from "../middleware/auth.js";

const categoryRouter = express.Router();

categoryRouter.post("/add", adminMiddleware, uploadMiddleware.single("image"), handleUploadError, addCategory);
categoryRouter.get("/list", listCategories);
categoryRouter.post("/update", adminMiddleware, uploadMiddleware.single("image"), handleUploadError, updateCategory);
categoryRouter.post("/remove", adminMiddleware, removeCategory);

export default categoryRouter;
