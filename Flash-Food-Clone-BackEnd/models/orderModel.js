import mongoose from "mongoose";

// ========== SUB-SCHEMA CHO ITEMS TRONG ĐƠN HÀNG ==========
const orderItemSchema = new mongoose.Schema({
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "food",
    required: [true, "Thiếu ID món ăn"],
  },
  name: {
    type: String,
    required: [true, "Thiếu tên món ăn"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Thiếu giá món ăn"],
    min: [0, "Giá không được âm"],
  },
  quantity: {
    type: Number,
    required: [true, "Thiếu số lượng"],
    min: [1, "Số lượng tối thiểu là 1"],
    default: 1,
  },
  image: {
    type: String,
    default: "",
  },
  totalPrice: {
    type: Number,
    default: function () {
      return this.price * this.quantity;
    },
  },
});

// ========== SUB-SCHEMA CHO ĐỊA CHỈ ==========
const addressSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, default: "", trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  city: { type: String, default: "" },
  state: { type: String, default: "" },
  country: { type: String, default: "Việt Nam" },
  note: { type: String, default: "" }, // 🔥 THÊM GHI CHÚ VÀO ĐỊA CHỈ
});

// ========== MAIN ORDER SCHEMA ==========
const orderSchema = new mongoose.Schema(
  {
    // userId thành ObjectId để có thể populate
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Thiếu ID người dùng"],
      index: true,
    },

    // items thành sub-schema có validation
    items: {
      type: [orderItemSchema],
      required: [true, "Đơn hàng phải có ít nhất một món"],
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: "Đơn hàng phải có ít nhất một món",
      },
    },

    // Tổng tiền đơn hàng
    amount: {
      type: Number,
      required: [true, "Thiếu tổng tiền"],
      min: [0, "Tổng tiền không được âm"],
    },

    // Địa chỉ giao hàng
    address: {
      type: addressSchema,
      required: [true, "Thiếu địa chỉ giao hàng"],
    },

    // Trạng thái đơn hàng
    status: {
      type: String,
      enum: {
        values: [
          "pending",
          "pending_payment",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
          "payment_failed",
          "refunded",
          "payment_canceled",
        ],
        message: "Trạng thái không hợp lệ: {VALUE}",
      },
      default: "pending",
      index: true,
    },

    // Phương thức thanh toán
    paymentMethod: {
      type: String,
      enum: {
        values: ["cod", "stripe", "momo"],
        message: "Phương thức thanh toán không hợp lệ: {VALUE}",
      },
      default: "cod",
    },

    // Trạng thái thanh toán chi tiết
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "canceled", "refunded"],
      default: "pending",
    },

    transactionId: {
      type: String,
      default: "",
      sparse: true,
    },

    // ID thanh toán từ Stripe
    paymentId: {
      type: String,
      default: "",
    },

    // Thời gian thanh toán
    paidAt: {
      type: Date,
      default: null,
    },

    // Request ID từ MoMo
    momoRequestId: {
      type: String,
      default: "",
    },

    // Response từ MoMo
    momoResponse: {
      resultCode: { type: Number },
      message: { type: String },
      payType: { type: String },
      responseTime: { type: Number },
      orderId: { type: String },
    },

    // Lý do hủy đơn
    cancelReason: {
      type: String,
      default: "",
    },

    // Người hủy đơn (user/admin/system)
    cancelledBy: {
      type: String,
      enum: ["user", "admin", "system", ""],
      default: "",
    },

    // Thời gian hủy
    cancelledAt: {
      type: Date,
      default: null,
    },

    // Lý do thất bại (thanh toán)
    failureReason: {
      type: String,
      default: "",
    },

    // Mã lỗi
    failureCode: {
      type: String,
      default: "",
    },

    // Thông tin hoàn tiền
    refundedAt: {
      type: Date,
      default: null,
    },

    refundAmount: {
      type: Number,
      default: 0,
    },

    // Ngày tạo đơn
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ========== VIRTUAL FIELDS ==========
// Tính tổng số lượng món
orderSchema.virtual("totalItems").get(function () {
  if (!this.items) return 0;
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Kiểm tra đơn hàng đã thanh toán chưa
orderSchema.virtual("isPaid").get(function () {
  return this.paymentStatus === "paid";
});

// Kiểm tra đơn hàng có thể hủy không
orderSchema.virtual("isCancellable").get(function () {
  const cancellableStatuses = ["pending", "pending_payment", "confirmed"];
  return (
    cancellableStatuses.includes(this.status) && this.paymentStatus !== "paid"
  );
});

// ========== INSTANCE METHODS ==========
// Đánh dấu đơn hàng đã thanh toán
orderSchema.methods.markAsPaid = async function (transactionId, paymentMethod) {
  this.paymentStatus = "paid";
  this.transactionId = transactionId;
  this.paymentMethod = paymentMethod;
  this.paidAt = new Date();
  this.status = "confirmed";
  return await this.save();
};

// Đánh dấu đơn hàng thất bại
orderSchema.methods.markAsFailed = async function (reason, code) {
  this.paymentStatus = "failed";
  this.status = "payment_failed";
  this.failureReason = reason;
  this.failureCode = code;
  return await this.save();
};

// Hủy đơn hàng
orderSchema.methods.cancel = async function (reason, cancelledBy = "user") {
  if (!this.isCancellable) {
    throw new Error("Đơn hàng không thể hủy vào thời điểm này");
  }
  this.status = "cancelled";
  this.cancelReason = reason;
  this.cancelledBy = cancelledBy;
  this.cancelledAt = new Date();
  if (this.paymentStatus === "pending") {
    this.paymentStatus = "canceled";
  }
  return await this.save();
};

// ========== STATIC METHODS ==========
// Lấy đơn hàng theo user (có populate)
orderSchema.statics.findByUser = function (userId) {
  return this.find({ userId })
    .populate("userId", "name email phone")
    .sort({ createdAt: -1 });
};

// Lấy chi tiết đơn hàng
orderSchema.statics.findOrderDetails = function (orderId) {
  return this.findById(orderId)
    .populate("userId", "name email phone image")
    .populate("items.foodId", "name price image");
};

// ========== PRE-SAVE MIDDLEWARE ==========
// Tự động tính totalPrice cho từng item trước khi lưu
orderSchema.pre("save", function (next) {
  if (this.items && this.items.length > 0) {
    this.items.forEach((item) => {
      item.totalPrice = item.price * item.quantity;
    });
  }
  next();
});

// ========== COMPOUND INDEXES ==========
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, status: 1 });
orderSchema.index({ date: -1 });

const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;