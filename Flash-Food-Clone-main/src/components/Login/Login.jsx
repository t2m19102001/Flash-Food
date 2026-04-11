import { useState, useContext } from 'react'
import './Login.scss'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom' // THÊM useNavigate để chuyển trang mượt

const Login = ({ setShowLogin }) => {

    const { url, setToken, setUserName } = useContext(StoreContext)
    const navigate = useNavigate(); // Khởi tạo navigate

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
            
            console.log("Phản hồi từ Server:", response.data);

            if (response.data.success) {
                const { token, name, isAdmin } = response.data;

                // 1. Lưu thông tin vào LocalStorage
                setToken(token);
                setUserName(name);
                localStorage.setItem("token", token);
                localStorage.setItem("userName", name);
                localStorage.setItem("isAdmin", String(isAdmin)); 

                // 2. LOGIC MỚI: Dù là Admin hay User đều vào trang cá nhân
                setShowLogin(false); // Đóng popup login

                // Điều hướng về trang thông tin cá nhân (ví dụ là /myorders hoặc /profile)
                // Lâm hãy thay "/myorders" bằng route trang cá nhân của Lâm nhé
                navigate("/myorders"); 
                
                // Nếu Lâm muốn thông báo nhẹ một cái
                console.log(isAdmin ? "Admin đã đăng nhập và vào trang cá nhân" : "User đã vào trang cá nhân");

            } else {
                setError(response.data.message || "Email hoặc mật khẩu không đúng!");
            }
        } catch (err) {
            console.error("Lỗi kết nối:", err);
            setError("Lỗi kết nối Server.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='login'>
            <form onSubmit={onLogin} className="login-container">
                <div className="login-title">
                    <h2>{currState === "Login" ? "Đăng nhập" : "Đăng ký"}</h2>
                    <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="close" />
                </div>
                <div className="login-inputs">
                    {currState === "Register" && (
                        <input type="text" name="name" placeholder="Tên của bạn" onChange={onChangeHandler} value={data.name} required />
                    )}
                    <input name="email" type="email" placeholder='Email của bạn' required onChange={onChangeHandler} value={data.email} />
                    <input name="password" type="password" placeholder='Mật khẩu' required onChange={onChangeHandler} value={data.password} />
                </div>
                
                {error && <p className="login-error" style={{ color: "red", fontSize: "13px", marginTop: "5px" }}>{error}</p>}
                
                <button type="submit" disabled={loading}>
                    {loading ? "Đang xử lý..." : (currState === "Register" ? "Tạo tài khoản" : "Đăng nhập")}
                </button>

                <div className="login-condition">
                    <input type="checkbox" required />
                    <p>Tôi đồng ý với thỏa thuận người dùng.</p>
                </div>
                {
                    currState === "Login"
                        ? <p>Tạo tài khoản mới? <span onClick={() => setCurrState("Register")}>Nhấp vào đây</span></p>
                        : <p>Bạn đã có tài khoản? <span onClick={() => setCurrState("Login")}>Đăng nhập ngay</span></p>
                }
            </form>
        </div>
    )
}

export default Login