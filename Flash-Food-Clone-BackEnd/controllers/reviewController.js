import reviewModel from "../models/reviewModel.js";
import foodModel from "../models/foodModel.js";
import mongoose from "mongoose";

// Helper: Cập nhật rating trung bình cho món ăn
const updateFoodAverageRating = async (foodId) => {
    try {
        const result = await reviewModel.aggregate([
            { $match: { foodId: new mongoose.Types.ObjectId(foodId), isVisible: true } },
            { $group: { _id: "$foodId", averageRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } }
        ]);

        const avgRating = result.length > 0 ? Math.round(result[0].averageRating * 10) / 10 : 0;
        const totalReviews = result.length > 0 ? result[0].totalReviews : 0;

        await foodModel.findByIdAndUpdate(foodId, {
            rating: avgRating,
            ratingCount: totalReviews
        });
        
        console.log(`✅ Updated rating for food ${foodId}: ${avgRating} (${totalReviews} reviews)`);
    } catch (error) {
        console.error("Lỗi updateFoodAverageRating:", error);
    }
};

// ========== 1. ADD REVIEW ==========
const addReview = async (req, res) => {
    try {
        const userId = req.userId || req.user?.id;
        const { foodId, rating, comment } = req.body;

        console.log("📝 addReview - userId:", userId);
        console.log("📝 addReview - foodId:", foodId, "rating:", rating);

        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: "Vui lòng đăng nhập để đánh giá" 
            });
        }

        if (!foodId) {
            return res.status(400).json({ 
                success: false, 
                message: "Vui lòng chọn món ăn" 
            });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ 
                success: false, 
                message: "Vui lòng chọn số sao từ 1 đến 5" 
            });
        }

        if (!comment || !comment.trim()) {
            return res.status(400).json({ 
                success: false, 
                message: "Vui lòng nhập nội dung đánh giá" 
            });
        }

        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.status(404).json({ 
                success: false, 
                message: "Món ăn không tồn tại" 
            });
        }

        const existingReview = await reviewModel.findOne({ userId, foodId });
        if (existingReview) {
            return res.status(400).json({ 
                success: false, 
                message: "Bạn đã đánh giá món ăn này rồi" 
            });
        }

        const review = new reviewModel({
            userId,
            foodId,
            rating: Number(rating),
            comment: comment.trim(),
            isVisible: true
        });

        await review.save();
        console.log("✅ Review created:", review._id);

        await updateFoodAverageRating(foodId);

        const populatedReview = await reviewModel.findById(review._id)
            .populate("userId", "name image");

        res.status(201).json({ 
            success: true, 
            message: "Đánh giá thành công",
            review: populatedReview
        });

    } catch (error) {
        console.error("❌ Error adding review:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server: " + error.message 
        });
    }
};

// ========== 2. EDIT REVIEW ==========
const editReview = async (req, res) => {
    try {
        const userId = req.userId || req.user?.id;
        const { reviewId } = req.params;
        const { rating, comment } = req.body;

        console.log("✏️ editReview - reviewId:", reviewId, "userId:", userId);

        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: "Vui lòng đăng nhập" 
            });
        }

        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({ 
                success: false, 
                message: "Số sao phải từ 1 đến 5" 
            });
        }

        const review = await reviewModel.findById(reviewId);
        if (!review) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy đánh giá" 
            });
        }

        if (review.userId.toString() !== userId) {
            return res.status(403).json({ 
                success: false, 
                message: "Bạn chỉ có thể sửa đánh giá của chính mình" 
            });
        }

        if (rating) review.rating = Number(rating);
        if (comment !== undefined) review.comment = comment.trim();

        await review.save();
        console.log("✅ Review updated:", reviewId);

        await updateFoodAverageRating(review.foodId);

        const updatedReview = await reviewModel.findById(reviewId)
            .populate("userId", "name image");

        res.json({ 
            success: true, 
            message: "Cập nhật đánh giá thành công",
            review: updatedReview
        });

    } catch (error) {
        console.error("❌ Error editing review:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi cập nhật đánh giá: " + error.message 
        });
    }
};

