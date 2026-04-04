import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar/Navbar";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { Routes, Route } from "react-router-dom";
import Orders from "./pages/Orders/Orders";
import Dashboard from "./components/Dashboard/Dashboard";
import User from "./pages/User/User";
import Product from "./pages/Product/Product";
import Review from "./pages/Review/Review";
import Login from "./components/Login/Login";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getCookie } from "./utils/cookieHelper";
import { NotificationProvider, useNotification, NotificationUI } from "./components/Notifications/Notifications";

// App Content Component với notifications
const AppContent = ({ url }) => {
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
      <Route path="/" element={<Dashboard url={url} />} />
      <Route path="/user" element={<User url={url} />} />
      <Route path="/orders" element={<Orders url={url} />} />
      <Route path="/product" element={<Product url={url} />} />
      <Route path="/reviews" element={<Review url={url} />} />
    </Routes>
  );
};

const App = () => {
  const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Kiểm tra token khi load app
    const token = getCookie("adminToken");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

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
            <AppContent url={url} />
          </div>
        </div>
        <NotificationUI />
      </div>
    </NotificationProvider>
  );
};
export default App;
