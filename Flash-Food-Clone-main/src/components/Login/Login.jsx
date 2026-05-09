import { useState, useContext } from 'react'
import './Login.scss'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Login = ({ setShowLogin }) => {

    const { url, login, isAuthenticated } = useContext(StoreContext)
    const navigate = useNavigate();

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
        setError(""); // Xóa lỗi khi user bắt đầu nhập lại
    }

    const onLogin = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            let result;
            
            if (currState === "Register") {
                // Đăng ký
                const response = await axios.post(`${url}/api/user/register`, {
                    name: data.name,
                    email: data.email,
                    password: data.password
                }, {
                    withCredentials: true
                });
                result = response.data;
                
                if (result.success) {
                    // Đăng ký thành công, tự động đăng nhập
                    const loginResult = await login(data.email, data.password);
                    if (loginResult.success) {
                        setShowLogin(false);
                        navigate("/myorders");
                    } else {
                        setError(loginResult.message || "Đăng ký thành công, vui lòng đăng nhập");
                        setCurrState("Login");
                    }
                } else {
                    setError(result.message || "Đăng ký thất bại!");
                }
            } else {
                // Đăng nhập
                result = await login(data.email, data.password);
                
                if (result.success) {
                    setShowLogin(false);
                    navigate("/myorders");
                } else {
                    setError(result.message || "Email hoặc mật khẩu không đúng!");
                }
            }
        } catch (err) {
            console.error("Lỗi kết nối:", err);
            setError(err.response?.data?.message || "Lỗi kết nối đến máy chủ. Vui lòng thử lại sau!");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='login-overlay'>
            <div className='login'>
                <form onSubmit={onLogin} className="login-container">
                    <div className="login-title">
                        <h2>{currState === "Login" ? "🔐 Đăng nhập" : "📝 Đăng ký"}</h2>
                        <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="close" />
                    </div>
                    
                    <div className="login-inputs">
                        {currState === "Register" && (
                            <div className="input-group">
                                <span className="input-icon">👤</span>
                                <input 
                                    type="text" 
                                    name="name" 
                                    placeholder="Họ và tên" 
                                    onChange={onChangeHandler} 
                                    value={data.name} 
                                    required 
                                />
                            </div>
                        )}
                        <div className="input-group">
                            <span className="input-icon">📧</span>
                            <input 
                                name="email" 
                                type="email" 
                                placeholder='Email' 
                                required 
                                onChange={onChangeHandler} 
                                value={data.email} 
                            />
                        </div>
                        <div className="input-group">
                            <span className="input-icon">🔒</span>
                            <input 
                                name="password" 
                                type="password" 
                                placeholder='Mật khẩu' 
                                required 
                                onChange={onChangeHandler} 
                                value={data.password} 
                            />
                        </div>
                    </div>
                    
                    {error && <p className="login-error">{error}</p>}
                    
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Đang xử lý...
                            </>
                        ) : (
                            currState === "Register" ? "📝 Tạo tài khoản" : "🔐 Đăng nhập"
                        )}
                    </button>

                    <div className="login-condition">
                        <input type="checkbox" required />
                        <p>Tôi đồng ý với <span>Điều khoản sử dụng</span> và <span>Chính sách bảo mật</span></p>
                    </div>
                    
                    <div className="login-switch">
                        {currState === "Login" ? (
                            <p>
                                Chưa có tài khoản? 
                                <span onClick={() => setCurrState("Register")}> Đăng ký ngay</span>
                            </p>
                        ) : (
                            <p>
                                Đã có tài khoản? 
                                <span onClick={() => setCurrState("Login")}> Đăng nhập ngay</span>
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login