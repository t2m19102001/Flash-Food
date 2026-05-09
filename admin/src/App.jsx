import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar/Navbar";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { Routes, Route, Navigate } from "react-router-dom";
import Orders from "./pages/Orders/Orders";
import Dashboard from "./components/Dashboard/Dashboard";
import User from "./pages/User/User";
import Product from "./pages/Product/Product";
import Review from "./pages/Review/Review";
import Category from "./pages/Category/Category";
import Coupon from "./pages/Coupon/Coupon";
import Banner from "./pages/Banner/Banner";
import Notification from "./pages/Notification/Notification";
import Settings from "./pages/Settings/Settings";
import Report from "./pages/Report/Report";
import Login from "./components/Login/Login";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getCookie, removeCookie } from "./utils/cookieHelper";
import { NotificationProvider, useNotification, NotificationUI } from "./components/Notifications/Notifications";

// ========== PROTECTED ROUTE COMPONENT ==========
const ProtectedRoute = ({ children, isLoggedIn, redirectTo = "/login" }) => {
  if (!isLoggedIn) {
    return <Navigate to={redirectTo} replace />;
  }
  return children;
};

// App Content Component với notifications
const AppContent = ({ url, isLoggedIn }) => {
  const { success, error, warning, info } = useNotification();

  // Global error handler
  useEffect(() => {
    const handleError = (event) => {
      error('Lỗi Hệ Thống', event.message || 'Đã xảy ra lỗi không mong muốn');
    };

    const handleUnhandledRejection = (event) => {
      error('Lỗi Hệ Thống', event.reason || 'Đã xảy ra lỗi không mong muốn');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [error]);

  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Dashboard url={url} /></ProtectedRoute>} />
      <Route path="/user" element={<ProtectedRoute isLoggedIn={isLoggedIn}><User url={url} /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Orders url={url} /></ProtectedRoute>} />
      <Route path="/product" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Product url={url} /></ProtectedRoute>} />
      <Route path="/reviews" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Review url={url} /></ProtectedRoute>} />
      <Route path="/category" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Category url={url} /></ProtectedRoute>} />
      <Route path="/coupon" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Coupon url={url} /></ProtectedRoute>} />
      <Route path="/banner" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Banner url={url} /></ProtectedRoute>} />
      <Route path="/notification" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Notification url={url} /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Settings url={url} /></ProtectedRoute>} />
      <Route path="/report" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Report url={url} /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Hàm kiểm tra token hợp lệ
const hasLocalToken = () => {
  const localToken = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const cookieToken = getCookie("adminToken");
  const sessionToken = sessionStorage.getItem("adminToken");
  return !!((localToken && isAdmin) || cookieToken || sessionToken);
};

// Hàm xóa toàn bộ token
const clearAllTokens = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("isAdmin");
  localStorage.removeItem("adminInfo");
  removeCookie("adminToken");
  sessionStorage.removeItem("adminToken");
  console.log("🗑️ Đã xóa toàn bộ token");
};

const App = () => {
  const url = import.meta.env.VITE_API_URL || "";
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Kiểm tra xác thực khi khởi động
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      console.log("🔍 Đang kiểm tra xác thực admin...");
      
      const hasLocal = hasLocalToken();
      console.log("🔍 Có token cục bộ?", hasLocal);
      
      if (!hasLocal) {
        console.log("🔓 Không có token cục bộ, chuyển sang login");
        setIsLoggedIn(false);
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("🟢 Gọi API check-auth admin:", `${url}/api/admin/check-auth`);
        
        const response = await fetch(`${url}/api/admin/check-auth`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        console.log("📥 Response status:", response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log("📥 Response data:", data);
          
          if (data.success && data.admin) {
            console.log("✅ Xác thực admin thành công:", data.admin.name);
            setIsLoggedIn(true);
          } else {
            console.log("❌ Không có quyền admin, xóa token");
            clearAllTokens();
            setIsLoggedIn(false);
          }
        } else {
          console.log("❌ Response không OK, xóa token");
          clearAllTokens();
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("❌ Lỗi check auth:", error);
        clearAllTokens();
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [url]);

  // Loading state
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: '#ff6b4a' }}>
        <div className="spinner"></div>
        <span style={{ marginLeft: '12px' }}>Đang tải...</span>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <ToastContainer />
        <Login setIsLoggedIn={setIsLoggedIn} url={url} />
      </>
    );
  }

  return (
    <NotificationProvider>
      <div>
        <ToastContainer />
        <Navbar setIsLoggedIn={setIsLoggedIn} url={url} />
        <hr />
        <div className="app-content">
          <Sidebar />
          <div className="main-content">
            <AppContent url={url} isLoggedIn={isLoggedIn} />
          </div>
        </div>
        <NotificationUI />
      </div>
    </NotificationProvider>
  );
};

export default App;