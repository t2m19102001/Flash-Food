// frontend/src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children, url }) => {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    // Lấy danh sách thông báo
    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const response = await axios.get(`${url}/api/notifications`, {
                withCredentials: true
            });
            if (response.data.success) {
                setNotifications(response.data.notifications);
                const unread = response.data.notifications.filter(n => !n.isRead).length;
                setUnreadCount(unread);
            }
        } catch (error) {
            console.error('Lỗi tải thông báo:', error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, url]);

    // Đánh dấu đã đọc
    const markAsRead = async (notificationId) => {
        try {
            const response = await axios.put(`${url}/api/notifications/${notificationId}/read`, {}, {
                withCredentials: true
            });
            if (response.data.success) {
                setNotifications(prev => prev.map(n =>
                    n._id === notificationId ? { ...n, isRead: true } : n
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Lỗi đánh dấu đã đọc:', error);
        }
    };

    // Đánh dấu tất cả đã đọc
    const markAllAsRead = async () => {
        try {
            const response = await axios.put(`${url}/api/notifications/read-all`, {}, {
                withCredentials: true
            });
            if (response.data.success) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Lỗi đánh dấu tất cả:', error);
        }
    };

    // Xóa thông báo
    const deleteNotification = async (notificationId) => {
        try {
            const response = await axios.delete(`${url}/api/notifications/${notificationId}`, {
                withCredentials: true
            });
            if (response.data.success) {
                const wasUnread = notifications.find(n => n._id === notificationId)?.isRead === false;
                setNotifications(prev => prev.filter(n => n._id !== notificationId));
                if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Lỗi xóa thông báo:', error);
        }
    };

    // SSE hoặc Polling cho real-time
    useEffect(() => {
        if (!isAuthenticated) return;

        fetchNotifications();

        // Polling mỗi 30 giây
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [isAuthenticated, fetchNotifications]);

    const value = {
        notifications,
        unreadCount,
        loading,
        showDropdown,
        setShowDropdown,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};