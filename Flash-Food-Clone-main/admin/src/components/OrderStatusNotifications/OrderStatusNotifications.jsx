import React, { useState, useEffect } from 'react';
import orderStatusService from '../../utils/orderStatusService';
import './OrderStatusNotifications.scss';

const OrderStatusNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Connect to SSE service
    orderStatusService.connect();

    // Listen for order updates
    const handleOrderUpdate = (data) => {
      const { orderId, status, userId } = data;
      
      // Create notification object
      const notification = {
        id: Date.now(),
        orderId,
        status,
        userId,
        timestamp: new Date(),
        message: getStatusMessage(status, orderId),
        type: getStatusType(status)
      };

      setNotifications(prev => [notification, ...prev].slice(0, 5)); // Keep max 5 notifications
      setIsVisible(true);

      // Auto-hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    const handleConnectionError = (data) => {
      const notification = {
        id: Date.now(),
        message: data.message,
        timestamp: new Date(),
        type: 'error'
      };

      setNotifications(prev => [notification, ...prev].slice(0, 5));
      setIsVisible(true);
    };

    orderStatusService.addEventListener('orderUpdate', handleOrderUpdate);
    orderStatusService.addEventListener('connectionError', handleConnectionError);

    // Cleanup
    return () => {
      orderStatusService.removeEventListener('orderUpdate', handleOrderUpdate);
      orderStatusService.removeEventListener('connectionError', handleConnectionError);
    };
  }, []);

  const getStatusMessage = (status, orderId) => {
    const statusText = {
      'Processing': 'Đang xử lý',
      'Food Preparing': 'Đang chuẩn bị',
      'Out for Delivery': 'Đang giao',
      'Delivered': 'Đã giao',
      'Cancelled': 'Đã hủy'
    };

    const shortOrderId = orderId ? orderId.slice(-6).toUpperCase() : '';
    return `Đơn hàng #${shortOrderId}: ${statusText[status] || status}`;
  };

  const getStatusType = (status) => {
    const types = {
      'Processing': 'info',
      'Food Preparing': 'info',
      'Out for Delivery': 'warning',
      'Delivered': 'success',
      'Cancelled': 'error'
    };

    return types[status] || 'info';
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className={`order-status-notifications ${isVisible ? 'visible' : ''}`}>
      <div className="notification-container">
        <div className="notification-header">
          <h4>🔔 Cập Nhật Trạng Thái Đơn Hàng</h4>
          <button 
            className="clear-all-btn" 
            onClick={clearAll}
            disabled={notifications.length === 0}
          >
            Xóa tất cả
          </button>
        </div>
        
        <div className="notification-list">
          {notifications.length === 0 ? (
            <div className="no-notifications">
              <p>Chưa có cập nhật nào</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${notification.type}`}
              >
                <div className="notification-content">
                  <p>{notification.message}</p>
                  <span className="notification-time">
                    {new Date(notification.timestamp).toLocaleTimeString('vi-VN')}
                  </span>
                </div>
                <button 
                  className="remove-notification-btn"
                  onClick={() => removeNotification(notification.id)}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderStatusNotifications;
