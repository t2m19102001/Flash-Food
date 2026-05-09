import React, { useState } from "react";
import "./Login.scss";
import axios from "axios";
import { toast } from "react-toastify";

const Login = ({ setIsLoggedIn, url }) => {
    const [data, setData] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setData(data => ({ ...data, [name]: value }));
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        
        try {
            // 🔥 GỌI API ADMIN RIÊNG (sẽ set cookie HttpOnly từ backend)
            const response = await axios.post(`${url}/api/admin/login`, data, {
                withCredentials: true
            });
            
            if (response.data.success) {
                // Token được lưu trong cookie HttpOnly bởi backend
                // Không cần setCookie ở frontend nữa
                setIsLoggedIn(true);
                toast.success("🎉 Đăng nhập thành công!");
            } else {
                toast.error(response.data.message || "Đăng nhập thất bại!");
            }
        } catch (error) {
            console.error("Login error:", error);
            const errorMsg = error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login">
            <div className="login-container">
                <div className="login-box">
                    <div className="login-header">
                        <div className="logo">
                            <span className="logo-icon">🍔</span>
                            <h1>Flash Food</h1>
                        </div>
                        <p className="subtitle">Admin Dashboard</p>
                        <p className="desc">Đăng nhập để quản lý hệ thống</p>
                    </div>

                    <form onSubmit={onSubmit}>
                        <div className="form-group">
                            <label>📧 Email</label>
                            <input
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={onChangeHandler}
                                placeholder="admin@flashfood.com"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>🔒 Mật khẩu</label>
                            <input
                                type="password"
                                name="password"
                                value={data.password}
                                onChange={onChangeHandler}
                                placeholder="••••••••"
                                required
                                disabled={loading}
                            />
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Đang xử lý...
                                </>
                            ) : (
                                "Đăng nhập"
                            )}
                        </button>
                    </form>

                    <div className="back-to-home">
                        <a href="http://localhost:5173">
                            ← Quay lại trang người dùng
                        </a>
                    </div>

                    <div className="login-footer">
                        <p>© 2024 Flash Food - Admin Dashboard</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;