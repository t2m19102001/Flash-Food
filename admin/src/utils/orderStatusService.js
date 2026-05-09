class OrderStatusService {
  constructor() {
    this.eventSource = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    // 🔥 THÊM CỜ BẬT/TẮT SSE
    this.enabled = false; // Đổi thành true khi backend sẵn sàng
  }

  // Connect to SSE endpoint
  connect(userId) {
    // 🔥 KIỂM TRA NẾU BỊ TẮT THÌ KHÔNG KẾT NỐI
    if (!this.enabled) {
      console.log('🔕 SSE service is disabled. Set enabled = true to enable.');
      return;
    }

    if (this.eventSource) {
      this.disconnect();
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      // 🔥 THÊM USER_ID VÀO URL NẾU CẦN
      const url = userId ? `${apiUrl}/api/orders/subscribe?userId=${userId}` : `${apiUrl}/api/orders/subscribe`;
      this.eventSource = new EventSource(url);
      
      this.eventSource.onopen = () => {
        console.log('✅ SSE Connection established');
        this.reconnectAttempts = 0;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('❌ SSE Connection error:', error);
        this.handleReconnect();
      };

      this.eventSource.onclose = () => {
        console.log('🔌 SSE Connection closed');
        this.handleReconnect();
      };

    } catch (error) {
      console.error('Error creating SSE connection:', error);
      this.handleReconnect();
    }
  }

  // Handle incoming messages
  handleMessage(data) {
    const { type, orderId, status, userId } = data;

    switch (type) {
      case 'connected':
        console.log('✅ Connected to order status updates');
        break;
        
      case 'order_update':
        this.notifyListeners('orderUpdate', { orderId, status, userId });
        break;
        
      default:
        console.log('Unknown message type:', type);
    }
  }

  // Handle reconnection logic
  handleReconnect() {
    if (!this.enabled) return;
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.notifyListeners('connectionError', { message: 'Unable to connect to order status updates' });
    }
  }

  // Add event listener
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  // Remove event listener
  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  // Notify all listeners for an event
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // Disconnect from SSE
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.reconnectAttempts = 0;
  }

  // Get connection status
  isConnected() {
    return this.enabled && this.eventSource && this.eventSource.readyState === EventSource.OPEN;
  }

  // 🔥 THÊM HÀM BẬT/TẮT SSE
  enable() {
    this.enabled = true;
    this.connect();
  }

  disable() {
    this.enabled = false;
    this.disconnect();
  }

  // 🔥 THÊM HÀM KIỂM TRA TRẠNG THÁI
  getStatus() {
    return {
      enabled: this.enabled,
      connected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create singleton instance
const orderStatusService = new OrderStatusService();

export default orderStatusService;