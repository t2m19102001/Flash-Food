import { useContext, useState, useRef, useEffect } from "react";
import "./Navbar.scss";
import { assets } from "../../assets/assets";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("Trang chủ");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  
  // GỌI THÊM getTotalCartItems từ Context mà mình vừa sửa
  const { getTotalCartItems, token, userName, userImage, url, logout, search, setSearch, food_list, getImageUrl } =
    useContext(StoreContext);
    
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (value.trim() !== "" && location.pathname !== "/" && !location.pathname.includes("/product")) {
      navigate("/");
    }
  };

  const suggestions = search.trim() 
    ? food_list.filter(item => item.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5)
    : [];

  const handleSuggestionClick = (item) => {
    setSearch(""); 
    setShowSearch(false); 
    navigate(`/product/${item._id}`); 
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        if (!search) setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [search]);

  return (
    <div className="navbar">
      <Link to="/" onClick={() => setMenu("Trang chủ")}>
        <img src={assets.logo} alt="Flash Food" className="logo" />
      </Link>

      <ul className="navbar-menu">
        <li onClick={() => setMenu("Trang chủ")} className={menu === "Trang chủ" ? "active" : ""}>
          <Link to="/">Trang chủ</Link>
        </li>
        <li onClick={() => setMenu("Thực đơn")} className={menu === "Thực đơn" ? "active" : ""}>
          <a href="#expl-menu">Thực đơn</a>
        </li>
        <li onClick={() => setMenu("Liên hệ")} className={menu === "Liên hệ" ? "active" : ""}>
          <a href="#footer">Liên hệ</a>
        </li>
        <li onClick={() => setMenu("Mobile app")} className={menu === "Mobile app" ? "active" : ""}>
          <a href="#app-download">Tải ứng dụng</a>
        </li>
      </ul>

      <div className="navbar-right">
        {/* Phần Search của Lâm giữ nguyên */}
        <div className="navbar-search-wrapper" ref={searchRef}>
          <div className={`navbar-search-container ${showSearch || search ? "active" : ""}`}>
            <input 
              type="text" 
              placeholder="Tìm món ăn..." 
              value={search} 
              onChange={handleSearchChange}
              onFocus={() => setShowSearch(true)}
            />
            <img 
              src={assets.search_icon} 
              alt="Search" 
              className="logo__search" 
              onClick={() => {
                if (search) { setSearch(""); } else { setShowSearch(!showSearch); }
              }} 
            />
          </div>

          {search && suggestions.length > 0 && (
            <ul className="search-suggestions">
              {suggestions.map((item, index) => (
                <li key={index} onClick={() => handleSuggestionClick(item)}>
                  <img src={getImageUrl(item.image)} alt={item.name} />
                  <span>{item.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* --- PHẦN GIỎ HÀNG: CẬP NHẬT ĐỂ HIỆN SỐ LƯỢNG --- */}
        <div className="navbar-search-icon">
          <Link to="/cart">
            <img src={assets.basket_icon} alt="Cart" />
          </Link>
          {/* Nếu tổng số lượng > 0 thì mới hiện cái Badge đỏ */}
          {getTotalCartItems() > 0 && (
            <div className="nav-cart-badge">{getTotalCartItems()}</div>
          )}
        </div>

        {!token ? (
          <button className="nav-login-btn" onClick={() => setShowLogin(true)}>Đăng nhập</button>
        ) : (
          <div className="navbar-profile" onMouseEnter={() => setShowDropdown(true)} onMouseLeave={() => setShowDropdown(false)}>
            <div className="navbar-user-display">
              <img src={getImageUrl(userImage)} alt="Profile" className="nav-profile-img" />
              <p>{isAdmin ? "Admin" : (userName || "User")}</p>
            </div>
            {showDropdown && (
              <ul className="navbar-dropdown">
                <li onClick={() => { navigate("/profile"); setShowDropdown(false); }}>
                    <img src={assets.profile_icon} alt="" /><p>Hồ sơ</p>
                </li>
                <hr />
                {isAdmin && (
                  <li onClick={() => window.location.assign("http://localhost:5175")} className="admin-item">
                    <img src={assets.parcel_icon} alt="" /><p>Quản trị</p>
                  </li>
                )}
                <li onClick={() => { navigate("/myorders"); setShowDropdown(false); }}>
                    <img src={assets.bag_icon} alt="" /><p>Đơn hàng</p>
                </li>
                <hr />
                <li onClick={() => { logout(); navigate("/"); setShowDropdown(false); }}><img src={assets.logout_icon} alt="" /><p>Đăng xuất</p></li>
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;