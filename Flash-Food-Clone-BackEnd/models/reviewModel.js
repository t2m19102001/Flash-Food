import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: "food", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
    date: { type: Date, default: Date.now }
});

// Mỗi user chỉ review 1 lần cho mỗi food
reviewSchema.index({ userId: 1, foodId: 1 }, { unique: true });

const reviewModel = mongoose.models.review || mongoose.model("review", reviewSchema);

export default reviewModel;
