import express from "express";
import { 
    addReview, 
    editReview, 
    deleteReview, 
    getFoodReviews, 
    listReviews,
    getUserReview,
    toggleReviewVisibility
} from "../controllers/reviewController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const reviewRouter = express.Router();

// User routes
reviewRouter.post("/add", authMiddleware, addReview);
reviewRouter.put("/edit/:reviewId", authMiddleware, editReview);
reviewRouter.delete("/delete/:reviewId", authMiddleware, deleteReview);
reviewRouter.get("/my-review/:foodId", authMiddleware, getUserReview);

// Public routes
reviewRouter.get("/food/:foodId", getFoodReviews);

// Admin routes
reviewRouter.get("/list", authMiddleware, adminMiddleware, listReviews);
reviewRouter.patch("/toggle-visibility/:reviewId", authMiddleware, adminMiddleware, toggleReviewVisibility);

export default reviewRouter;