import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// get dashboard statistics
export const getStatistics = async (req, res) => {
    try {
        // Count total products
        const totalProducts = await foodModel.countDocuments();

        // Count total orders
        const totalOrders = await orderModel.countDocuments();

        // Count total users
        const totalUsers = await userModel.countDocuments();

        // Get recent orders (last 5)
        const recentOrders = await orderModel.find({})
            .sort({ date: -1 })
            .limit(5)
            .select('userId amount status date');

        res.json({
            success: true,
            stats: {
                totalProducts,
                totalOrders,
                totalUsers,
                recentOrders
            }
        });
    } catch (error) {
        console.error("Error fetching statistics:", error);
        res.json({ success: false, message: "Error fetching statistics" });
    }
};
