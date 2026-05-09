import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// ========== HELPER: LẤY THAM SỐ PHÂN TRANG ==========
const getPaginationParams = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  // Giới hạn limit tối đa 100 để tránh abuse
  const safeLimit = Math.min(limit, 100);
  const safeSkip = (page - 1) * safeLimit;

  return {
    page,
    limit: safeLimit,
    skip: safeSkip,
  };
};

// ========== HELPER: XÓA GIỎ HÀNG (DÙNG CHUNG) ==========
const clearUserCart = async (userId) => {
  if (!userId) return false;
  try {
    await userModel.findByIdAndUpdate(userId, { cartData: {} });
    console.log(`🗑️ Đã xóa giỏ hàng của user ${userId}`);
    return true;
  } catch (error) {
    console.error(`❌ Lỗi khi xóa giỏ hàng của user ${userId}:`, error);
    return false;
  }
};

// ========== PLACE ORDER ==========
const placeOrder = async (req, res) => {
  try {
    const userId = req.userId;

    console.log("🟢 placeOrder - userId:", userId);
    console.log("🟢 placeOrder - req.body:", req.body);

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Vui lòng đăng nhập!" });
    }

    const { items, amount, address, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Giỏ hàng trống!" });
    }

    if (!amount || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Số tiền không hợp lệ!" });
    }

    let initialStatus = "pending";
    let paymentStatus = "pending";

    if (paymentMethod === "momo" || paymentMethod === "stripe") {
      initialStatus = "pending_payment";
      paymentStatus = "pending";
    }

    const newOrder = new orderModel({
      userId: userId,
      items: items,
      amount: amount,
      address: address,
      paymentMethod: paymentMethod || "cod",
      status: initialStatus,
      paymentStatus: paymentStatus,
      date: Date.now(),
      // 🔥 KHÔNG CÓ cancelledBy Ở ĐÂY
    });

    const savedOrder = await newOrder.save();

    // 🔥 SỬA: Xóa giỏ hàng cho TẤT CẢ phương thức thanh toán
    // Lý do: Tránh user đặt trùng đơn hàng khi thanh toán online
    if (paymentMethod === "cod") {
      // COD: xóa ngay lập tức
      await clearUserCart(userId);
    } else {
      // Stripe/MoMo: vẫn xóa luôn vì đã tạo đơn hàng thành công
      // Nếu thanh toán thất bại, user sẽ phải tạo đơn mới
      await clearUserCart(userId);
    }

    console.log("✅ Đã tạo đơn hàng thành công, ID:", savedOrder._id);

    res.status(201).json({
      success: true,
      message: "Đặt hàng thành công!",
      orderId: savedOrder._id,
      order: savedOrder,
    });
  } catch (error) {
    console.error("❌ Error placing order:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi đặt hàng: " + error.message });
  }
};

// ========== GET USER ORDERS - ĐÃ THÊM PHÂN TRANG ==========
const userOrders = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Vui lòng đăng nhập!" });
    }

    const { page, limit, skip } = getPaginationParams(req.query);

    const [orders, totalOrders] = await Promise.all([
      orderModel
        .find({ userId: userId })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      orderModel.countDocuments({ userId: userId }),
    ]);

    res.json({
      success: true,
      orders: orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders: totalOrders,
        limit: limit,
        hasNextPage: page * limit < totalOrders,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi lấy danh sách đơn hàng" });
  }
};

// ========== LIST ALL ORDERS (ADMIN) - ĐÃ THÊM PHÂN TRANG ==========
const listOrders = async (req, res) => {
  try {
    const isAdmin = req.user?.isAdmin || false;
    if (!isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền truy cập!" });
    }

    const { page, limit, skip } = getPaginationParams(req.query);

    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.paymentMethod) {
      filter.paymentMethod = req.query.paymentMethod;
    }

    const [orders, totalOrders] = await Promise.all([
      orderModel
        .find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email phone")
        .lean(),
      orderModel.countDocuments(filter),
    ]);

    res.json({
      success: true,
      orders: orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders: totalOrders,
        limit: limit,
        hasNextPage: page * limit < totalOrders,
        hasPrevPage: page > 1,
      },
      filters: {
        status: req.query.status || null,
        paymentMethod: req.query.paymentMethod || null,
      },
    });
  } catch (error) {
    console.error("Error fetching list orders:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi lấy danh sách đơn hàng" });
  }
};

