import { useState, useContext } from 'react'
import './Login.scss'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'

const Login = ({ setShowLogin }) => {

    const { url, setToken, setUserName } = useContext(StoreContext)

    const [currState, setCurrState] = useState("Login")
    const [data, setData] = useState({
        name: "",
        email: "",
        password: ""
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({
            ...data,
            [name]: value
        }));
    }

    const onLogin = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            let endpoint = `${url}/api/user/login`;
            let body = { email: data.email, password: data.password };

            if (currState === "Register") {
                endpoint = `${url}/api/user/register`;
                body = { name: data.name, email: data.email, password: data.password };
            }

            const response = await axios.post(endpoint, body);

            if (response.data.success) {
                // Nếu là admin → redirect sang admin panel
                if (response.data.isAdmin) {
                    const adminUrl = import.meta.env.VITE_ADMIN_URL || "http://localhost:5175";
                    // Lưu token vào cookie để admin panel đọc được
                    document.cookie = `adminToken=${response.data.token};path=/;max-age=86400`;
                    window.location.href = adminUrl;
                    return;
                }

                // User thường → lưu token và đóng popup
                setToken(response.data.token);
                setUserName(response.data.name || data.name || data.email);
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("userName", response.data.name || data.name || data.email);
                setShowLogin(false);
            } else {
                setError(response.data.message || "Đăng nhập thất bại!");
            }
        } catch (err) {
            setError("Có lỗi xảy ra, vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='login'>
            <form onSubmit={onLogin} method="post" className="login-container">
                <div className="login-title">
                    <h2>{currState === "Login" ? "Đăng nhập" : "Đăng ký"}</h2>
                    <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
                </div>
                <div className="login-inputs">
                    {currState !== "Login" && (
                        <input type="text" name="name" placeholder="Tên của bạn" onChange={onChangeHandler} value={data.name} required />
                    )}
                    <input name="email" type="email" placeholder='Email của bạn' required onChange={onChangeHandler} value={data.email} />
                    <input name="password" type="password" placeholder='Password' required onChange={onChangeHandler} value={data.password} />
                </div>
                {error && <p className="login-error" style={{ color: "red", fontSize: "14px" }}>{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? "Đang xử lý..." : (currState === "Register" ? "Tạo tài khoản" : "Đăng nhập")}
                </button>
                <div className="login-condition">
                    <input type="checkbox" required />
                    <p>Tôi đồng ý với thỏa thuận người dùng.</p>
                </div>
                {
                    currState === "Login"
                        ? <p>Tạo tài khoản mới <span onClick={() => setCurrState("Register")}>Nhấp vào đây</span></p>
                        : <p>Bạn đã có tài khoản ? <span onClick={() => setCurrState("Login")}>Đăng nhập ngay</span></p>
                }
            </form>
        </div>
    )
}

export default Login
