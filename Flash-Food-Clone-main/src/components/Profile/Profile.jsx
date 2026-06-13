import React, { useContext, useState, useEffect } from 'react'
import './Profile.scss'
import { StoreContext } from '../../context/StoreContext'
import { assets } from '../../assets/assets'
import axios from 'axios'

const Profile = () => {
    const { setUserName, setUserImage, url, logout, isAuthenticated } = useContext(StoreContext);
    const [isEditing, setIsEditing] = useState(false);
    const [image, setImage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    const [userData, setUserData] = useState({
        name: "",
        email: "",
        phone: "",
        secondaryPhone: "",
        gender: "Nam",
        dob: "",
        address: "",
        password: "" 
    });

    const [imagePreview, setImagePreview] = useState(assets.profile_icon);

    const fetchUserData = async (showErrorAlert = false) => {
        if (!isAuthenticated) return;
        setFetchLoading(true);
        setError(null);
        
        try {
            const response = await axios.get(url + "/api/user/profile", { 
                withCredentials: true
            });
            
            if (response.data.success) {
                const user = response.data.user;
                
                setUserData({
                    name: user.name || "",
                    email: user.email || "",
                    phone: user.phone || "",
                    secondaryPhone: user.secondaryPhone || "",
                    gender: user.gender || "Nam",
                    dob: user.dob || "",
                    address: user.address || "",
                    password: "" 
                });
                
                if (user.name) setUserName(user.name);
                
                if (user.image) {
                    const fullImageUrl = user.image.startsWith('http') 
                        ? user.image 
                        : url + "/images/" + user.image;
                    setImagePreview(fullImageUrl);
                    setUserImage(fullImageUrl);
                } else {
                    setImagePreview(assets.profile_icon);
                }
            }
        } catch (error) {
            console.error("❌ Lỗi khi lấy thông tin user:", error);
            
            if (error.response?.status === 401) {
                if (showErrorAlert) {
                    alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
                }
                logout();
            } else {
                setError("Không thể tải thông tin người dùng");
                if (showErrorAlert) {
                    alert("Không thể tải thông tin người dùng. Vui lòng thử lại!");
                }
            }
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchUserData(false);
        } else {
            setFetchLoading(false);
        }
    }, [isAuthenticated]);

    const handleInputChange = (e) => {
        setUserData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (successMessage) setSuccessMessage("");
        if (error) setError(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        if (!isAuthenticated) {
            alert("Vui lòng đăng nhập lại!");
            return;
        }
        
        setLoading(true);
        setError(null);
        setSuccessMessage("");
        
        try {
            const formData = new FormData();
            formData.append('name', userData.name);
            formData.append('email', userData.email);
            formData.append('phone', userData.phone);
            formData.append('secondaryPhone', userData.secondaryPhone);
            formData.append('gender', userData.gender);
            formData.append('dob', userData.dob);
            formData.append('address', userData.address);
            
            if (userData.password) formData.append('password', userData.password);
            if (image) formData.append('image', image);

            const response = await axios.post(url + "/api/user/update", formData, { 
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                // Fetch lại toàn bộ profile để lấy dữ liệu mới nhất
                const profileResponse = await axios.get(url + "/api/user/profile", { 
                    withCredentials: true 
                });
                
                if (profileResponse.data.success) {
                    const user = profileResponse.data.user;
                    
                    // Cập nhật context (quan trọng cho Navbar)
                    setUserName(user.name);
                    if (user.image) {
                        const imageUrl = user.image.startsWith('http') 
                            ? user.image 
                            : url + "/images/" + user.image;
                        setUserImage(imageUrl);
                        setImagePreview(imageUrl);
                    } else {
                        setUserImage("");
                        setImagePreview(assets.profile_icon);
                    }
                    
                    // Cập nhật state local
                    setUserData({
                        name: user.name || "",
                        email: user.email || "",
                        phone: user.phone || "",
                        secondaryPhone: user.secondaryPhone || "",
                        gender: user.gender || "Nam",
                        dob: user.dob || "",
                        address: user.address || "",
                        password: "" 
                    });
                }
                
                setIsEditing(false);
                setImage(false);
                setSuccessMessage("✅ Cập nhật thông tin thành công!");
                
                setTimeout(() => {
                    setSuccessMessage("");
                }, 3000);
            } else {
                setError("❌ " + (response.data.message || "Cập nhật thất bại"));
            }
        } catch (error) {
            console.error("❌ Lỗi khi update:", error);
            
            if (error.code === 'ECONNABORTED') {
                setError("❌ Kết nối quá thời gian, vui lòng thử lại!");
            } else if (error.message === 'Network Error') {
                setError("❌ Không thể kết nối đến server. Vui lòng kiểm tra backend!");
            } else if (error.response?.status === 401) {
                setError("❌ Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
                setTimeout(() => logout(), 1500);
            } else {
                setError("❌ " + (error.response?.data?.message || error.message || "Lỗi không xác định"));
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Chưa cập nhật";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Chưa cập nhật";
            return date.toLocaleDateString('vi-VN');
        } catch {
            return "Chưa cập nhật";
        }
    };
    
    const displayValue = (value) => {
        if (!value || value === "" || value === "Unknown" || value === "Chúa cập nhật") {
            return "Chưa cập nhật";
        }
        return value;
    };

    if (fetchLoading) {
        return (
            <div className="profile-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='profile-page'>
            <div className="profile-container">
                <div className="profile-header">
                    <h2>👤 Cài đặt tài khoản</h2>
                    <p>Quản lý thông tin cá nhân của bạn</p>
                </div>
                
                {successMessage && (
                    <div className="success-message">
                        <span>✅</span> {successMessage}
                    </div>
                )}
                
                {error && (
                    <div className="error-message">
                        <span>⚠️</span> {error}
                    </div>
                )}
                
                <div className="profile-details">
                    <div className="profile-image">
                        <div className="img-wrapper">
                            <img src={imagePreview} alt="Avatar" />
                            {!isEditing && (
                                <div className="avatar-hover">
                                    <span>📷</span>
                                </div>
                            )}
                        </div>
                        {isEditing && (
                            <label htmlFor="image-upload" className="change-img-label">
                                📷 Đổi ảnh đại diện
                                <input 
                                    type="file" 
                                    id="image-upload" 
                                    hidden 
                                    onChange={handleImageChange} 
                                    accept="image/*" 
                                />
                            </label>
                        )}
                    </div>

                    <div className="profile-info">
                        <div className="info-grid">
                            <div className="info-group">
                                <label>👤 Họ và tên</label>
                                {isEditing ? 
                                    <input type="text" name="name" value={userData.name} onChange={handleInputChange} placeholder="Nhập họ tên" /> : 
                                    <p>{displayValue(userData.name)}</p>
                                }
                            </div>

                            <div className="info-group">
                                <label>📧 Email</label>
                                {isEditing ? 
                                    <input type="email" name="email" value={userData.email} onChange={handleInputChange} placeholder="Nhập email" /> : 
                                    <p>{displayValue(userData.email)}</p>
                                }
                            </div>

                            <div className="info-group">
                                <label>📞 Số điện thoại</label>
                                {isEditing ? 
                                    <input type="tel" name="phone" value={userData.phone} onChange={handleInputChange} placeholder="Nhập số điện thoại" /> : 
                                    <p>{displayValue(userData.phone)}</p>
                                }
                            </div>

                            <div className="info-group">
                                <label>📱 SĐT dự phòng</label>
                                {isEditing ? 
                                    <input type="tel" name="secondaryPhone" value={userData.secondaryPhone} onChange={handleInputChange} placeholder="Nhập SĐT dự phòng" /> : 
                                    <p>{displayValue(userData.secondaryPhone)}</p>
                                }
                            </div>

                            <div className="info-group">
                                <label>⚥ Giới tính</label>
                                {isEditing ? (
                                    <select name="gender" value={userData.gender} onChange={handleInputChange}>
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                ) : 
                                    <p>{displayValue(userData.gender)}</p>
                                }
                            </div>

                            <div className="info-group">
                                <label>🎂 Ngày sinh</label>
                                {isEditing ? 
                                    <input type="date" name="dob" value={userData.dob} onChange={handleInputChange} /> : 
                                    <p>{formatDate(userData.dob)}</p>
                                }
                            </div>

                            <div className="info-group full-width">
                                <label>📍 Địa chỉ hiện tại</label>
                                {isEditing ? 
                                    <input type="text" name="address" value={userData.address} onChange={handleInputChange} placeholder="Nhập địa chỉ" /> : 
                                    <p>{displayValue(userData.address)}</p>
                                }
                            </div>

                            {isEditing && (
                                <div className="info-group full-width">
                                    <label>🔒 Mật khẩu mới (để trống nếu không đổi)</label>
                                    <input 
                                        type="password" 
                                        name="password" 
                                        placeholder="••••••••" 
                                        value={userData.password} 
                                        onChange={handleInputChange} 
                                    />
                                </div>
                            )}
                        </div>

                        <div className="button-group">
                            {isEditing ? (
                                <>
                                    <button className="save-btn" onClick={handleSave} disabled={loading}>
                                        {loading ? <span className="spinner-small"></span> : "💾 Lưu thay đổi"}
                                    </button>
                                    <button 
                                        className="cancel-btn" 
                                        onClick={() => {
                                            setIsEditing(false);
                                            fetchUserData(false);
                                            setImage(false);
                                            setError(null);
                                            setSuccessMessage("");
                                        }}
                                        disabled={loading}
                                    >
                                        ❌ Quay lại xem thông tin
                                    </button>
                                </>
                            ) : (
                                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                                    ✏️ Chỉnh sửa thông tin cá nhân
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile