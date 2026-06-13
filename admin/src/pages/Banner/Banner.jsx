import React, { useState, useEffect } from 'react'
import './Banner.scss'
import axios from 'axios'
import { toast } from 'react-toastify'

const Banner = ({ url }) => {
    const [banners, setBanners] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({ title: '', subtitle: '', image: null, link: '', order: 0, isActive: true })
    const [imagePreview, setImagePreview] = useState(null)

    const fetchBanners = async () => {
        try {
            const response = await axios.get(`${url}/api/banner/list`, { withCredentials: true })
            if (response.data.success) setBanners(response.data.banners)
        } catch (error) { toast.error("Lỗi tải banner") } finally { setLoading(false) }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const formDataSend = new FormData()
        Object.keys(formData).forEach(key => { if (formData[key] !== null) formDataSend.append(key, formData[key]) })
        try {
            let response
            if (isEditing) { formDataSend.append('id', editingId); response = await axios.put(`${url}/api/banner/update`, formDataSend, { withCredentials: true }) }
            else { response = await axios.post(`${url}/api/banner/add`, formDataSend, { withCredentials: true }) }
            if (response.data.success) { toast.success(isEditing ? "Cập nhật thành công" : "Thêm banner thành công"); resetForm(); fetchBanners() }
        } catch (error) { toast.error("Lỗi khi lưu") }
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Xóa banner này?")) return
        try {
            const response = await axios.delete(`${url}/api/banner/delete`, { data: { id }, withCredentials: true })
            if (response.data.success) { toast.success("Đã xóa"); fetchBanners() }
        } catch (error) { toast.error("Lỗi khi xóa") }
    }

    const resetForm = () => { setShowForm(false); setIsEditing(false); setEditingId(null); setFormData({ title: '', subtitle: '', image: null, link: '', order: 0, isActive: true }); setImagePreview(null) }

    useEffect(() => { fetchBanners() }, [])

    return (
        <div className="banner-page">
            <div className="page-header"><h2>🖼️ Quản lý Banner</h2><button className="add-btn" onClick={() => setShowForm(true)}>➕ Thêm banner</button></div>
            {showForm && (
                <form className="banner-form" onSubmit={handleSubmit}>
                    <h3>{isEditing ? "✏️ Sửa banner" : "✨ Thêm banner mới"}</h3>
                    <div className="form-row"><input type="text" placeholder="Tiêu đề" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /><input type="text" placeholder="Phụ đề" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} /></div>
                    <div className="form-row"><input type="text" placeholder="Đường dẫn (link)" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} /><input type="number" placeholder="Thứ tự" value={formData.order} onChange={(e) => setFormData({ ...formData, order: e.target.value })} /></div>
                    <input type="file" accept="image/*" onChange={(e) => { setFormData({ ...formData, image: e.target.files[0] }); setImagePreview(URL.createObjectURL(e.target.files[0])) }} />
                    {imagePreview && <img src={imagePreview} alt="Preview" className="preview-img" />}
                    <div className="form-actions"><button type="submit">💾 Lưu</button><button type="button" onClick={resetForm}>❌ Hủy</button></div>
                </form>
            )}
            <div className="banner-grid">
                {banners.map(banner => (
                    <div key={banner._id} className="banner-card">
                        <img src={`${url}/uploads/${banner.image}`} alt={banner.title} />
                        <div className="banner-info"><h4>{banner.title}</h4><p>{banner.subtitle}</p><small>Thứ tự: {banner.order}</small></div>
                        <div className="banner-actions"><button className="edit-btn" onClick={() => { setIsEditing(true); setEditingId(banner._id); setFormData(banner); setShowForm(true); }}>✏️</button><button className="delete-btn" onClick={() => handleDelete(banner._id)}>🗑️</button></div>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default Banner