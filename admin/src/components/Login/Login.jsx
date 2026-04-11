import React, { useState } from "react";
import "./Login.scss";
import axios from "axios";
import { toast } from "react-toastify";
import { setCookie } from "../../utils/cookieHelper";

const Login = ({ setIsLoggedIn, url }) => {
    const [data, setData] = useState({
        email: "",
        password: ""
    });

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setData(data => ({ ...data, [name]: value }));
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post(`${url}/api/user/login`, data);
            if (response.data.success) {
                if (response.data.isAdmin) {
                    setCookie("adminToken", response.data.token, 1);
                    setIsLoggedIn(true);
                    toast.success("Đăng nhập thành công!");
                } else {
                    toast.error("Bạn không có quyền admin!");
                }
            } else {
                toast.error(response.data.message || "Đăng nhập thất bại!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Có lỗi xảy ra, vui lòng thử lại!");
        }
    };

    return (
        <div className="admin-login">
            <div className="login-container">
                <div className="login-box">
                    <div className="login-header">
                        <h1>Food Delivery</h1>
                        <p>Đăng nhập để quản lý hệ thống</p>
                    </div>

                    <form onSubmit={onSubmit}>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={onChangeHandler}
                                placeholder="admin@flashfood.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Mật khẩu</label>
                            <input
                                type="password"
                                name="password"
                                value={data.password}
                                onChange={onChangeHandler}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button type="submit" className="login-btn">
                            Đăng nhập
                        </button>
                    </form>

                    {/* THÊM PHẦN QUAY LẠI TRANG NGƯỜI DÙNG Ở ĐÂY */}
                    <div className="back-to-home">
                        <a href="http://localhost:5173">← Quay lại trang người dùng</a>
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