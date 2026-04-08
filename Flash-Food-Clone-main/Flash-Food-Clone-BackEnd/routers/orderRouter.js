import express from "express";
import { placeOrder, userOrders, listOrders, updateStatus, cancelOrder } from "../controllers/orderController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.get("/list", adminMiddleware, listOrders);
orderRouter.post("/status", adminMiddleware, updateStatus);
orderRouter.post("/cancel", adminMiddleware, cancelOrder);

export default orderRouter;
