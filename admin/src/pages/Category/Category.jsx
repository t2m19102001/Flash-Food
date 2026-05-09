import React, { useState, useEffect } from 'react'
import './Category.scss'
import axios from 'axios'
import { toast } from 'react-toastify'

const Category = ({ url }) => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({ name: '', image: null, description: '' })
    const [imagePreview, setImagePreview] = useState(null)

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${url}/api/category/list`, { withCredentials: true })
            if (response.data.success) setCategories(response.data.categories)
        } catch (error) {
            toast.error("Lỗi tải danh mục")
        } finally { setLoading(false) }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const formDataSend = new FormData()
        formDataSend.append('name', formData.name)
        if (formData.image) formDataSend.append('image', formData.image)
        if (formData.description) formDataSend.append('description', formData.description)

        try {
            let response
            if (isEditing) {
                formDataSend.append('id', editingId)
                response = await axios.put(`${url}/api/category/update`, formDataSend, { withCredentials: true })
            } else {
                response = await axios.post(`${url}/api/category/add`, formDataSend, { withCredentials: true })
            }
            if (response.data.success) {
                toast.success(isEditing ? "Cập nhật thành công" : "Thêm danh mục thành công")
                resetForm()
                fetchCategories()
            }
        } catch (error) { toast.error("Lỗi khi lưu danh mục") }
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Xóa danh mục này?")) return
        try {
            const response = await axios.delete(`${url}/api/category/delete`, { data: { id }, withCredentials: true })
            if (response.data.success) { toast.success("Đã xóa"); fetchCategories() }
        } catch (error) { toast.error("Lỗi khi xóa") }
    }

    const resetForm = () => {
        setShowForm(false)
        setIsEditing(false)
        setEditingId(null)
        setFormData({ name: '', image: null, description: '' })
        setImagePreview(null)
    }

    useEffect(() => { fetchCategories() }, [])

    return (
        <div className="category-page">
            <div className="page-header"><h2>📂 Quản lý danh mục</h2><button className="add-btn" onClick={() => setShowForm(true)}>➕ Thêm danh mục</button></div>
            {showForm && (
                <form className="category-form" onSubmit={handleSubmit}>
                    <h3>{isEditing ? "✏️ Sửa danh mục" : "✨ Thêm danh mục"}</h3>
                    <input type="text" placeholder="Tên danh mục" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    <textarea placeholder="Mô tả" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" />
                    <input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })} />
                    <div className="form-actions"><button type="submit">💾 Lưu</button><button type="button" onClick={resetForm}>❌ Hủy</button></div>
                </form>
            )}
            <div className="category-table">
                <div className="table-header"><span>Tên danh mục</span><span>Mô tả</span><span>Thao tác</span></div>
                {categories.map(cat => (
                    <div key={cat._id} className="table-row">
                        <span className="cat-name">{cat.name}</span>
                        <span className="cat-desc">{cat.description || "—"}</span>
                        <div className="actions">
                            <button className="edit-btn" onClick={() => { setIsEditing(true); setEditingId(cat._id); setFormData({ name: cat.name, description: cat.description || '', image: null }); setShowForm(true); }}>✏️</button>
                            <button className="delete-btn" onClick={() => handleDelete(cat._id)}>🗑️</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default Category