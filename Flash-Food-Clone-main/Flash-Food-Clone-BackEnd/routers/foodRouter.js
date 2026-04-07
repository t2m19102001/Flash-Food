import express from 'express';
import { addFood, listFood, removeFood, updateFood, toggleAvailability } from '../controllers/foodController.js';
import { uploadMiddleware, handleUploadError } from '../middleware/upload.js';
import { adminMiddleware } from '../middleware/auth.js';

const foodRouter = express.Router();

foodRouter.post("/add", adminMiddleware, uploadMiddleware.single("image"), handleUploadError, addFood);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", adminMiddleware, removeFood);
foodRouter.post("/update", adminMiddleware, uploadMiddleware.single("image"), handleUploadError, updateFood);
foodRouter.post("/toggle-availability", adminMiddleware, toggleAvailability);

export default foodRouter;