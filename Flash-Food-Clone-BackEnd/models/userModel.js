import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    secondaryPhone: { type: String, default: "" },      // ← SĐT dự phòng
    gender: { type: String, default: "Nam" },           // ← Giới tính
    dob: { type: String, default: "" },                 // ← Ngày sinh (YYYY-MM-DD)
    address: { type: String, default: "" },             // ← Địa chỉ
    image: { type: String, default: "" },
    cartData: { type: Object, default: {} },
    isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    role: { type: String, default: "customer" },        // ← Vai trò
    loyaltyPoints: { type: Number, default: 0 },        // ← Điểm tích lũy
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'food' }],  // ← Món ăn yêu thích
    orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'order' }], // ← Lịch sử đơn hàng
    savedAddresses: [{ type: String }],                 // ← Danh sách địa chỉ đã lưu
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { minimize: false, timestamps: true });

// Middleware: tự động cập nhật updatedAt mỗi khi save
userSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;