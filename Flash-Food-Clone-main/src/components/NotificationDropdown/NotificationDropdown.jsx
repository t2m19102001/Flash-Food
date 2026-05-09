// frontend/src/components/Notifications/NotificationDropdown.jsx
import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import NotificationItem from './NotificationItem';
import './NotificationDropdown.scss';

const NotificationDropdown = ({ onClose }) => {
    const { notifications, unreadCount, loading, markAllAsRead } = useNotifications();

    if (loading) {
        return (
            <div className="notification-dropdown">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="notification-dropdown">
            <div className="dropdown-header">
                <h3>Thông báo</h3>
                {unreadCount > 0 && (
                    <button className="mark-all-read" onClick={markAllAsRead}>
                        Đánh dấu đã đọc
                    </button>
                )}
            </div>

            <div className="dropdown-list">
                {notifications.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">📭</span>
                        <p>Chưa có thông báo nào</p>
                    </div>
                ) : (
                    notifications.map(notif => (
                        <NotificationItem key={notif._id} notification={notif} />
                    ))
                )}
            </div>

            {notifications.length > 0 && (
                <div className="dropdown-footer">
                    <button onClick={onClose}>Đóng</button>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;