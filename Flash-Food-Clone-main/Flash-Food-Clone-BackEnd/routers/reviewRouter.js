import express from "express";
import { addReview, editReview, deleteReview, getFoodReviews, listReviews } from "../controllers/reviewController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const reviewRouter = express.Router();

reviewRouter.post("/add", authMiddleware, addReview);
reviewRouter.post("/edit", authMiddleware, editReview);
reviewRouter.post("/delete", authMiddleware, deleteReview);
reviewRouter.get("/food/:foodId", getFoodReviews);
reviewRouter.get("/list", adminMiddleware, listReviews);

export default reviewRouter;
