// frontend/src/components/Notifications/NotificationItem.jsx
import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import './NotificationItem.scss';

const NotificationItem = ({ notification }) => {
    const { markAsRead, deleteNotification } = useNotifications();
    const navigate = useNavigate();

    const getTypeIcon = (type) => {
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            order: '📦',
            payment: '💰'
        };
        return icons[type] || '🔔';
    };

    const getTypeClass = (type) => {
        const classes = {
            info: 'info',
            success: 'success',
            warning: 'warning',
            error: 'error'
        };
        return classes[type] || 'info';
    };

    const handleClick = () => {
        if (!notification.isRead) {
            markAsRead(notification._id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        return `${days} ngày trước`;
    };

    return (
        <div className={`notification-item ${!notification.isRead ? 'unread' : ''} ${getTypeClass(notification.type)}`} onClick={handleClick}>
            <div className="notification-icon">{getTypeIcon(notification.type)}</div>
            <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">{formatTime(notification.createdAt)}</div>
            </div>
            <button className="delete-btn" onClick={(e) => { e.stopPropagation(); deleteNotification(notification._id); }}>✕</button>
        </div>
    );
};

export default NotificationItem;