// ========== UPDATE ORDER STATUS ==========
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin cập nhật!" });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng!" });
    }

    const updateData = { status: status };

    if (status === "confirmed" || status === "paid") {
      updateData.paymentStatus = "paid";
      updateData.paidAt = new Date();
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true },
    );

    // 🔥 Nếu đơn hàng được xác nhận (thanh toán thành công), đảm bảo giỏ hàng trống
    if (status === "confirmed") {
      await clearUserCart(order.userId);
    }

    if (updatedOrder && global.broadcastOrderUpdate) {
      global.broadcastOrderUpdate(orderId, status, order.userId);
    }

    console.log(`✅ Order ${orderId} status updated to: ${status}`);
    res.json({ success: true, message: "Cập nhật trạng thái thành công" });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật trạng thái: " + error.message,
    });
  }
};

// ========== CANCEL ORDER ==========
const cancelOrder = async (req, res) => {
  try {
    const { orderId, reason, cancelledBy } = req.body;

    if (!orderId || !reason) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp mã đơn hàng và lý do hủy!",
      });
    }

    const existingOrder = await orderModel.findById(orderId);
    if (!existingOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng!" });
    }

    if (existingOrder.status === "cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Đơn hàng đã được hủy trước đó!" });
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      {
        status: "cancelled",
        paymentStatus: "failed",
        cancelReason: reason,
        cancelledBy: cancelledBy || "user",
        cancelledAt: new Date(),
      },
      { new: true },
    );

    if (!updatedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng!" });
    }

    if (global.broadcastOrderUpdate) {
      global.broadcastOrderUpdate(orderId, "cancelled", existingOrder.userId);
    }

    console.log(
      `❌ Order ${orderId} cancelled by ${cancelledBy}. Reason: ${reason}`,
    );

    res.json({
      success: true,
      message: "Đã hủy đơn hàng thành công",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hủy đơn hàng: " + error.message,
    });
  }
};

// ========== UPDATE PAYMENT STATUS ==========
const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId, status, transactionId } = req.body;

    console.log("🟢 updatePaymentStatus:", { orderId, status, transactionId });

    if (!orderId || !status) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin cập nhật!" });
    }

    const existingOrder = await orderModel.findById(orderId);
    if (!existingOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng!" });
    }

    const updateData = {
      paymentStatus: status,
      transactionId: transactionId,
      paidAt: status === "paid" ? new Date() : null,
    };

    if (status === "paid") {
      updateData.status = "confirmed";
      // 🔥 Đảm bảo xóa giỏ hàng khi thanh toán thành công
      await clearUserCart(existingOrder.userId);

      if (global.broadcastOrderUpdate) {
        global.broadcastOrderUpdate(orderId, "confirmed", existingOrder.userId);
      }
    }

    const order = await orderModel.findByIdAndUpdate(orderId, updateData, {
      new: true,
    });

    console.log(`✅ Payment status for order ${orderId} updated to: ${status}`);
    res.json({ success: true, order });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật thanh toán: " + error.message,
    });
  }
};

// ========== GET ORDER BY ID ==========
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu mã đơn hàng!" });
    }

    const order = await orderModel
      .findById(orderId)
      .populate("userId", "name email phone")
      .populate("items.foodId", "name price image");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng!" });
    }

    const isAdmin = req.user?.isAdmin || false;
    if (order.userId._id.toString() !== userId && !isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền xem đơn hàng này!" });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error("Error getting order:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi lấy thông tin đơn hàng!" });
  }
};

// ========== GET ORDER STATISTICS (ADMIN) ==========
const getOrderStats = async (req, res) => {
  try {
    const isAdmin = req.user?.isAdmin || false;
    if (!isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền truy cập!" });
    }

    const stats = await orderModel.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const totalOrders = await orderModel.countDocuments();
    const totalRevenue = await orderModel.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.json({
      success: true,
      stats: {
        byStatus: stats,
        totalOrders: totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Error getting order stats:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi lấy thống kê đơn hàng!" });
  }
};

export {
  placeOrder,
  userOrders,
  listOrders,
  updateStatus,
  cancelOrder,
  updatePaymentStatus,
  getOrderById,
  getOrderStats,
};
