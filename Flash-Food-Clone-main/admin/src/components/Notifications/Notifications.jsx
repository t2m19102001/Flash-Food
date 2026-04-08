import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import './Notifications.scss';
import notificationService from '../../utils/notificationService';

// Notification Context
const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

// Notification Provider
export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [showNotificationCenter, setShowNotificationCenter] = useState(false);
    const [url, setUrl] = useState(null);

    // Lấy URL từ props hoặc environment
    useEffect(() => {
        // Lấy URL từ window.location hoặc từ props
        const baseUrl = window.location.origin;
        setUrl(baseUrl);
    }, []);

    // Kết nối đến real-time notifications
    useEffect(() => {
        if (url) {
            notificationService.connectToNotifications(url, (notification) => {
                addNotification(notification);
            });
        }

        return () => {
            notificationService.disconnect();
        };
    }, [url]);

    // Generate unique ID for notifications
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    // Add notification
    const addNotification = (notification) => {
        const id = generateId();
        const newNotification = {
            id,
            timestamp: new Date(),
            read: false,
            ...notification
        };

        setNotifications(prev => [newNotification, ...prev]);

        // Play sound if enabled
        if (soundEnabled) {
            playNotificationSound();
        }

        // Auto remove after 10 seconds for non-critical notifications
        if (notification.type !== 'error' && notification.type !== 'order') {
            setTimeout(() => {
                removeNotification(id);
            }, 10000);
        }

        return id;
    };

    // Remove notification
    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // Mark as read
    const markAsRead = (id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    // Mark all as read
    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
        );
    };

    // Clear all notifications
    const clearAllNotifications = () => {
        setNotifications([]);
    };

    // Get unread count
    const getUnreadNotifications = () => {
        return notifications.filter(n => !n.read);
    };

    // Get notifications by type
    const getNotificationsByType = (type) => {
        return notifications.filter(n => n.type === type);
    };

    // Play notification sound
    const playNotificationSound = () => {
        try {
            const audio = new Audio('/notification-sound.mp3');
            audio.volume = 0.3;
            audio.play().catch(() => {
                // Ignore errors if sound file doesn't exist
            });
        } catch (error) {
            // Ignore sound errors
        }
    };

    const value = {
        notifications,
        unreadCount: getUnreadNotifications().length,
        soundEnabled,
        showNotificationCenter,
        setSoundEnabled,
        setShowNotificationCenter,
        addNotification,
        removeNotification,
        markAsRead,
        markAllAsRead,
        clearAllNotifications,
        getNotificationsByType,
        getUnreadNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

// Notification Bell Component - để đưa vào Navbar
export const NotificationBell = () => {
    const {
        unreadCount,
        showNotificationCenter,
        setShowNotificationCenter
    } = useNotifications();

    return (
        <div className="notification-bell-container">
            <button
                className="notification-bell"
                onClick={() => setShowNotificationCenter(!showNotificationCenter)}
            >
                <span className="bell-icon">🔔</span>
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>
        </div>
    );
};

// Notification UI Component - chỉ render notification center
export const NotificationUI = () => {
    const notificationRef = useRef(null);
    const {
        notifications,
        unreadCount,
        showNotificationCenter,
        soundEnabled,
        setShowNotificationCenter,
        setSoundEnabled,
        removeNotification,
        markAsRead,
        markAllAsRead,
        clearAllNotifications
    } = useNotifications();

    const getNotificationIcon = (type) => {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            order: '📦',
            user: '👤',
            system: '🔧',
            payment: '💳'
        };
        return icons[type] || 'ℹ️';
    };

    const getNotificationColor = (type) => {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3366ff',
            order: '#8b5cf6',
            user: '#06b6d4',
            system: '#6b7280',
            payment: '#10b981'
        };
        return colors[type] || '#6b7280';
    };

    const formatTime = (timestamp) => {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        return `${days} ngày trước`;
    };

    // Handle click outside to close notification center
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotificationCenter(false);
            }
        };

        if (showNotificationCenter) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotificationCenter, setShowNotificationCenter]);

    return (
        <>
            {/* Notification Center */}
            {showNotificationCenter && (
                <div className="notification-center" ref={notificationRef}>
                    <div className="notification-header">
                        <h3>Thông Báo</h3>
                        <div className="notification-controls">
                            <button
                                className="mark-all-read-btn"
                                onClick={markAllAsRead}
                                disabled={unreadCount === 0}
                            >
                                Đọc tất cả
                            </button>
                            <button
                                className="clear-all-btn"
                                onClick={clearAllNotifications}
                                disabled={notifications.length === 0}
                            >
                                Xóa tất cả
                            </button>
                        </div>
                    </div>

                    <div className="notification-settings">
                        <label className="sound-toggle">
                            <input
                                type="checkbox"
                                checked={soundEnabled}
                                onChange={(e) => setSoundEnabled(e.target.checked)}
                            />
                            <span>Âm thanh thông báo</span>
                        </label>
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="empty-notifications">
                                <p>Không có thông báo nào</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                                    style={{ borderLeftColor: getNotificationColor(notification.type) }}
                                >
                                    <div className="notification-content">
                                        <div className="notification-icon" style={{ color: getNotificationColor(notification.type) }}>
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="notification-details">
                                            <div className="notification-title">{notification.title}</div>
                                            <div className="notification-message">{notification.message}</div>
                                            <div className="notification-time">{formatTime(notification.timestamp)}</div>
                                        </div>
                                        <div className="notification-actions">
                                            {!notification.read && (
                                                <button
                                                    className="mark-read-btn"
                                                    onClick={() => markAsRead(notification.id)}
                                                    title="Đánh dấu đã đọc"
                                                >
                                                    ✓
                                                </button>
                                            )}
                                            <button
                                                className="remove-btn"
                                                onClick={() => removeNotification(notification.id)}
                                                title="Xóa"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

// Hook for easy notification usage
export const useNotification = () => {
    const { addNotification } = useNotifications();

    return {
        success: (title, message, options = {}) =>
            addNotification({ type: 'success', title, message, ...options }),

        error: (title, message, options = {}) =>
            addNotification({ type: 'error', title, message, ...options }),

        warning: (title, message, options = {}) =>
            addNotification({ type: 'warning', title, message, ...options }),

        info: (title, message, options = {}) =>
            addNotification({ type: 'info', title, message, ...options }),

        order: (title, message, options = {}) =>
            addNotification({ type: 'order', title, message, ...options }),

        user: (title, message, options = {}) =>
            addNotification({ type: 'user', title, message, ...options }),

        system: (title, message, options = {}) =>
            addNotification({ type: 'system', title, message, ...options }),

        payment: (title, message, options = {}) =>
            addNotification({ type: 'payment', title, message, ...options })
    };
};

export default NotificationProvider;
