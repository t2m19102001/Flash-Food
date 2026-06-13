// Service để xử lý real-time notifications
// 🔥 TẠM THỜI VÔ HIỆU HÓA VÌ BACKEND CHƯA CÓ ENDPOINT NÀY

// Cấu hình: bật/tắt notification
const NOTIFICATION_ENABLED = false; // 🔥 ĐỔI THÀNH true KHI BACKEND SẴN SÀNG

class NotificationService {
    constructor() {
        this.eventSource = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }

    // Kết nối đến SSE (Server-Sent Events) endpoint
    connectToNotifications(url, onNotification) {
        // 🔥 KIỂM TRA NẾU BỊ TẮT THÌ KHÔNG KẾT NỐI
        if (!NOTIFICATION_ENABLED) {
            console.log('🔕 Notification service is disabled. Set NOTIFICATION_ENABLED = true to enable.');
            return;
        }

        if (this.eventSource) {
            this.eventSource.close();
        }

        try {
            console.log('🔌 Connecting to notification stream:', `${url}/api/admin/notifications/stream`);
            this.eventSource = new EventSource(`${url}/api/admin/notifications/stream`);

            this.eventSource.onopen = () => {
                console.log('✅ Connected to notification stream');
                this.reconnectAttempts = 0;
            };

            this.eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    onNotification(data);
                } catch (error) {
                    console.error('Error parsing notification:', error);
                }
            };

            this.eventSource.onerror = (error) => {
                console.error('❌ Notification stream error:', error);
                this.handleReconnect(url, onNotification);
            };

        } catch (error) {
            console.error('❌ Error connecting to notification stream:', error);
            this.handleReconnect(url, onNotification);
        }
    }

    // Xử lý reconnect tự động
    handleReconnect(url, onNotification) {
        if (!NOTIFICATION_ENABLED) return;
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connectToNotifications(url, onNotification);
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('❌ Max reconnect attempts reached');
        }
    }

    // Đóng kết nối
    disconnect() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        this.reconnectAttempts = 0;
        console.log('🔌 Disconnected from notification stream');
    }

    // Gửi notification thủ công (test)
    async sendTestNotification(url, notification) {
        if (!NOTIFICATION_ENABLED) {
            console.warn('⚠️ Notification service is disabled');
            return { success: false, message: 'Notification service disabled' };
        }
        
        try {
            const response = await fetch(`${url}/api/admin/notifications/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(notification)
            });
            return await response.json();
        } catch (error) {
            console.error('Error sending test notification:', error);
            return { success: false, message: error.message };
        }
    }

    // Kiểm tra trạng thái kết nối
    isConnected() {
        return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN;
    }

    // Lấy trạng thái kết nối
    getConnectionStatus() {
        if (!this.eventSource) return 'disconnected';
        switch (this.eventSource.readyState) {
            case EventSource.CONNECTING: return 'connecting';
            case EventSource.OPEN: return 'connected';
            case EventSource.CLOSED: return 'closed';
            default: return 'unknown';
        }
    }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;