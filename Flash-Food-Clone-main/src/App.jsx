import { Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import Order from "./pages/Order/Order";
import MyOrders from "./pages/MyOrders/MyOrders";
import Footer from "./components/Footer/Footer";
import Login from "./components/Login/Login";
import Profile from "./components/Profile/Profile";
import FoodDetail from "./components/Product/FoodDetail";
import OrderStatus from "./pages/OrderStatus/OrderStatus";

// 🟢 IMPORT CÁC TRANG MỚI
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import Careers from "./pages/Careers/Careers";
import Blog from "./pages/Blog/Blog";
import HelpCenter from "./pages/HelpCenter/HelpCenter";
import ShippingPolicy from "./pages/ShippingPolicy/ShippingPolicy";
import ReturnPolicy from "./pages/ReturnPolicy/ReturnPolicy";
import TermsOfUse from "./pages/TermsOfUse/TermsOfUse";
import Payment from './pages/Payment/Payment';
import OrderDetail from './pages/OrderDetail/OrderDetail';
import AppDownload from './pages/AppDownload/AppDownload';

import { useState } from "react";

// 🔥 COMPONENT TỰ ĐỘNG CUỘN LÊN ĐẦU TRANG
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <ScrollToTop />
      {showLogin && <Login setShowLogin={setShowLogin} />}

      <div className="app">
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<Order />} />
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/product/:foodId" element={<FoodDetail />} />
          <Route path="/order-status" element={<OrderStatus />} />

          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/return-policy" element={<ReturnPolicy />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path='/payment' element={<Payment />} />
          <Route path="/order/:orderId" element={<OrderDetail />} />
          <Route path="/app-download" element={<AppDownload />} />
        </Routes>
      </div>

      <Footer />
    </>
  );
};

export default App;   