import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';

const NotificationBell = () => {
    const { url, isAuthenticated } = React.useContext(StoreContext);
    const [notifications, setNotifications] = useState([]);
    const [show, setShow] = useState(false);

    console.log("🔔 Component render, isAuthenticated:", isAuthenticated);

    useEffect(() => {
        if (!isAuthenticated) return;
        console.log("📡 Gọi API...");
        axios.get(`${url}/api/notifications`, { withCredentials: true })
            .then(res => {
                console.log("✅ API trả về:", res.data);
                if (res.data.success) setNotifications(res.data.notifications);
            })
            .catch(err => console.log("❌ Lỗi:", err));
    }, [isAuthenticated, url]);

    return (
        <div style={{ position: 'relative', display: 'inline-block', marginLeft: '10px' }}>
            <button 
                onClick={() => setShow(!show)} 
                style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', position: 'relative' }}
            >
                🔔
                {notifications.length > 0 && (
                    <span style={{ 
                        position: 'absolute', 
                        top: '-5px', 
                        right: '-10px', 
                        background: 'red', 
                        color: 'white', 
                        borderRadius: '50%', 
                        padding: '2px 6px', 
                        fontSize: '10px',
                        minWidth: '18px',
                        textAlign: 'center'
                    }}>
                        {notifications.length}
                    </span>
                )}
            </button>
            
            {show && (
                <div style={{ 
                    position: 'absolute', 
                    top: '40px', 
                    right: '0', 
                    width: '320px', 
                    background: 'white', 
                    border: '1px solid #ddd', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
                    zIndex: 1000,
                    maxHeight: '400px',
                    overflow: 'auto'
                }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee', fontWeight: 'bold', background: '#f8f9fa', borderRadius: '12px 12px 0 0' }}>
                        Thông báo ({notifications.length})
                    </div>
                    <div>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '30px', textAlign: 'center', color: '#999' }}>
                                📭 Chưa có thông báo nào
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div key={n._id} style={{ padding: '12px 16px', borderBottom: '1px solid #eee', cursor: 'pointer' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{n.title}</div>
                                    <div style={{ fontSize: '13px', color: '#666' }}>{n.message}</div>
                                    <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                                        {new Date(n.sentAt).toLocaleString('vi-VN')}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;