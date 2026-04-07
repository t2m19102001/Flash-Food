import express from "express";
import { createPaymentIntent, confirmPayment, handlePaymentSuccess, getPaymentMethods } from "../controllers/paymentController.js";
import { authMiddleware } from "../middleware/auth.js";

const paymentRouter = express.Router();

// Create payment intent
paymentRouter.post("/create-intent", authMiddleware, createPaymentIntent);

// Handle Stripe webhook
paymentRouter.post("/webhook", express.raw({ type: 'application/json' }), confirmPayment);

// Handle payment success
paymentRouter.post("/success", authMiddleware, handlePaymentSuccess);

// Get payment methods
paymentRouter.get("/methods", authMiddleware, getPaymentMethods);

export default paymentRouter;
