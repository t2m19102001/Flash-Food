import { useContext, useState } from "react";
import "../Navbar/Navbar.scss";
import { assets } from "../../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("Thực đơn");
  const [showDropdown, setShowDropdown] = useState(false);

  const { getTotalCartAmount, token, userName, logout } = useContext(StoreContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate("/");
  };

  return (
    <div className="navbar">
      <Link to="/">
        <img src={assets.logo} alt="" className="logo" />
      </Link>

      <ul className="navbar-menu">
        <Link
          to="/"
          onClick={() => setMenu("Trang chủ")}
          className={menu === "Trang chủ" ? "active" : ""}
        >
          Trang chủ
        </Link>
        <a
          href="#expl-menu"
          onClick={() => setMenu("Thực đơn")}
          className={menu === "Thực đơn" ? "active" : ""}
        >
          Thực đơn
        </a>
        <a
          href="#footer"
          onClick={() => setMenu("Liên hệ")}
          className={menu === "Liên hệ" ? "active" : ""}
        >
          Liên hệ
        </a>
        <a
          href="#app-download"
          onClick={() => setMenu("Mobile app")}
          className={menu === "Mobile app" ? "active" : ""}
        >
          Tải ứng dụng
        </a>
      </ul>
      <div className="navbar-right">
        <img src={assets.search_icon} alt="" className="logo__search" />
        <div className="navbar-search-icon">
          <Link to="/cart">
            {" "}
            <img src={assets.basket_icon} alt="" />
          </Link>
          <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
        </div>
        {token ? (
          <div className="navbar-profile" onClick={() => setShowDropdown(!showDropdown)}>
            <span className="navbar-username">{userName || "User"}</span>
            {showDropdown && (
              <div className="navbar-dropdown">
                <Link to="/myorders" onClick={() => setShowDropdown(false)}>
                  <p>Đơn hàng</p>
                </Link>
                <hr />
                <p onClick={handleLogout}>Đăng xuất</p>
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => setShowLogin(true)}>Đăng nhập</button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
