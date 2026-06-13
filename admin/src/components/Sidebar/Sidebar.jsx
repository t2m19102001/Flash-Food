import React, { useState } from "react";
import "./Sidebar.scss";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Menu items - ĐƠN GIẢN, KHÔNG BỊ LỖI
  const menuItems = [
    { path: "/", icon: "📊", label: "Dashboard", group: "MAIN" },
    { path: "/user", icon: "👥", label: "User", group: "MAIN" },
    { path: "/product", icon: "🍽️", label: "Product", group: "MAIN" },
    { path: "/orders", icon: "📦", label: "Order", group: "MAIN" },
    { path: "/reviews", icon: "⭐", label: "Review", group: "MAIN" },
    { path: "/category", icon: "📂", label: "Category", group: "MARKETING" },
    { path: "/coupon", icon: "🎟️", label: "Coupon", group: "MARKETING" },
    { path: "/banner", icon: "🖼️", label: "Banner", group: "MARKETING" },
    { path: "/notification", icon: "🔔", label: "Notification", group: "SYSTEM" },
    { path: "/settings", icon: "⚙️", label: "Settings", group: "SYSTEM" },
    { path: "/report", icon: "📊", label: "Report", group: "SYSTEM" }
  ];

  // Nhóm menu
  const groups = ["MAIN", "MARKETING", "SYSTEM"];

  return (
    <>
      <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <div className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">🍔</div>
            <h2>Flash Food</h2>
          </div>
          <p>Admin Dashboard</p>
        </div>

        <div className="sidebar-nav">
          {groups.map(group => (
            <div key={group}>
              <div className="section-title">{group}</div>
              {menuItems
                .filter(item => item.group === group)
                .map((item, idx) => (
                  <NavLink
                    key={idx}
                    to={item.path}
                    className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="item-icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <div className="user-name">Admin</div>
              <div className="user-role">Quản trị viên</div>
            </div>
          </div>
        </div>
      </div>
      
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={toggleMobileMenu}></div>
      )}
    </>
  );
};

export { Sidebar };