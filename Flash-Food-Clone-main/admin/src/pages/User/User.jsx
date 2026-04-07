import React, { useState, useEffect } from "react";
import "./User.scss";
import axios from "axios";
import { toast } from "react-toastify";
import { getCookie } from "../../utils/cookieHelper";
import { SkeletonTable, LoadingOverlay } from "../../components/Loading/Loading";
import {
    FormInput,
    FormSelect,
    FileUpload,
    FormActions,
    useFormValidation
} from "../../components/FormComponents/FormComponents";

const User = ({ url }) => {
    const [users, setUsers] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [image, setImage] = useState(false);
    const [currentImage, setCurrentImage] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 40;
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("all");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newUser, setNewUser] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
        role: "user",
        isActive: true
    });

    // Validation schema
    const validationSchema = {
        name: (value) => {
            if (!value.trim()) return 'Tên không được để trống';
            if (value.trim().length < 2) return 'Tên phải có ít nhất 2 ký tự';
            if (value.trim().length > 50) return 'Tên không được quá 50 ký tự';
            return '';
        },
        email: (value) => {
            if (!value.trim()) return 'Email không được để trống';
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) return 'Email không hợp lệ';
            return '';
        },
        phone: (value) => {
            if (value && !/^[0-9]{10,11}$/.test(value)) {
                return 'Số điện thoại không hợp lệ (10-11 số)';
            }
            return '';
        },
        password: (value) => {
            if (!isEditing && !value) return 'Mật khẩu không được để trống';
            if (value && value.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
            return '';
        },
        role: (value) => {
            if (!value) return 'Vui lòng chọn vai trò';
            return '';
        }
    };

    const initialValues = {
        name: "",
        phone: "",
        email: "",
        password: "",
        role: "user",
        isActive: true
    };

    const {
        values,
        errors,
        touched,
        setValue,
        setError,
        handleChange,
        handleBlur,
        validateForm,
        resetForm
    } = useFormValidation(initialValues, validationSchema);

    // Filter and search users
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.phone && user.phone.includes(searchTerm));
        const matchesRole = filterRole === "all" ||
            (filterRole === "admin" && user.isAdmin) ||
            (filterRole === "user" && !user.isAdmin);
        return matchesSearch && matchesRole;
    });


    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = getCookie("adminToken");
            const response = await axios.get(`${url}/api/user/list`, {
                headers: { token }
            });
            if (response.data.success) {
                setUsers(response.data.users);
            } else {
                toast.error("Không thể tải danh sách người dùng");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Lỗi khi tải danh sách");
        } finally {
            setLoading(false);
        }
    };

    const onSubmitHandler = async () => {
        if (!validateForm()) {
            toast.error("Vui lòng sửa các lỗi trong form");
            return;
        }

        try {
            setSubmitting(true);
            const token = getCookie("adminToken");

            if (isEditing) {
                // Update user
                const formData = new FormData();
                formData.append("id", editingId);
                formData.append("name", values.name);
                formData.append("email", values.email);
                formData.append("phone", values.phone);
                formData.append("isAdmin", values.role === "admin");

                if (image) {
                    formData.append("image", image);
                }

                const response = await axios.post(`${url}/api/user/update`, formData, {
                    headers: { token }
                });

                if (response.data.success) {
                    toast.success("Cập nhật người dùng thành công!");
                    setIsEditing(false);
                    setEditingId(null);
                    setNewUser({
                        name: "",
                        phone: "",
                        email: "",
                        password: "",
                        role: "user",
                        isActive: true
                    });
                    setImage(false);
                    setCurrentImage("");
                    setShowAddForm(false);
                    fetchUsers();
                } else {
                    toast.error(response.data.message || "Không thể cập nhật người dùng");
                }
            } else {
                // Add new user
                const response = await axios.post(`${url}/api/user/register`, {
                    name: values.name,
                    email: values.email,
                    password: values.password,
                    phone: values.phone,
                    role: values.role,
                    isActive: values.isActive
                }, {
                    headers: { token }
                });

                if (response.data.success) {
                    toast.success("Thêm người dùng thành công!");
                    setNewUser({
                        name: "",
                        phone: "",
                        email: "",
                        password: "",
                        role: "user",
                        isActive: true
                    });
                    setImage(false);
                    setShowAddForm(false);
                    fetchUsers();
                } else {
                    toast.error(response.data.message || "Không thể thêm người dùng");
                }
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Lỗi khi xử lý yêu cầu");
        } finally {
            setSubmitting(false);
        }
    };

    const editUser = (user) => {
        setIsEditing(true);
        setEditingId(user._id);
        setValue('name', user.name);
        setValue('phone', user.phone || '');
        setValue('email', user.email);
        setValue('password', '');
        setValue('role', user.isAdmin ? "admin" : "user");
        setValue('isActive', true);
        setImage(false);
        setCurrentImage(user.image || "");
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditingId(null);
        resetForm();
        setImage(false);
        setCurrentImage("");
        setShowAddForm(false);
    };

    const handleDeleteUser = async (id) => {
        try {
            const token = getCookie("adminToken");
            const response = await axios.post(`${url}/api/user/delete`,
                { id },
                { headers: { token } }
            );
            if (response.data.success) {
                toast.success("Xóa người dùng thành công");
                fetchUsers(); // Reload danh sách
            } else {
                toast.error(response.data.message || "Không thể xóa người dùng");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Lỗi khi xóa người dùng");
        }
    };

    const handleToggleUserStatus = async (user) => {
        const action = user.isActive ? "khóa" : "mở khóa";
        const confirmMessage = `Bạn có chắc muốn ${action} tài khoản "${user.name}"?`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            const token = getCookie("adminToken");
            const response = await axios.post(`${url}/api/user/toggle-status`,
                {
                    userId: user._id,
                    isActive: !user.isActive
                },
                { headers: { token } }
            );

            if (response.data.success) {
                toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} tài khoản thành công`);
                fetchUsers();
            } else {
                toast.error(response.data.message || `Không thể ${action} tài khoản`);
            }
        } catch (error) {
            console.error("Error toggling user status:", error);
            toast.error(`Lỗi khi ${action} tài khoản`);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setValue(name, value);
    };

    return (
        <div className="user-page">
            <LoadingOverlay show={submitting} text="Đang xử lý yêu cầu..." />
            <div className="user-header">
                <div>
                    <h2>Quản Lý Người Dùng</h2>
                </div>
                <div className="header-actions">
                    <div className="user-count">
                        <span>Tổng số: <strong>{users.length}</strong> người dùng</span>
                    </div>
                    <button className="add-user-btn" onClick={() => {
                        if (showAddForm) {
                            cancelEdit();
                        } else {
                            setShowAddForm(true);
                        }
                    }}>
                        {showAddForm ? "Hủy" : "Thêm Người Dùng"}
                    </button>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="toolbar">
                <div className="toolbar-left">
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <div className="filter-group">
                        <select
                            className="filter-dropdown"
                            value={filterRole}
                            onChange={(e) => {
                                setFilterRole(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="all">▼ Bộ lọc</option>
                            <option value="user">Người dùng</option>
                            <option value="admin">Quản trị viên</option>
                        </select>
                        <button className="toolbar-btn" onClick={fetchUsers} title="Làm mới">
                            🔄
                        </button>
                    </div>
                </div>
                <div className="toolbar-right">
                    <div className="pagination-info">
                        {filteredUsers.length > 0 ? `${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filteredUsers.length)} / ${filteredUsers.length}` : '0 / 0'}
                    </div>
                    <button
                        className="toolbar-btn"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        ◀
                    </button>
                    <button
                        className="toolbar-btn"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        ▶
                    </button>
                </div>
            </div>

            {showAddForm && (
                <div className="add-user-form">
                    <h3>{isEditing ? "Chỉnh Sửa Người Dùng" : "Thêm Người Dùng Mới"}</h3>

                    <div className="form-grid">
                        <div className="form-col">
                            <FileUpload
                                label="Ảnh đại diện"
                                name="user-image"
                                value={image}
                                onChange={(e) => setImage(e.target.files[0])}
                                preview={
                                    image
                                        ? URL.createObjectURL(image)
                                        : (isEditing && currentImage)
                                            ? `${url}/images/${currentImage}`
                                            : "Chọn ảnh đại diện"
                                }
                                helperText="Chọn ảnh đại diện (tùy chọn)"
                            />
                        </div>
                        <div className="form-col">
                            <FormInput
                                label="Tên người dùng"
                                name="name"
                                value={values.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Nhập tên người dùng"
                                required
                                error={touched.name ? errors.name : ''}
                                helperText="Tên sẽ hiển thị trong hệ thống"
                            />
                        </div>
                        <div className="form-col">
                            <FormInput
                                label="Email"
                                name="email"
                                type="email"
                                value={values.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Nhập email"
                                required
                                error={touched.email ? errors.email : ''}
                                helperText="Email dùng để đăng nhập"
                            />
                        </div>
                        <div className="form-col">
                            <FormInput
                                label="Số điện thoại"
                                name="phone"
                                type="tel"
                                value={values.phone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Nhập số điện thoại"
                                error={touched.phone ? errors.phone : ''}
                                helperText="Để trống nếu không có"
                            />
                        </div>
                        <div className="form-col">
                            <FormInput
                                label="Mật khẩu"
                                name="password"
                                type="password"
                                value={values.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder={isEditing ? "Để trống nếu không đổi" : "Nhập mật khẩu"}
                                required={!isEditing}
                                error={touched.password ? errors.password : ''}
                                helperText={isEditing ? "Để trống nếu không muốn đổi mật khẩu" : "Tối thiểu 8 ký tự"}
                            />
                        </div>
                        <div className="form-col">
                            <FormSelect
                                label="Vai trò"
                                name="role"
                                value={values.role}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                options={[
                                    { value: 'user', label: 'Người dùng' },
                                    { value: 'admin', label: 'Quản trị viên' }
                                ]}
                                required
                                error={touched.role ? errors.role : ''}
                                helperText="Quản trị viên có toàn quyền truy cập"
                            />
                        </div>
                        <div className="form-col">
                            <FormSelect
                                label="Trạng thái"
                                name="isActive"
                                value={values.isActive.toString()}
                                onChange={(e) => setValue('isActive', e.target.value === 'true')}
                                options={[
                                    { value: 'true', label: 'Hoạt động' },
                                    { value: 'false', label: 'Không hoạt động' }
                                ]}
                                helperText="Vô hiệu hóa tài khoản người dùng"
                            />
                        </div>
                    </div>

                    <FormActions
                        onSubmit={onSubmitHandler}
                        onCancel={cancelEdit}
                        submitText={isEditing ? "Cập Nhật Người Dùng" : "Thêm Người Dùng"}
                        cancelText="Hủy"
                        loading={submitting}
                    />
                </div>
            )}

            <div className="user-table">
                {loading ? (
                    <SkeletonTable rows={5} columns={7} />
                ) : (
                    <>
                        <div className="user-table-format title">
                            <b>Ảnh</b>
                            <b>Tên</b>
                            <b>Số điện thoại</b>
                            <b>Email</b>
                            <b>Vai trò</b>
                            <b>Trạng thái</b>
                            <b>Thao Tác</b>
                        </div>
                        {currentUsers.length > 0 ? (
                            currentUsers.map((user) => (
                                <div key={user._id} className="user-table-format">
                                    <div className="user-image">
                                        {user.image ? (
                                            <img src={`${url}${user.image}`} alt={user.name} />
                                        ) : (
                                            <div className="placeholder-img">?</div>
                                        )}
                                    </div>
                                    <p className="user-name">{user.name}</p>
                                    <p>{user.phone || "N/A"}</p>
                                    <p>{user.email}</p>
                                    <span className="role-badge">{user.isAdmin ? "admin" : "user"}</span>
                                    <span className={`status-badge ${user.isActive !== false ? 'active' : 'inactive'}`}>
                                        {user.isActive !== false ? 'Hoạt động' : 'Đã khóa'}
                                    </span>
                                    <div className="action-buttons">
                                        <button
                                            className={`lock-btn ${user.isActive !== false ? 'lock' : 'unlock'}`}
                                            onClick={() => handleToggleUserStatus(user)}
                                            title={user.isActive !== false ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                        >
                                            {user.isActive !== false ? '🔒' : '🔓'}
                                        </button>
                                        <button className="edit-btn" onClick={() => editUser(user)}>
                                            Sửa
                                        </button>
                                        <button className="delete-btn" onClick={() => handleDeleteUser(user._id)}>
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p>Chưa có người dùng nào</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Pagination */}
            {
                totalPages > 1 && (
                    <div className="pagination">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="pagination-btn"
                        >
                            Trước
                        </button>

                        <div className="pagination-numbers">
                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => paginate(index + 1)}
                                    className={`pagination-number ${currentPage === index + 1 ? 'active' : ''}`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="pagination-btn"
                        >
                            Tiếp
                        </button>
                    </div>
                )
            }
        </div >
    );
};

export default User;
