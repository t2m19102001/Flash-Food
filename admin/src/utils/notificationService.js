// Service để xử lý real-time notifications
class NotificationService {
    constructor() {
        this.eventSource = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }

    // Kết nối đến SSE (Server-Sent Events) endpoint
    connectToNotifications(url, onNotification) {
        if (this.eventSource) {
            this.eventSource.close();
        }

        try {
            this.eventSource = new EventSource(`${url}/api/admin/notifications/stream`);

            this.eventSource.onopen = () => {
                console.log('Connected to notification stream');
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
                console.error('Notification stream error:', error);
                this.handleReconnect(url, onNotification);
            };

        } catch (error) {
            console.error('Error connecting to notification stream:', error);
            this.handleReconnect(url, onNotification);
        }
    }

    // Xử lý reconnect tự động
    handleReconnect(url, onNotification) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connectToNotifications(url, onNotification);
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('Max reconnect attempts reached');
        }
    }

    // Đóng kết nối
    disconnect() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        this.reconnectAttempts = 0;
    }

    // Gửi notification thủ công (test)
    sendTestNotification(url, notification) {
        return fetch(`${url}/api/admin/notifications/test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(notification)
        });
    }
}

export default new NotificationService();
