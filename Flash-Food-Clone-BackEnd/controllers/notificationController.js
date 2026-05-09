import notificationModel from "../models/notificationModel.js";

// Gửi thông báo (admin)
export const sendNotification = async (req, res) => {
    try {
        const { title, message, type, target } = req.body;
        const adminId = req.userId;
        
        if (!title || !message) {
            return res.status(400).json({ success: false, message: "Thiếu tiêu đề hoặc nội dung" });
        }
        
        const notification = new notificationModel({
            title,
            message,
            type: type || "info",
            target: target || "all",
            sentBy: adminId,
            sentAt: new Date()
        });
        
        await notification.save();
        
        res.json({ success: true, message: "Đã gửi thông báo thành công!" });
    } catch (error) {
        console.error("Send notification error:", error);
        res.status(500).json({ success: false, message: "Lỗi khi gửi thông báo" });
    }
};

// Lấy danh sách thông báo (admin)
export const getAdminNotifications = async (req, res) => {
    try {
        const notifications = await notificationModel.find({})
            .sort({ sentAt: -1 })
            .limit(50);
        
        res.json({ success: true, data: notifications });
    } catch (error) {
        console.error("Get admin notifications error:", error);
        res.status(500).json({ success: false, message: "Lỗi tải danh sách" });
    }
};

// Xóa thông báo (admin)
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await notificationModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Đã xóa thông báo" });
    } catch (error) {
        console.error("Delete notification error:", error);
        res.status(500).json({ success: false, message: "Lỗi khi xóa" });
    }
};

// Lấy thông báo cho user
export const getUserNotifications = async (req, res) => {
    try {
        const userId = req.userId;
        
        // Lấy tất cả thông báo dành cho user
        const notifications = await notificationModel.find({
            target: { $in: ["all", "users"] }
        }).sort({ sentAt: -1 }).limit(50);
        
        // Thêm trường isRead cho mỗi thông báo
        const notificationsWithReadStatus = notifications.map(notif => ({
            ...notif.toObject(),
            isRead: notif.readBy?.includes(userId) || false
        }));
        
        // 🔥 ĐẾM SỐ CHƯA ĐỌC
        const unreadCount = notificationsWithReadStatus.filter(n => !n.isRead).length;
        
        console.log(`📊 User ${userId} có ${unreadCount} thông báo chưa đọc`);
        
        res.json({ 
            success: true, 
            notifications: notificationsWithReadStatus,
            unreadCount: unreadCount
        });
    } catch (error) {
        console.error("Get user notifications error:", error);
        res.status(500).json({ success: false, message: "Lỗi tải thông báo" });
    }
};

// Đánh dấu đã đọc
export const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.userId;
        
        const notification = await notificationModel.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ success: false, message: "Không tìm thấy thông báo" });
        }
        
        // Chỉ thêm userId nếu chưa có
        if (!notification.readBy.includes(userId)) {
            notification.readBy.push(userId);
            await notification.save();
        }
        
        res.json({ success: true, message: "Đã đánh dấu đã đọc" });
    } catch (error) {
        console.error("Mark as read error:", error);
        res.status(500).json({ success: false, message: "Lỗi đánh dấu đã đọc" });
    }
};
/// Đánh dấu tất cả đã đọc
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.userId;
        
        // Tìm tất cả thông báo chưa đọc
        const notifications = await notificationModel.find({
            target: { $in: ["all", "users"] },
            readBy: { $ne: userId }
        });
        
        // Thêm userId vào readBy của từng thông báo
        for (const notif of notifications) {
            notif.readBy.push(userId);
            await notif.save();
        }
        
        res.json({ success: true, message: "Đã đánh dấu tất cả đã đọc" });
    } catch (error) {
        console.error("Mark all as read error:", error);
        res.status(500).json({ success: false, message: "Lỗi đánh dấu tất cả" });
    }
};