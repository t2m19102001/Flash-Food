import { useContext, useState, useRef, useEffect } from "react";
import "./Navbar.scss";
import { assets } from "../../assets/assets";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import NotificationBell from "../Notifications/NotificationBell";

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("Trang chủ");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isHoveringDropdown, setIsHoveringDropdown] = useState(false);

  const {
    getTotalCartItems,
    isAuthenticated,
    userName,
    userImage,
    url,
    logout,
    search,
    setSearch,
    food_list,
    getImageUrl,
    isAdmin,
    loading,
  } = useContext(StoreContext);

  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);
  const timeoutRef = useRef(null);

  // Debug log
  useEffect(() => {
    console.log("🔍 Navbar - isAuthenticated:", isAuthenticated);
    console.log("🔍 Navbar - userName:", userName);
    console.log("🔍 Navbar - userImage:", userImage);
    console.log("🔍 Navbar - isAdmin:", isAdmin);
  }, [isAuthenticated, userName, userImage, isAdmin]);

  // Xử lý hover cho dropdown
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowDropdown(true);
    setIsHoveringDropdown(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
      setIsHoveringDropdown(false);
    }, 200);
  };

  const handleDropdownMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowDropdown(true);
    setIsHoveringDropdown(true);
  };

  const handleDropdownMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
      setIsHoveringDropdown(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (
      value.trim() !== "" &&
      location.pathname !== "/" &&
      !location.pathname.includes("/product")
    ) {
      navigate("/");
    }
  };

  const suggestions = search.trim()
    ? food_list
        .filter((item) =>
          item.name.toLowerCase().includes(search.toLowerCase()),
        )
        .slice(0, 5)
    : [];

  const handleSuggestionClick = (item) => {
    setSearch("");
    setShowSearch(false);
    navigate(`/product/${item._id}`);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target) &&
        !isHoveringDropdown
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isHoveringDropdown]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        if (!search) setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [search]);

  const getAvatarLetter = () => {
    if (userName && userName.length > 0) {
      return userName.charAt(0).toUpperCase();
    }
    return "U";
  };

  const hasValidImage = () => {
    return (
      userImage &&
      userImage !== "" &&
      userImage !== "undefined" &&
      userImage !== "null"
    );
  };

  useEffect(() => {
    const path = location.pathname;
    if (path === "/") {
      setMenu("Trang chủ");
    } else if (path === "/about") {
      setMenu("Giới thiệu");
    } else if (path === "/contact") {
      setMenu("Liên hệ");
    }
  }, [location]);

  // 🔥 HÀM XỬ LÝ CLICK "THỰC ĐƠN" - HOẠT ĐỘNG TRÊN MỌI TRANG
  const handleMenuClick = () => {
    setMenu("Thực đơn");
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const menuSection = document.getElementById("expl-menu");
        if (menuSection) {
          menuSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    } else {
      const menuSection = document.getElementById("expl-menu");
      if (menuSection) {
        menuSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  if (loading) {
    return (
      <div className="navbar">
        <Link to="/">
          <img src={assets.logo} alt="Flash Food" className="logo" />
        </Link>
        <div className="navbar-loading">
          <div className="spinner-small"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="navbar">
      <Link to="/" onClick={() => setMenu("Trang chủ")}>
        <img src={assets.logo} alt="Flash Food" className="logo" />
      </Link>

      <ul className="navbar-menu">
        <li
          onClick={() => setMenu("Trang chủ")}
          className={menu === "Trang chủ" ? "active" : ""}
        >
          <Link to="/">🏠 Trang chủ</Link>
        </li>
        
        {/* 🔥 THỰC ĐƠN - ĐÃ SỬA */}
        <li
          onClick={handleMenuClick}
          className={menu === "Thực đơn" ? "active" : ""}
        >
          🍽️ Thực đơn
        </li>
        
        <li
          onClick={() => setMenu("Giới thiệu")}
          className={menu === "Giới thiệu" ? "active" : ""}
        >
          <Link to="/about">📖 Giới thiệu</Link>
        </li>
        <li
          onClick={() => setMenu("Liên hệ")}
          className={menu === "Liên hệ" ? "active" : ""}
        >
          <Link to="/contact">📞 Liên hệ</Link>
        </li>
        <li
          onClick={() => setMenu("Mobile app")}
          className={menu === "Mobile app" ? "active" : ""}
        >
          <Link to="/app-download" className="app-download-link">
            📱 Tải ứng dụng
          </Link>
        </li>
      </ul>

      <div className="navbar-right">
        <div className="navbar-search-wrapper" ref={searchRef}>
          <div
            className={`navbar-search-container ${showSearch || search ? "active" : ""}`}
          >
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
                if (search) {
                  setSearch("");
                } else {
                  setShowSearch(!showSearch);
                }
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

        <div className="navbar-search-icon">
          <Link to="/cart">
            <img src={assets.basket_icon} alt="Cart" />
          </Link>
          {getTotalCartItems() > 0 && (
            <div className="nav-cart-badge">{getTotalCartItems()}</div>
          )}
        </div>

        {/* 🔔 NOTIFICATION BELL - CHỈ HIỂN THỊ KHI ĐÃ ĐĂNG NHẬP */}
        {isAuthenticated && <NotificationBell />}

        {!isAuthenticated ? (
          <button className="nav-login-btn" onClick={() => setShowLogin(true)}>
            🔑 Đăng nhập
          </button>
        ) : (
          <div
            className="navbar-profile"
            ref={avatarRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="navbar-user-display">
              {hasValidImage() ? (
                <img
                  src={getImageUrl(userImage)}
                  alt="Profile"
                  className="nav-profile-img"
                  onError={(e) => {
                    console.error("❌ Ảnh lỗi:", userImage);
                    e.target.onerror = null;
                    e.target.style.display = "none";
                    const parent = e.target.parentElement;
                    if (
                      parent &&
                      !parent.querySelector(".nav-profile-avatar")
                    ) {
                      const avatarDiv = document.createElement("div");
                      avatarDiv.className = "nav-profile-avatar";
                      avatarDiv.textContent = getAvatarLetter();
                      parent.insertBefore(avatarDiv, e.target);
                    }
                  }}
                />
              ) : (
                <div className="nav-profile-avatar">{getAvatarLetter()}</div>
              )}
              <p>{isAdmin ? "Admin" : userName || "User"}</p>
              <svg
                className="dropdown-arrow"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {(showDropdown || isHoveringDropdown) && (
              <ul
                className="navbar-dropdown"
                ref={dropdownRef}
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={handleDropdownMouseLeave}
              >
                <li
                  onClick={() => {
                    navigate("/profile");
                    setShowDropdown(false);
                    setIsHoveringDropdown(false);
                  }}
                >
                  <img src={assets.profile_icon} alt="" />
                  <p>👤 Hồ sơ của tôi</p>
                </li>
                <li
                  onClick={() => {
                    navigate("/myorders");
                    setShowDropdown(false);
                    setIsHoveringDropdown(false);
                  }}
                >
                  <img src={assets.bag_icon} alt="" />
                  <p>📦 Đơn hàng của tôi</p>
                </li>
                {isAdmin && (
                  <li
                    onClick={() =>
                      window.location.assign("http://localhost:5175")
                    }
                  >
                    <img src={assets.parcel_icon} alt="" />
                    <p>⚙️ Quản trị hệ thống</p>
                  </li>
                )}
                <hr />
                <li
                  className="logout-item"
                  onClick={() => {
                    localStorage.removeItem("userName");
                    localStorage.removeItem("userImage");
                    sessionStorage.clear();
                    logout();
                    navigate("/");
                    setShowDropdown(false);
                    setIsHoveringDropdown(false);
                  }}
                >
                  <img src={assets.logout_icon} alt="" />
                  <p>🚪 Đăng xuất</p>
                </li>
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;