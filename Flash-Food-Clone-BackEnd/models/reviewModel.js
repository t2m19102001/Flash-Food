import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "user",  // 🔥 Khớp với tên model user của bạn
        required: true 
    },
    foodId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "food",  // 🔥 Khớp với tên model food của bạn
        required: true 
    },
    rating: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 5 
    },
    comment: { 
        type: String, 
        required: [true, "Vui lòng nhập nội dung đánh giá"],
        trim: true,
        maxlength: [500, "Nội dung đánh giá không được vượt quá 500 ký tự"],
        default: ""
    },
    images: { 
        type: [String], 
        default: [] 
    },
    isVisible: { 
        type: Boolean, 
        default: true 
    },
    reply: { 
        type: String, 
        default: null 
    },
    replyBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "user", 
        default: null 
    },
    replyAt: { 
        type: Date, 
        default: null 
    }
}, { 
    timestamps: true  // Tự động tạo createdAt và updatedAt
});

// 🔥 Index: Mỗi user chỉ review 1 lần cho mỗi food
reviewSchema.index({ userId: 1, foodId: 1 }, { unique: true });

// 🔥 Index: Tối ưu query lấy review theo foodId
reviewSchema.index({ foodId: 1, createdAt: -1 });

// 🔥 Index: Lọc review theo trạng thái hiển thị
reviewSchema.index({ isVisible: 1, createdAt: -1 });

const reviewModel = mongoose.models.review || mongoose.model("review", reviewSchema);

export default reviewModel;