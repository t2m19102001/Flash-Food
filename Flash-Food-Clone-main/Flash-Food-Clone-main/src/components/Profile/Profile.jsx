import React, { useContext, useState, useEffect } from 'react'
import './Profile.scss'
import { StoreContext } from '../../context/StoreContext'
import { assets } from '../../assets/assets'
import axios from 'axios'

const Profile = () => {
    const { token, setUserName, url } = useContext(StoreContext);
    const [isEditing, setIsEditing] = useState(false);
    const [image, setImage] = useState(false);

    const [userData, setUserData] = useState({
        name: "",
        email: "",
        phone: "",
        backupPhone: "",
        gender: "Nam",
        birthday: "",
        address: "",
        password: "" 
    });

    const [imagePreview, setImagePreview] = useState(assets.profile_icon);

    const fetchUserData = async () => {
        try {
            const response = await axios.get(url + "/api/user/profile", { headers: { token } });
            if (response.data.success) {
                const user = response.data.user;
                setUserData({
                    name: user.name || "",
                    email: user.email || "",
                    phone: user.phone || "",
                    backupPhone: user.secondaryPhone || "", 
                    gender: user.gender || "Nam",
                    birthday: user.dob || "",              
                    address: user.address || "",
                    password: "" 
                });
                
                setUserName(user.name);

                if (user.image) {
                    const fullImageUrl = url + "/images/" + user.image;
                    setImagePreview(fullImageUrl);
                    // Cập nhật lại localStorage để đồng bộ ảnh khi load trang
                    localStorage.setItem("userImage", fullImageUrl);
                }
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin user:", error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUserData();
        }
    }, [token]);

    const handleInputChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append('name', userData.name);
            formData.append('email', userData.email);
            formData.append('phone', userData.phone);
            formData.append('backupPhone', userData.backupPhone);
            formData.append('gender', userData.gender);
            formData.append('birthday', userData.birthday);
            formData.append('address', userData.address);
            
            if (userData.password) formData.append('password', userData.password);
            if (image) formData.append('image', image);

            const response = await axios.post(url + "/api/user/update", formData, { headers: { token } });

            if (response.data.success) {
                // 1. Cập nhật State trong Context để đổi tên trên Navbar ngay
                setUserName(userData.name); 
                
                // 2. Cập nhật LocalStorage cho Tên
                localStorage.setItem("name", userData.name); 

                // 3. Cập nhật LocalStorage cho Hình Ảnh
                // Kiểm tra nếu Backend trả về tên file ảnh mới (response.data.image)
                if (response.data.image) {
                    const newImageUrl = url + "/images/" + response.data.image;
                    localStorage.setItem("userImage", newImageUrl);
                }

                setIsEditing(false);
                alert("Cập nhật thông tin thành công!");
                
                setUserData(prev => ({...prev, password: ""}));
                fetchUserData(); 
            } else {
                alert("Lỗi: " + response.data.message);
            }
        } catch (error) {
            console.error("Lỗi khi update:", error);
            const errorMsg = error.response?.data?.message || "Không thể kết nối đến server!";
            alert("Lỗi: " + errorMsg);
        }
    };

    return (
        <div className='profile-page'>
            <div className="profile-container">
                <h2>Cài đặt tài khoản</h2>
                <div className="profile-details">
                    <div className="profile-image">
                        <div className="img-wrapper">
                            <img src={imagePreview} alt="Avatar" />
                        </div>
                        {isEditing && (
                            <label htmlFor="image-upload" className="change-img-label">
                                Đổi ảnh đại diện
                                <input type="file" id="image-upload" hidden onChange={handleImageChange} accept="image/*" />
                            </label>
                        )}
                    </div>

                    <div className="profile-info">
                        <div className="info-grid">
                            <div className="info-group">
                                <label>Họ và tên</label>
                                {isEditing ? <input type="text" name="name" value={userData.name} onChange={handleInputChange} /> : <p>{userData.name || "Chưa cập nhật"}</p>}
                            </div>

                            <div className="info-group">
                                <label>Email</label>
                                {isEditing ? <input type="email" name="email" value={userData.email} onChange={handleInputChange} /> : <p>{userData.email || "Chưa cập nhật"}</p>}
                            </div>

                            <div className="info-group">
                                <label>Số điện thoại</label>
                                {isEditing ? <input type="text" name="phone" value={userData.phone} onChange={handleInputChange} /> : <p>{userData.phone || "Chưa cập nhật"}</p>}
                            </div>

                            <div className="info-group">
                                <label>SĐT dự phòng</label>
                                {isEditing ? <input type="text" name="backupPhone" value={userData.backupPhone} onChange={handleInputChange} /> : <p>{userData.backupPhone || "Chưa cập nhật"}</p>}
                            </div>

                            <div className="info-group">
                                <label>Giới tính</label>
                                {isEditing ? (
                                    <select name="gender" value={userData.gender} onChange={handleInputChange}>
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                ) : <p>{userData.gender}</p>}
                            </div>

                            <div className="info-group">
                                <label>Ngày sinh</label>
                                {isEditing ? <input type="date" name="birthday" value={userData.birthday} onChange={handleInputChange} /> : <p>{userData.birthday || "Chưa cập nhật"}</p>}
                            </div>

                            <div className="info-group full-width">
                                <label>Địa chỉ hiện tại</label>
                                {isEditing ? <input type="text" name="address" value={userData.address} onChange={handleInputChange} /> : <p>{userData.address || "Chưa cập nhật"}</p>}
                            </div>

                            {isEditing && (
                                <div className="info-group full-width">
                                    <label>Mật khẩu mới (để trống nếu không đổi)</label>
                                    <input type="password" name="password" placeholder="••••••••" value={userData.password} onChange={handleInputChange} />
                                </div>
                            )}
                        </div>

                        <div className="button-group">
                            {isEditing ? (
                                <>
                                    <button className="save-btn" onClick={handleSave}>Lưu thay đổi</button>
                                    <button className="cancel-btn" onClick={() => {
                                        setIsEditing(false);
                                        fetchUserData();
                                    }}>Quay lại xem thông tin</button>
                                </>
                            ) : (
                                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                                    Chỉnh sửa thông tin cá nhân
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