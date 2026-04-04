import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// Place order
const placeOrder = async (req, res) => {
    try {
        const userId = req.userId; // Lấy từ auth middleware, không từ body

        const newOrder = new orderModel({
            userId: userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            paymentMethod: req.body.paymentMethod || "cod",
            payment: req.body.paymentMethod === "cod" ? false : false,
            paymentId: req.body.paymentId || null
        });

        await newOrder.save();
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        res.json({ success: true, message: "Order placed successfully" });
    } catch (error) {
        console.error("Error placing order:", error);
        res.json({ success: false, message: "Error placing order" });
    }
};

// Get user orders
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.userId });
        res.json({ success: true, orders: orders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.json({ success: false, message: "Error fetching orders" });
    }
};

// List all orders (for admin)
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, orders: orders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.json({ success: false, message: "Error fetching orders" });
    }
};

// Update order status
const updateStatus = async (req, res) => {
    try {
        const updatedOrder = await orderModel.findByIdAndUpdate(
            req.body.orderId,
            { status: req.body.status },
            { new: true }
        );

        // Broadcast real-time update to user
        if (updatedOrder && global.broadcastOrderUpdate) {
            global.broadcastOrderUpdate(
                req.body.orderId,
                req.body.status,
                updatedOrder.userId
            );
        }

        res.json({ success: true, message: "Status updated" });
    } catch (error) {
        console.error("Error updating status:", error);
        res.json({ success: false, message: "Error updating status" });
    }
};

// Cancel order
const cancelOrder = async (req, res) => {
    try {
        const { orderId, reason, cancelledBy } = req.body;

        if (!orderId || !reason) {
            return res.json({
                success: false,
                message: "Order ID and cancel reason are required"
            });
        }

        // Update order with cancellation details
        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId,
            {
                status: "Cancelled",
                cancelReason: reason,
                cancelledBy: cancelledBy || "admin",
                cancelledAt: new Date()
            },
            { new: true }
        );

        if (!updatedOrder) {
            return res.json({
                success: false,
                message: "Order not found"
            });
        }

        // Broadcast real-time update to user
        if (global.broadcastOrderUpdate) {
            global.broadcastOrderUpdate(
                orderId,
                "Cancelled",
                updatedOrder.userId
            );
        }

        console.log(`Order ${orderId} cancelled by ${cancelledBy}. Reason: ${reason}`);

        res.json({
            success: true,
            message: "Đã hủy đơn hàng thành công",
            order: updatedOrder
        });
    } catch (error) {
        console.error("Error cancelling order:", error);
        res.json({
            success: false,
            message: "Error cancelling order"
        });
    }
};

export { placeOrder, userOrders, listOrders, updateStatus, cancelOrder };
