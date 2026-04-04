import React, { useState, useRef, useEffect } from 'react'
import './Navbar.scss'
import { assets } from "../../assets/assets";
import axios from 'axios';
import { toast } from 'react-toastify';
import { getCookie, removeCookie } from '../../utils/cookieHelper';
import { NotificationBell } from '../Notifications/Notifications';

const Navbar = ({ setIsLoggedIn, url }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      const token = getCookie("adminToken");
      const response = await axios.get(`${url}/api/user/profile`, {
        headers: { token }
      });
      if (response.data.success) {
        setUserProfile(response.data.user);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleOpenUserInfo = () => {
    fetchProfile();
    setShowUserInfo(true);
    setShowDropdown(false);
  };

  const handleOpenChangePassword = () => {
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowChangePassword(true);
    setShowDropdown(false);
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu mới không khớp!");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Mật khẩu phải có ít nhất 8 ký tự!");
      return;
    }

    try {
      const token = getCookie("adminToken");
      const response = await axios.post(`${url}/api/user/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { token }
      });

      if (response.data.success) {
        toast.success("Đổi mật khẩu thành công!");
        setShowChangePassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(response.data.message || "Không thể đổi mật khẩu");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Lỗi khi đổi mật khẩu");
    }
  };

  const handleLogout = () => {
    removeCookie("adminToken");
    setIsLoggedIn(false);
  };

  return (
    <div className='navbar'>
      <img className='logo' src={assets.logo} alt="Logo" />
      <div className='project-title'>
        <h1>Food Delivery</h1>
        <p>Hệ thống quản lý</p>
      </div>

      <div className='navbar-actions'>
        <NotificationBell />
        <div className='user-menu' ref={dropdownRef}>
          <img
            className='user_icons'
            src={assets.user_icons}
            alt="User Icon"
            onClick={() => setShowDropdown(!showDropdown)}
          />
          {showDropdown && (
            <div className='dropdown-menu'>
              <div className='dropdown-header'>
                <img src={assets.user_icons} alt="Admin" className='dropdown-avatar' />
                <div className='dropdown-info'>
                  <h4>Admin</h4>
                  <p>Quản lý tài khoản</p>
                </div>
              </div>
              <div className='dropdown-divider'></div>
              <div className='dropdown-items'>
                <button className='dropdown-item' onClick={handleOpenUserInfo}>
                  <span>Thông tin cá nhân</span>
                </button>
                <button className='dropdown-item' onClick={handleOpenChangePassword}>
                  <span>Đổi mật khẩu</span>
                </button>
              </div>
              <div className='dropdown-divider'></div>
              <button className='dropdown-item logout' onClick={handleLogout}>
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>

        {/* User Info Modal */}
        {showUserInfo && (
          <div className='modal-overlay' onClick={() => setShowUserInfo(false)}>
            <div className='modal-content' onClick={(e) => e.stopPropagation()}>
              <div className='modal-header'>
                <h3>Thông tin cá nhân</h3>
                <button className='close-btn' onClick={() => setShowUserInfo(false)}>×</button>
              </div>
              <div className='modal-body'>
                {userProfile ? (
                  <div className='info-grid'>
                    <div className='info-section'>
                      <h4>Thông tin cơ bản</h4>
                      <div className='info-field'>
                        <label>Họ và tên</label>
                        <p>{userProfile.name}</p>
                      </div>
                      <div className='info-field'>
                        <label>Email</label>
                        <p>{userProfile.email}</p>
                      </div>
                      <div className='info-field'>
                        <label>Số điện thoại</label>
                        <p>{userProfile.phone || "Chưa cập nhật"}</p>
                      </div>
                      <div className='info-field'>
                        <label>Vai trò</label>
                        <p className='role-badge'>{userProfile.isAdmin ? "Admin" : "User"}</p>
                      </div>
                      <div className='info-field'>
                        <label>Ngày tạo</label>
                        <p>{new Date(userProfile.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>Đang tải thông tin...</p>
                )}
              </div>
              <div className='modal-footer'>
                <button className='btn-close' onClick={() => setShowUserInfo(false)}>Đóng</button>
              </div>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showChangePassword && (
          <div className='modal-overlay' onClick={() => setShowChangePassword(false)}>
            <div className='modal-content' onClick={(e) => e.stopPropagation()}>
              <div className='modal-header'>
                <h3>Đổi mật khẩu</h3>
                <button className='close-btn' onClick={() => setShowChangePassword(false)}>×</button>
              </div>
              <div className='modal-body'>
                <form className='password-form' onSubmit={handleChangePassword}>
                  <div className='form-field'>
                    <label>Mật khẩu hiện tại *</label>
                    <input
                      type='password'
                      name='currentPassword'
                      placeholder='Nhập mật khẩu hiện tại'
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className='form-field'>
                    <label>Mật khẩu mới *</label>
                    <input
                      type='password'
                      name='newPassword'
                      placeholder='Nhập mật khẩu mới (tối thiểu 8 ký tự)'
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className='form-field'>
                    <label>Xác nhận mật khẩu mới *</label>
                    <input
                      type='password'
                      name='confirmPassword'
                      placeholder='Nhập lại mật khẩu mới'
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className='modal-footer'>
                    <button type='button' className='btn-close' onClick={() => setShowChangePassword(false)}>Hủy</button>
                    <button type='submit' className='btn-save'>Lưu thay đổi</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export { Navbar }
