import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const NotificationBell = () => {
    const { url, isAuthenticated } = React.useContext(StoreContext);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);
    const navigate = useNavigate();

    // Lấy danh sách thông báo
    const fetchNotifications = async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const response = await axios.get(`${url}/api/notifications`, { withCredentials: true });
            if (response.data.success) {
                setNotifications(response.data.notifications || []);
                setUnreadCount(response.data.unreadCount || 0);
            }
        } catch (error) {
            console.error("Lỗi lấy thông báo:", error);
        } finally {
            setLoading(false);
        }
    };

    // Đánh dấu 1 thông báo đã đọc
    const markAsRead = async (notificationId) => {
        try {
            await axios.put(`${url}/api/notifications/${notificationId}/read`, {}, { withCredentials: true });
            setNotifications(prev => prev.map(n => 
                n._id === notificationId ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Lỗi đánh dấu đã đọc:", error);
        }
    };

    // Đánh dấu tất cả đã đọc
    const markAllAsRead = async () => {
        if (unreadCount === 0) return;
        
        try {
            await axios.put(`${url}/api/notifications/read-all`, {}, { withCredentials: true });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Lỗi đánh dấu tất cả:", error);
        }
    };

    // Xử lý click vào thông báo
    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await markAsRead(notification._id);
        }
        setShow(false);
        
        if (notification.link) {
            navigate(notification.link);
        } else if (notification.orderId) {
            navigate(`/order/${notification.orderId}`);
        } else {
            alert(`📢 ${notification.title}\n\n${notification.message}`);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, url]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShow(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatTime = (date) => {
        if (!date) return '';
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
        <div ref={wrapperRef} style={{ position: 'relative', display: 'inline-block', marginLeft: '10px' }}>
            <button 
                onClick={() => setShow(!show)} 
                style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', position: 'relative' }}
            >
                🔔
                {unreadCount > 0 && (
                    <span style={{ 
                        position: 'absolute', 
                        top: '-5px', 
                        right: '-10px', 
                        background: '#ef4444', 
                        color: 'white', 
                        borderRadius: '50%', 
                        padding: '2px 6px', 
                        fontSize: '10px',
                        minWidth: '18px',
                        textAlign: 'center'
                    }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>
            
            {show && (
                <div style={{ 
                    position: 'absolute', 
                    top: '40px', 
                    right: '0', 
                    width: '380px', 
                    background: 'white', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px', 
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)', 
                    zIndex: 9999,
                    maxHeight: '500px',
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Header */}
                    <div style={{ 
                        padding: '12px 16px', 
                        borderBottom: '1px solid #e2e8f0', 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#f8fafc',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1
                    }}>
                        <span style={{ fontWeight: 'bold' }}>📬 Thông báo ({unreadCount} chưa đọc)</span>
                    </div>
                    
                    {/* Danh sách thông báo */}
                    <div style={{ flex: 1, overflowY: 'auto', maxHeight: '380px' }}>
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                <div style={{ width: '30px', height: '30px', border: '2px solid #e2e8f0', borderTopColor: '#ff6b4a', borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 12px' }}></div>
                                Đang tải...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                📭 Chưa có thông báo nào
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div 
                                    key={n._id} 
                                    onClick={() => handleNotificationClick(n)}
                                    style={{ 
                                        padding: '14px 16px', 
                                        borderBottom: '1px solid #e2e8f0', 
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        background: n.isRead ? '#ffffff' : '#fef3c7'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = n.isRead ? '#ffffff' : '#fef3c7'}
                                >
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                        <div style={{ fontSize: '20px' }}>
                                            {n.type === 'success' ? '✅' : n.type === 'warning' ? '⚠️' : n.type === 'error' ? '❌' : 'ℹ️'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#1e293b' }}>
                                                {n.title}
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                                                {n.message}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                {formatTime(n.sentAt)}
                                            </div>
                                        </div>
                                        {!n.isRead && (
                                            <div style={{ 
                                                width: '8px', 
                                                height: '8px', 
                                                background: '#ff6b4a', 
                                                borderRadius: '50%',
                                                marginTop: '8px'
                                            }} />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {/* Footer - Có 2 nút: Đánh dấu đã đọc tất cả và Đóng */}
                    <div style={{ 
                        padding: '12px 16px', 
                        borderTop: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '10px',
                        position: 'sticky',
                        bottom: 0
                    }}>
                        {unreadCount > 0 && (
                            <button 
                                onClick={markAllAsRead}
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: '#ff6b4a', 
                                    cursor: 'pointer', 
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#fff5f2'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                ✅ Đánh dấu đã đọc tất cả
                            </button>
                        )}
                        {unreadCount === 0 && <div />}
                        <button 
                            onClick={() => setShow(false)}
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: '#64748b', 
                                cursor: 'pointer', 
                                fontSize: '12px',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
            
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default NotificationBell;