// ========== 3. DELETE REVIEW ==========
const deleteReview = async (req, res) => {
    try {
        const userId = req.userId || req.user?.id;
        const isAdmin = req.user?.isAdmin || false;
        const { reviewId } = req.params;

        console.log("🗑️ deleteReview - reviewId:", reviewId, "userId:", userId);

        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: "Vui lòng đăng nhập" 
            });
        }

        const review = await reviewModel.findById(reviewId);
        if (!review) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy đánh giá" 
            });
        }

        if (review.userId.toString() !== userId && !isAdmin) {
            return res.status(403).json({ 
                success: false, 
                message: "Bạn chỉ có thể xóa đánh giá của chính mình" 
            });
        }

        const foodId = review.foodId;
        await reviewModel.findByIdAndDelete(reviewId);
        console.log("✅ Review deleted:", reviewId);

        await updateFoodAverageRating(foodId);

        res.json({ 
            success: true, 
            message: "Xóa đánh giá thành công" 
        });

    } catch (error) {
        console.error("❌ Error deleting review:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi xóa đánh giá: " + error.message 
        });
    }
};

// ========== 4. GET REVIEWS FOR A FOOD ITEM ==========
const getFoodReviews = async (req, res) => {
    try {
        const { foodId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        console.log("📖 getFoodReviews - foodId:", foodId);

        if (!mongoose.Types.ObjectId.isValid(foodId)) {
            return res.status(400).json({ 
                success: false, 
                message: "ID món ăn không hợp lệ" 
            });
        }

        const reviews = await reviewModel.find({ foodId, isVisible: true })
            .populate("userId", "name image")
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        const total = await reviewModel.countDocuments({ foodId, isVisible: true });

        const avgResult = await reviewModel.aggregate([
            { $match: { foodId: new mongoose.Types.ObjectId(foodId), isVisible: true } },
            { $group: { _id: null, avg: { $avg: "$rating" } } }
        ]);
        
        const averageRating = avgResult.length > 0 ? Math.round(avgResult[0].avg * 10) / 10 : 0;

        res.json({
            success: true,
            reviews,
            averageRating,
            totalReviews: total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });

    } catch (error) {
        console.error("❌ Error fetching reviews:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi lấy đánh giá: " + error.message 
        });
    }
};

// ========== 5. LIST ALL REVIEWS (ADMIN) ==========
const listReviews = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        
        let filter = {};
        if (status === "visible") filter.isVisible = true;
        if (status === "hidden") filter.isVisible = false;

        const reviews = await reviewModel.find(filter)
            .populate("userId", "name email image")
            .populate("foodId", "name price image")
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        const total = await reviewModel.countDocuments(filter);

        res.json({
            success: true,
            reviews,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });

    } catch (error) {
        console.error("❌ Error listing reviews:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi lấy danh sách đánh giá" 
        });
    }
};

// ========== 6. GET USER'S REVIEW FOR A FOOD ==========
const getUserReview = async (req, res) => {
    try {
        const userId = req.userId || req.user?.id;
        const { foodId } = req.params;

        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: "Vui lòng đăng nhập" 
            });
        }

        const review = await reviewModel.findOne({ userId, foodId })
            .populate("userId", "name image");

        res.json({
            success: true,
            review: review || null
        });

    } catch (error) {
        console.error("❌ Error getting user review:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi lấy đánh giá của bạn" 
        });
    }
};

// ========== 7. TOGGLE REVIEW VISIBILITY (ADMIN) ==========
const toggleReviewVisibility = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await reviewModel.findById(reviewId);
        if (!review) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy đánh giá" 
            });
        }

        review.isVisible = !review.isVisible;
        await review.save();

        await updateFoodAverageRating(review.foodId);

        res.json({ 
            success: true, 
            message: review.isVisible ? "Đã hiển thị đánh giá" : "Đã ẩn đánh giá",
            isVisible: review.isVisible
        });

    } catch (error) {
        console.error("❌ Error toggling review visibility:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi cập nhật trạng thái đánh giá" 
        });
    }
};

export { 
    addReview, 
    editReview, 
    deleteReview, 
    getFoodReviews, 
    listReviews,
    getUserReview,
    toggleReviewVisibility
};