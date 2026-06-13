import express from "express";
import { 
    createPaymentIntent, 
    confirmPayment, 
    handlePaymentSuccess, 
    getPaymentMethods,
    checkStripeConfigStatus
} from "../controllers/paymentController.js";
import { 
    createMomoPayment, 
    momoCallback, 
    momoIpnHandler,
    checkMomoStatus,
    getMomoTransactionInfo,
    manualUpdatePaymentStatus
} from "../controllers/momoController.js";
import { authMiddleware } from "../middleware/auth.js";

const paymentRouter = express.Router();

// ========== STRIPE ==========
paymentRouter.post("/create-intent", authMiddleware, createPaymentIntent);
paymentRouter.post("/webhook", express.raw({ type: 'application/json' }), confirmPayment);
paymentRouter.post("/success", authMiddleware, handlePaymentSuccess);
paymentRouter.get("/methods", authMiddleware, getPaymentMethods);
paymentRouter.get("/config-status", authMiddleware, checkStripeConfigStatus);

// ========== MOMO ==========
// Tạo thanh toán MoMo
paymentRouter.post("/momo/create", authMiddleware, createMomoPayment);

// Callback (MoMo redirect về sau thanh toán)
paymentRouter.get("/momo/callback", momoCallback);

// IPN Webhook (MoMo gọi về sau khi quét QR)
paymentRouter.post("/momo/ipn", express.json(), momoIpnHandler);

// Kiểm tra trạng thái
paymentRouter.get("/momo/status/:orderId", authMiddleware, checkMomoStatus);
paymentRouter.post("/momo/status", authMiddleware, checkMomoStatus);

// Lấy thông tin giao dịch
paymentRouter.get("/momo/transaction/:orderId", authMiddleware, getMomoTransactionInfo);

// 🔥 MANUAL UPDATE - Dùng khi IPN không hoạt động
paymentRouter.post("/momo/manual-update", authMiddleware, manualUpdatePaymentStatus);

// Test route
paymentRouter.get("/momo/test", (req, res) => {
    res.json({ 
        success: true, 
        message: "MoMo payment routes are working!",
        endpoints: {
            create: "POST /api/payment/momo/create",
            callback: "GET /api/payment/momo/callback",
            ipn: "POST /api/payment/momo/ipn",
            status: "GET /api/payment/momo/status/:orderId",
            manualUpdate: "POST /api/payment/momo/manual-update"
        }
    });
});

export default paymentRouter;