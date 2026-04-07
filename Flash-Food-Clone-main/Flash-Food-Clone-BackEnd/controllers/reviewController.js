import reviewModel from "../models/reviewModel.js";
import foodModel from "../models/foodModel.js";

// Add review
const addReview = async (req, res) => {
    try {
        const userId = req.userId;
        const { foodId, rating, comment } = req.body;

        if (!foodId || !rating) {
            return res.json({ success: false, message: "Food ID and rating are required" });
        }

        if (rating < 1 || rating > 5) {
            return res.json({ success: false, message: "Rating must be between 1 and 5" });
        }

        // Check if food exists
        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.json({ success: false, message: "Food not found" });
        }

        // Check if user already reviewed this food
        const existingReview = await reviewModel.findOne({ userId, foodId });
        if (existingReview) {
            return res.json({ success: false, message: "You already reviewed this food" });
        }

        const review = new reviewModel({
            userId,
            foodId,
            rating,
            comment: comment || ""
        });

        await review.save();
        res.json({ success: true, message: "Review added", review });
    } catch (error) {
        console.error("Error adding review:", error);
        res.json({ success: false, message: "Error adding review" });
    }
};

// Edit review
const editReview = async (req, res) => {
    try {
        const userId = req.userId;
        const { reviewId, rating, comment } = req.body;

        if (rating && (rating < 1 || rating > 5)) {
            return res.json({ success: false, message: "Rating must be between 1 and 5" });
        }

        const review = await reviewModel.findById(reviewId);
        if (!review) {
            return res.json({ success: false, message: "Review not found" });
        }

        // Only owner can edit
        if (review.userId.toString() !== userId) {
            return res.json({ success: false, message: "You can only edit your own reviews" });
        }

        if (rating) review.rating = rating;
        if (comment !== undefined) review.comment = comment;

        await review.save();
        res.json({ success: true, message: "Review updated", review });
    } catch (error) {
        console.error("Error editing review:", error);
        res.json({ success: false, message: "Error editing review" });
    }
};

// Delete review
const deleteReview = async (req, res) => {
    try {
        const userId = req.userId;
        const isAdmin = req.user && req.user.isAdmin;
        const { reviewId } = req.body;

        const review = await reviewModel.findById(reviewId);
        if (!review) {
            return res.json({ success: false, message: "Review not found" });
        }

        // Owner or admin can delete
        if (review.userId.toString() !== userId && !isAdmin) {
            return res.json({ success: false, message: "You can only delete your own reviews" });
        }

        await reviewModel.findByIdAndDelete(reviewId);
        res.json({ success: true, message: "Review deleted" });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.json({ success: false, message: "Error deleting review" });
    }
};

// Get reviews for a food item
const getFoodReviews = async (req, res) => {
    try {
        const { foodId } = req.params;
        const reviews = await reviewModel.find({ foodId }).populate("userId", "name image");
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        res.json({
            success: true,
            reviews,
            averageRating: Math.round(avgRating * 10) / 10,
            totalReviews: reviews.length
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.json({ success: false, message: "Error fetching reviews" });
    }
};

// List all reviews (admin)
const listReviews = async (req, res) => {
    try {
        const reviews = await reviewModel.find({})
            .populate("userId", "name email")
            .populate("foodId", "name image");
        res.json({ success: true, reviews });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.json({ success: false, message: "Error fetching reviews" });
    }
};

export { addReview, editReview, deleteReview, getFoodReviews, listReviews };
