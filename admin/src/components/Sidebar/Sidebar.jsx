import React, { useState } from "react";
import "./Sidebar.scss";
import { assets } from "../../assets/assets";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <div className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-options">
          <NavLink to="/" className="sidebar-option" onClick={() => setIsMobileMenuOpen(false)}>
            <img src={assets.list_icon} alt="" />
            <p>Dashboard</p>
          </NavLink>
          <NavLink to="/user" className="sidebar-option" onClick={() => setIsMobileMenuOpen(false)}>
            <img src={assets.user_icons} alt="" />
            <p>User</p>
          </NavLink>
           <NavLink to="/product" className="sidebar-option" onClick={() => setIsMobileMenuOpen(false)}>
            <img src={assets.add_icon} alt="" />
            <p>Product</p>
          </NavLink>
          <NavLink to="/orders" className="sidebar-option" onClick={() => setIsMobileMenuOpen(false)}>
            <img src={assets.order_icon} alt="" />
            <p>Order</p>
          </NavLink>
          <NavLink to="/reviews" className="sidebar-option" onClick={() => setIsMobileMenuOpen(false)}>
            <img src={assets.rating_starts} alt="" />
            <p>Review</p>
          </NavLink>
        </div>
      </div>
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={toggleMobileMenu}></div>
      )}
    </>
  );
};

export { Sidebar };
