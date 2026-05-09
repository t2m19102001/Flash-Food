import React, { useState, useEffect } from 'react'
import './Coupon.scss'
import axios from 'axios'
import { toast } from 'react-toastify'

const Coupon = ({ url }) => {
    const [coupons, setCoupons] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({ code: '', discountPercent: '', minOrder: 0, expiresAt: '', isActive: true })

    const fetchCoupons = async () => {
        try {
            const response = await axios.get(`${url}/api/promo/list`, { withCredentials: true })
            if (response.data.success) setCoupons(response.data.promos)
        } catch (error) { toast.error("Lỗi tải mã giảm giá") } finally { setLoading(false) }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            let response
            if (isEditing) {
                response = await axios.put(`${url}/api/promo/update`, { id: editingId, ...formData }, { withCredentials: true })
            } else {
                response = await axios.post(`${url}/api/promo/add`, formData, { withCredentials: true })
            }
            if (response.data.success) { toast.success(isEditing ? "Cập nhật thành công" : "Thêm mã giảm giá thành công"); resetForm(); fetchCoupons() }
        } catch (error) { toast.error("Lỗi khi lưu") }
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Xóa mã giảm giá này?")) return
        try {
            const response = await axios.delete(`${url}/api/promo/delete`, { data: { id }, withCredentials: true })
            if (response.data.success) { toast.success("Đã xóa"); fetchCoupons() }
        } catch (error) { toast.error("Lỗi khi xóa") }
    }

    const toggleStatus = async (id, currentStatus) => {
        try {
            const response = await axios.put(`${url}/api/promo/toggle`, { id, isActive: !currentStatus }, { withCredentials: true })
            if (response.data.success) { toast.success("Cập nhật trạng thái"); fetchCoupons() }
        } catch (error) { toast.error("Lỗi cập nhật") }
    }

    const resetForm = () => { setShowForm(false); setIsEditing(false); setEditingId(null); setFormData({ code: '', discountPercent: '', minOrder: 0, expiresAt: '', isActive: true }) }

    useEffect(() => { fetchCoupons() }, [])

    return (
        <div className="coupon-page">
            <div className="page-header"><h2>🎟️ Quản lý mã giảm giá</h2><button className="add-btn" onClick={() => setShowForm(true)}>➕ Thêm mã</button></div>
            {showForm && (
                <form className="coupon-form" onSubmit={handleSubmit}>
                    <h3>{isEditing ? "✏️ Sửa mã" : "✨ Thêm mã giảm giá"}</h3>
                    <div className="form-row"><input type="text" placeholder="Mã code (VD: SALE20)" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required /><input type="number" placeholder="Giảm giá (%)" value={formData.discountPercent} onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })} required /></div>
                    <div className="form-row"><input type="number" placeholder="Đơn hàng tối thiểu" value={formData.minOrder} onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })} /><input type="datetime-local" value={formData.expiresAt} onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })} /></div>
                    <div className="form-actions"><button type="submit">💾 Lưu</button><button type="button" onClick={resetForm}>❌ Hủy</button></div>
                </form>
            )}
            <div className="coupon-table">
                <div className="table-header"><span>Mã</span><span>Giảm giá</span><span>Đơn tối thiểu</span><span>Hạn dùng</span><span>Trạng thái</span><span>Thao tác</span></div>
                {coupons.map(coupon => (
                    <div key={coupon._id} className="table-row">
                        <span className="coupon-code">{coupon.code}</span>
                        <span>{coupon.discountPercent}%</span>
                        <span>{coupon.minOrder?.toLocaleString()}đ</span>
                        <span>{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('vi-VN') : 'Vô hạn'}</span>
                        <span><button className={`status-btn ${coupon.isActive ? 'active' : 'inactive'}`} onClick={() => toggleStatus(coupon._id, coupon.isActive)}>{coupon.isActive ? '✅ Hoạt động' : '❌ Khóa'}</button></span>
                        <div className="actions"><button className="edit-btn" onClick={() => { setIsEditing(true); setEditingId(coupon._id); setFormData(coupon); setShowForm(true); }}>✏️</button><button className="delete-btn" onClick={() => handleDelete(coupon._id)}>🗑️</button></div>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default Coupon