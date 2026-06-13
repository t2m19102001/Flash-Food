import express from "express";
import { 
    placeOrder, 
    userOrders, 
    listOrders, 
    updateStatus, 
    cancelOrder,
    getOrderById
} from "../controllers/orderController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const orderRouter = express.Router();

// ========== USER ROUTES ==========
// Tạo đơn hàng mới
orderRouter.post("/place", authMiddleware, placeOrder);

// Lấy danh sách đơn hàng của user hiện tại
orderRouter.post("/userorders", authMiddleware, userOrders);

// Hủy đơn hàng (user)
orderRouter.post("/cancel", authMiddleware, cancelOrder);

// ========== ADMIN ROUTES ==========
// 🔥 ĐẶT CÁC ROUTE TĨNH TRƯỚC (để tránh xung đột với route động /:orderId)
// Lấy danh sách tất cả đơn hàng (chỉ admin)
orderRouter.get("/list", adminMiddleware, listOrders);

// Cập nhật trạng thái đơn hàng (chỉ admin)
orderRouter.post("/status", adminMiddleware, updateStatus);

// ========== DYNAMIC ROUTE (đặt SAU CÙNG) ==========
// Lấy chi tiết đơn hàng theo ID - ĐẶT SAU CÙNG để không bị xung đột với /list
orderRouter.get("/:orderId", authMiddleware, getOrderById);

export default orderRouter;