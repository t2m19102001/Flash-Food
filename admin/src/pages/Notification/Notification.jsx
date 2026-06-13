import React, { useState, useEffect } from 'react'
import './Notification.scss'
import axios from 'axios'
import { toast } from 'react-toastify'

const Notification = ({ url }) => {
    const [formData, setFormData] = useState({ 
        title: '', 
        message: '', 
        type: 'info', 
        target: 'all' 
    })
    const [sending, setSending] = useState(false)
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(false)

    // Lấy lịch sử thông báo từ API
    const fetchHistory = async () => {
        setLoading(true)
        try {
            const response = await axios.get(`${url}/api/notifications/admin`, {
                withCredentials: true
            })
            if (response.data.success) {
                setHistory(response.data.data || [])
            }
        } catch (error) {
            console.error("Lỗi tải lịch sử:", error)
            toast.error("Không thể tải lịch sử thông báo")
        } finally {
            setLoading(false)
        }
    }

    // Xóa thông báo
    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa thông báo này?")) return
        try {
            const response = await axios.delete(`${url}/api/notifications/${id}`, {
                withCredentials: true
            })
            if (response.data.success) {
                toast.success("Đã xóa thông báo")
                fetchHistory()
            }
        } catch (error) {
            toast.error("Lỗi khi xóa thông báo")
        }
    }

    const handleSend = async (e) => {
        e.preventDefault()
        if (!formData.title || !formData.message) {
            toast.error("Vui lòng nhập đầy đủ tiêu đề và nội dung")
            return
        }
        setSending(true)
        try {
            const response = await axios.post(`${url}/api/notifications/send`, formData, { 
                withCredentials: true 
            })
            if (response.data.success) {
                toast.success(response.data.message || "Đã gửi thông báo thành công!")
                setFormData({ title: '', message: '', type: 'info', target: 'all' })
                fetchHistory() // Cập nhật lịch sử
            } else {
                toast.error(response.data.message || "Lỗi khi gửi thông báo")
            }
        } catch (error) {
            console.error("Send error:", error)
            toast.error(error.response?.data?.message || "Lỗi khi gửi thông báo")
        } finally {
            setSending(false)
        }
    }

    const getTypeBadge = (type) => {
        const badges = {
            info: { icon: "ℹ️", class: "info", label: "Thông báo" },
            success: { icon: "✅", class: "success", label: "Thành công" },
            warning: { icon: "⚠️", class: "warning", label: "Cảnh báo" },
            error: { icon: "❌", class: "error", label: "Lỗi" }
        }
        return badges[type] || badges.info
    }

    const getTargetLabel = (target) => {
        const targets = {
            all: "📢 Tất cả",
            users: "👥 Người dùng",
            admins: "👑 Admin"
        }
        return targets[target] || targets.all
    }

    useEffect(() => {
        fetchHistory()
    }, [])

    return (
        <div className="notification-page">
            <div className="page-header">
                <h2>🔔 Gửi thông báo</h2>
                <p>Gửi thông báo đến người dùng hệ thống</p>
            </div>

            {/* Form gửi thông báo */}
            <form className="notification-form" onSubmit={handleSend}>
                <h3>✉️ Tạo thông báo mới</h3>
                
                <div className="form-row">
                    <div className="form-group">
                        <label>Đối tượng nhận</label>
                        <select 
                            value={formData.target} 
                            onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                        >
                            <option value="all">📢 Gửi cho tất cả</option>
                            <option value="users">👥 Chỉ người dùng</option>
                            <option value="admins">👑 Chỉ Admin</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Loại thông báo</label>
                        <select 
                            value={formData.type} 
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="info">ℹ️ Thông báo</option>
                            <option value="success">✅ Thành công</option>
                            <option value="warning">⚠️ Cảnh báo</option>
                            <option value="error">❌ Lỗi</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label>Tiêu đề</label>
                    <input 
                        type="text" 
                        placeholder="Nhập tiêu đề thông báo..." 
                        value={formData.title} 
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Nội dung</label>
                    <textarea 
                        placeholder="Nhập nội dung thông báo..." 
                        rows="5" 
                        value={formData.message} 
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })} 
                        required 
                    />
                </div>

                {/* Preview */}
                {formData.title && formData.message && (
                    <div className="preview-section">
                        <h4>👁️ Xem trước</h4>
                        <div className={`preview-card ${getTypeBadge(formData.type).class}`}>
                            <div className="preview-header">
                                <span className="preview-icon">{getTypeBadge(formData.type).icon}</span>
                                <span className="preview-title">{formData.title}</span>
                            </div>
                            <div className="preview-body">{formData.message}</div>
                        </div>
                    </div>
                )}

                <div className="form-actions">
                    <button type="submit" disabled={sending}>
                        {sending ? <div className="spinner"></div> : "📨 Gửi thông báo"}
                    </button>
                </div>
            </form>

            {/* Lịch sử thông báo */}
            <div className="history-section">
                <h3>📜 Lịch sử thông báo đã gửi</h3>
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Đang tải lịch sử...</p>
                    </div>
                ) : history.length === 0 ? (
                    <div className="empty-history">
                        <div className="empty-icon">📭</div>
                        <p>Chưa có thông báo nào được gửi</p>
                    </div>
                ) : (
                    <div className="history-list">
                        {history.map((notif) => (
                            <div key={notif._id} className={`history-item ${getTypeBadge(notif.type).class}`}>
                                <div className="history-header">
                                    <span className="history-icon">{getTypeBadge(notif.type).icon}</span>
                                    <span className="history-title">{notif.title}</span>
                                    <span className="history-target">{getTargetLabel(notif.target)}</span>
                                    <span className="history-time">{new Date(notif.sentAt).toLocaleString('vi-VN')}</span>
                                </div>
                                <div className="history-message">{notif.message}</div>
                                <div className="history-actions">
                                    <button className="delete-btn" onClick={() => handleDelete(notif._id)}>🗑️ Xóa</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Notification