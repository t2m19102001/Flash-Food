import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";

// Báo cáo đơn hàng
export const getOrderReport = async (req, res) => {
    try {
        const { start, end } = req.query;
        
        let query = {};
        if (start && end) {
            query.date = { $gte: new Date(start), $lte: new Date(end) };
        }
        
        const orders = await orderModel.find(query).sort({ date: -1 });
        
        // Format dữ liệu trả về
        const formattedOrders = orders.map(order => ({
            _id: order._id,
            code: order._id.toString().slice(-8).toUpperCase(),
            customer: `${order.address?.firstName || ''} ${order.address?.lastName || ''}`.trim(),
            phone: order.address?.phone || '',
            email: order.address?.email || '',
            amount: order.amount || 0,
            status: order.status || 'pending',
            paymentStatus: order.payment ? 'Đã thanh toán' : 'Chưa thanh toán',
            date: new Date(order.date).toLocaleDateString('vi-VN')
        }));
        
        const stats = {
            total: orders.length,
            pending: orders.filter(o => o.status === 'pending').length,
            confirmed: orders.filter(o => o.status === 'confirmed').length,
            delivered: orders.filter(o => o.status === 'delivered').length,
            cancelled: orders.filter(o => o.status === 'cancelled').length,
            totalRevenue: orders.reduce((sum, o) => sum + (o.amount || 0), 0)
        };
        
        res.json({ success: true, data: formattedOrders, stats });
    } catch (error) {
        console.error("Order report error:", error);
        res.status(500).json({ success: false, message: "Lỗi tải báo cáo đơn hàng" });
    }
};

// Báo cáo doanh thu
export const getRevenueReport = async (req, res) => {
    try {
        const { start, end } = req.query;
        
        let query = { paymentStatus: "paid" };
        if (start && end) {
            query.paidAt = { $gte: new Date(start), $lte: new Date(end) };
        }
        
        const orders = await orderModel.find(query);
        
        // Doanh thu theo ngày
        const revenueByDate = {};
        orders.forEach(order => {
            const date = new Date(order.paidAt || order.date).toISOString().split('T')[0];
            revenueByDate[date] = (revenueByDate[date] || 0) + (order.amount || 0);
        });
        
        const revenueData = Object.entries(revenueByDate).map(([date, revenue]) => ({
            date,
            revenue
        }));
        
        res.json({
            success: true,
            data: revenueData,
            stats: {
                totalRevenue: orders.reduce((sum, o) => sum + (o.amount || 0), 0),
                orderCount: orders.length
            }
        });
    } catch (error) {
        console.error("Revenue report error:", error);
        res.status(500).json({ success: false, message: "Lỗi tải báo cáo doanh thu" });
    }
};

// Báo cáo sản phẩm
export const getProductReport = async (req, res) => {
    try {
        const { start, end } = req.query;
        
        let query = { status: "delivered" };
        if (start && end) {
            query.date = { $gte: new Date(start), $lte: new Date(end) };
        }
        
        const orders = await orderModel.find(query);
        
        const productSales = {};
        orders.forEach(order => {
            order.items?.forEach(item => {
                const name = item.name;
                if (!productSales[name]) {
                    productSales[name] = {
                        name: name,
                        quantity: 0,
                        revenue: 0
                    };
                }
                productSales[name].quantity += item.quantity;
                productSales[name].revenue += (item.price * item.quantity);
            });
        });
        
        const topProducts = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 50);
        
        res.json({ success: true, data: topProducts });
    } catch (error) {
        console.error("Product report error:", error);
        res.status(500).json({ success: false, message: "Lỗi tải báo cáo sản phẩm" });
    }
};

// Báo cáo người dùng
export const getUserReport = async (req, res) => {
    try {
        const { start, end } = req.query;
        
        let query = {};
        if (start && end) {
            query.createdAt = { $gte: new Date(start), $lte: new Date(end) };
        }
        
        const users = await userModel.find(query);
        
        const formattedUsers = users.map(user => ({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.isAdmin ? 'Admin' : 'User',
            status: user.isActive !== false ? 'Hoạt động' : 'Bị khóa',
            createdAt: new Date(user.createdAt).toLocaleDateString('vi-VN')
        }));
        
        const stats = {
            total: users.length,
            admin: users.filter(u => u.isAdmin).length,
            active: users.filter(u => u.isActive !== false).length,
            inactive: users.filter(u => u.isActive === false).length
        };
        
        res.json({ success: true, data: formattedUsers, stats });
    } catch (error) {
        console.error("User report error:", error);
        res.status(500).json({ success: false, message: "Lỗi tải báo cáo người dùng" });
    }
};