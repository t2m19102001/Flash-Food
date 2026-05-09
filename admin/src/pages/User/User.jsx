import React, { useState, useEffect } from "react";
import "./User.scss";
import axios from "axios";
import { toast } from "react-toastify";
import { SkeletonTable, LoadingOverlay } from "../../components/Loading/Loading";
import { buildImageUrl } from "../../utils/imageUrl";

const User = ({ url }) => {
    const [users, setUsers] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [image, setImage] = useState(null);
    const [currentImage, setCurrentImage] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("all");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
        role: "user",
        isActive: true
    });

    const getImageUrl = buildImageUrl;

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone?.includes(searchTerm);
        const matchesRole = filterRole === "all" ||
            (filterRole === "admin" && user.isAdmin) ||
            (filterRole === "user" && !user.isAdmin);
        return matchesSearch && matchesRole;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    // 🔥 SỬA: fetch users với withCredentials
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${url}/api/user/list`, {
                withCredentials: true
            });
            if (response.data.success) {
                setUsers(response.data.users);
            } else {
                toast.error("Không thể tải danh sách người dùng");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            if (error.response?.status === 401) {
                toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
            } else {
                toast.error("Lỗi khi tải danh sách người dùng");
            }
        } finally {
            setLoading(false);
        }
    };

    // 🔥 SỬA: add/edit user với withCredentials
    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        // Validate
        if (!formData.name || !formData.email) {
            toast.error("Vui lòng nhập đầy đủ tên và email");
            return;
        }
        if (!isEditing && !formData.password) {
            toast.error("Vui lòng nhập mật khẩu");
            return;
        }
        if (formData.password && formData.password.length < 8) {
            toast.error("Mật khẩu phải có ít nhất 8 ký tự");
            return;
        }

        setSubmitting(true);
        
        try {
            if (isEditing) {
                const updateData = new FormData();
                updateData.append("id", editingId);
                updateData.append("name", formData.name);
                updateData.append("email", formData.email);
                updateData.append("phone", formData.phone || "");
                updateData.append("isAdmin", formData.role === "admin");
                if (image) updateData.append("image", image);
                if (formData.password) updateData.append("password", formData.password);

                const response = await axios.post(`${url}/api/user/update`, updateData, {
                    withCredentials: true,
                    headers: { "Content-Type": "multipart/form-data" }
                });

                if (response.data.success) {
                    toast.success("Cập nhật người dùng thành công!");
                    resetForm();
                    fetchUsers();
                } else {
                    toast.error(response.data.message || "Không thể cập nhật người dùng");
                }
            } else {
                const response = await axios.post(`${url}/api/user/register`, {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone || "",
                    isAdmin: formData.role === "admin"
                }, { withCredentials: true });

                if (response.data.success) {
                    toast.success("Thêm người dùng thành công!");
                    resetForm();
                    fetchUsers();
                } else {
                    toast.error(response.data.message || "Không thể thêm người dùng");
                }
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error(error.response?.data?.message || "Lỗi khi xử lý yêu cầu");
        } finally {
            setSubmitting(false);
        }
    };

    // 🔥 SỬA: toggle user status với withCredentials
    const handleToggleUserStatus = async (user) => {
        const action = user.isActive !== false ? "khóa" : "mở khóa";
        if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản "${user.name}"?`)) return;

        try {
            const response = await axios.post(`${url}/api/user/toggle-status`, {
                id: user._id
            }, { withCredentials: true });

            if (response.data.success) {
                toast.success(response.data.message);
                fetchUsers();
            } else {
                toast.error(response.data.message || `Không thể ${action} tài khoản`);
            }
        } catch (error) {
            console.error("Error toggling user status:", error);
            toast.error(`Lỗi khi ${action} tài khoản`);
        }
    };

    // 🔥 SỬA: delete user với withCredentials
    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;

        try {
            const response = await axios.post(`${url}/api/user/delete`, {
                id: userId
            }, { withCredentials: true });

            if (response.data.success) {
                toast.success("Xóa người dùng thành công");
                fetchUsers();
            } else {
                toast.error(response.data.message || "Không thể xóa người dùng");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Lỗi khi xóa người dùng");
        }
    };

    const editUser = (user) => {
        setIsEditing(true);
        setEditingId(user._id);
        setFormData({
            name: user.name || "",
            phone: user.phone || "",
            email: user.email || "",
            password: "",
            role: user.isAdmin ? "admin" : "user",
            isActive: user.isActive !== false
        });
        setCurrentImage(user.image || "");
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const resetForm = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({
            name: "",
            phone: "",
            email: "",
            password: "",
            role: "user",
            isActive: true
        });
        setImage(null);
        setCurrentImage("");
        setShowAddForm(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="user-page">
            <LoadingOverlay show={submitting} text="Đang xử lý yêu cầu..." />
            
            <div className="user-header">
                <div>
                    <h2>👥 Quản Lý Người Dùng</h2>
                    <p className="subtitle">Quản lý tất cả tài khoản người dùng trên hệ thống</p>
                </div>
                <div className="header-actions">
                    <div className="user-count">
                        <span>📊 Tổng số: <strong>{users.length}</strong> người dùng</span>
                    </div>
                    <button className="add-user-btn" onClick={() => setShowAddForm(!showAddForm)}>
                        {showAddForm ? "✖ Hủy" : "➕ Thêm Người Dùng"}
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="toolbar">
                <div className="toolbar-left">
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, email, SĐT..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <div className="filter-group">
                        <select className="filter-dropdown" value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}>
                            <option value="all">📋 Tất cả</option>
                            <option value="user">👤 Người dùng</option>
                            <option value="admin">👑 Quản trị viên</option>
                        </select>
                        <button className="toolbar-btn" onClick={fetchUsers} title="Làm mới">🔄</button>
                    </div>
                </div>
                <div className="toolbar-right">
                    <div className="pagination-info">
                        {filteredUsers.length > 0 ? `${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filteredUsers.length)} / ${filteredUsers.length}` : '0 / 0'}
                    </div>
                    <button className="toolbar-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>◀</button>
                    <button className="toolbar-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>▶</button>
                </div>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
                <form className="add-user-form" onSubmit={onSubmitHandler}>
                    <h3>{isEditing ? "✏️ Chỉnh Sửa Người Dùng" : "✨ Thêm Người Dùng Mới"}</h3>
                    <div className="form-grid">
                        <div className="form-col">
                            <label>🖼️ Ảnh đại diện</label>
                            <div className="image-upload-box" onClick={() => document.getElementById("user-image").click()}>
                                {(image || currentImage) ? (
                                    <img src={image ? URL.createObjectURL(image) : getImageUrl(currentImage)} alt="Preview" />
                                ) : (
                                    <div className="upload-placeholder">📸<p>Chọn ảnh</p></div>
                                )}
                            </div>
                            <input type="file" id="user-image" hidden accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                        </div>
                        <div className="form-col">
                            <div className="form-group"><label>👤 Tên người dùng *</label><input type="text" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nhập tên" required /></div>
                            <div className="form-group"><label>📧 Email *</label><input type="email" name="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Nhập email" required /></div>
                            <div className="form-group"><label>📞 Số điện thoại</label><input type="tel" name="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Nhập SĐT" /></div>
                            <div className="form-group"><label>🔒 Mật khẩu {!isEditing && "*"}</label><input type="password" name="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder={isEditing ? "Để trống nếu không đổi" : "Nhập mật khẩu"} /></div>
                            <div className="form-row"><div className="form-group"><label>👑 Vai trò</label><select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}><option value="user">Người dùng</option><option value="admin">Quản trị viên</option></select></div></div>
                        </div>
                    </div>
                    <div className="form-actions"><button type="submit" className="submit-btn" disabled={submitting}>{submitting ? "Đang xử lý..." : (isEditing ? "💾 Cập Nhật" : "➕ Thêm Mới")}</button><button type="button" className="cancel-btn" onClick={resetForm}>❌ Hủy</button></div>
                </form>
            )}

            {/* User Table */}
            <div className="user-table">
                <div className="user-table-format title"><b>🖼️ Ảnh</b><b>👤 Tên</b><b>📞 SĐT</b><b>📧 Email</b><b>👑 Vai trò</b><b>📊 Trạng thái</b><b>⚙️ Thao tác</b></div>
                {loading ? <SkeletonTable rows={5} columns={7} /> : currentUsers.length > 0 ? currentUsers.map((user) => (
                    <div key={user._id} className="user-table-format">
                        <div className="user-image">{user.image ? <img src={getImageUrl(user.image)} alt={user.name} /> : <div className="placeholder-img">👤</div>}</div>
                        <p className="user-name">{user.name}</p><p>{user.phone || "—"}</p><p>{user.email}</p>
                        <span className={`role-badge ${user.isAdmin ? "admin" : "user"}`}>{user.isAdmin ? "Admin" : "User"}</span>
                        <span className={`status-badge ${user.isActive !== false ? "active" : "inactive"}`}>{user.isActive !== false ? "✅ Hoạt động" : "❌ Bị khóa"}</span>
                        <div className="action-buttons">
                            <button className="lock-btn" onClick={() => handleToggleUserStatus(user)} title={user.isActive !== false ? "Khóa" : "Mở khóa"}>{user.isActive !== false ? "🔒" : "🔓"}</button>
                            <button className="edit-btn" onClick={() => editUser(user)}>✏️</button>
                            <button className="delete-btn" onClick={() => handleDeleteUser(user._id)} disabled={user.isAdmin} title={user.isAdmin ? "Không thể xóa Admin" : "Xóa"}>🗑️</button>
                        </div>
                    </div>
                )) : <div className="empty-state"><div className="empty-icon">👥</div><p>Chưa có người dùng nào</p></div>}
            </div>
        </div>
    );
};

export default User;