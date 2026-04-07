// Ví dụ backend API endpoint cho real-time notifications
// Cần thêm vào server-side code của bạn

const express = require('express');
const router = express.Router();

// SSE endpoint cho real-time notifications
router.get('/api/admin/notifications/stream', (req, res) => {
    // Set headers cho SSE
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Gửi connection event
    res.write('data: {"type": "connection", "message": "Connected to notification stream"}\n\n');

    // Lưu connection để gửi notifications sau này
    const clientId = Date.now();
    const client = {
        id: clientId,
        res
    };

    // Thêm vào list of clients (cần implement global clients array)
    if (!global.notificationClients) {
        global.notificationClients = new Map();
    }
    global.notificationClients.set(clientId, client);

    // Xử lý disconnect
    req.on('close', () => {
        global.notificationClients.delete(clientId);
    });

    // Keep alive
    const keepAlive = setInterval(() => {
        res.write('data: {"type": "ping"}\n\n');
    }, 30000);

    req.on('close', () => {
        clearInterval(keepAlive);
        global.notificationClients.delete(clientId);
    });
});

// Function để gửi notification đến tất cả admin clients
const sendNotificationToAdmins = (notification) => {
    if (!global.notificationClients) return;

    const notificationData = {
        type: notification.type || 'info',
        title: notification.title,
        message: notification.message,
        timestamp: new Date().toISOString(),
        data: notification.data || {}
    };

    global.notificationClients.forEach((client) => {
        try {
            client.res.write(`data: ${JSON.stringify(notificationData)}\n\n`);
        } catch (error) {
            console.error('Error sending notification:', error);
            global.notificationClients.delete(client.id);
        }
    });
};

// Endpoint để test notification
router.post('/api/admin/notifications/test', (req, res) => {
    const { title, message, type } = req.body;
    
    sendNotificationToAdmins({
        type: type || 'info',
        title: title || 'Test Notification',
        message: message || 'This is a test notification'
    });

    res.json({ success: true, message: 'Test notification sent' });
});

// Khi có đơn hàng mới, gọi function này
const onNewOrder = (orderData) => {
    sendNotificationToAdmins({
        type: 'order',
        title: 'Đơn hàng mới!',
        message: `${orderData.address.firstName} ${orderData.address.lastName} vừa đặt đơn hàng #${orderData._id.slice(-6).toUpperCase()}`,
        data: {
            orderId: orderData._id,
            customerName: `${orderData.address.firstName} ${orderData.address.lastName}`,
            amount: orderData.amount
        }
    });
};

// Khi có user mới đăng ký
const onNewUser = (userData) => {
    sendNotificationToAdmins({
        type: 'user',
        title: 'Người dùng mới!',
        message: `${userData.name} vừa đăng ký tài khoản mới`,
        data: {
            userId: userData._id,
            userName: userData.name,
            email: userData.email
        }
    });
};

// Khi có payment mới
const onNewPayment = (paymentData) => {
    sendNotificationToAdmins({
        type: 'payment',
        title: 'Thanh toán mới!',
        message: `Đơn hàng #${paymentData.orderId.slice(-6).toUpperCase()} đã được thanh toán`,
        data: {
            orderId: paymentData.orderId,
            amount: paymentData.amount,
            method: paymentData.method
        }
    });
};

module.exports = {
    router,
    sendNotificationToAdmins,
    onNewOrder,
    onNewUser,
    onNewPayment
};

// Cách sử dụng trong order creation endpoint:
/*
const { sendNotificationToAdmins } = require('./notification-api-example');

// Khi tạo đơn hàng mới
router.post('/api/order/create', async (req, res) => {
    try {
        // Logic tạo đơn hàng...
        const newOrder = await Order.create(orderData);
        
        // Gửi notification đến admin
        sendNotificationToAdmins({
            type: 'order',
            title: 'Đơn hàng mới!',
            message: `${newOrder.address.firstName} ${newOrder.address.lastName} vừa đặt đơn hàng`,
            data: {
                orderId: newOrder._id,
                customerName: `${newOrder.address.firstName} ${newOrder.address.lastName}`,
                amount: newOrder.amount
            }
        });
        
        res.json({ success: true, order: newOrder });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
*/
