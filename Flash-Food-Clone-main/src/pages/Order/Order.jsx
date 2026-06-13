import { useContext, useState, useEffect } from "react";
import "./Order.scss";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Import ảnh MoMo
import momoLogo from "../../assets/momo-logo.png";

const Order = () => {
  const {
    getTotalCartAmount,
    isAuthenticated,
    userName, 
    url,
    logout,
    food_list,
    cartItems,
    setCartItems,
    discount,
    setDiscount,
    setPromoCode,
  } = useContext(StoreContext);

  const navigate = useNavigate();

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    country: "Việt Nam",
    phone: "",
  });

  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);
  
  // State cho QR Modal
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("pending");

  // Lấy thông tin từ profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated) {
        setIsLoadingProfile(false);
        return;
      }

      setIsLoadingProfile(true);
      setProfileError(null);

      try {
        const response = await axios.get(url + "/api/user/profile", {
          withCredentials: true,
        });

        if (response.data.success) {
          const user = response.data.user;

          const fullName = user.name || userName || "";
          const spaceIndex = fullName.indexOf(" ");
          const firstName =
            spaceIndex === -1 ? fullName : fullName.substring(0, spaceIndex);
          const lastName =
            spaceIndex === -1 ? "" : fullName.substring(spaceIndex + 1);

          setData({
            firstName: firstName,
            lastName: lastName,
            email: user.email || "",
            phone: user.phone || "",
            address: user.address || "",
            city: user.city || "",
            state: user.state || "",
            country: user.country || "Việt Nam",
          });
        }
      } catch (error) {
        console.error("Lỗi lấy profile:", error);
        if (error.response?.status === 401) {
          setProfileError("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
          logout();
        } else {
          setProfileError("Không thể tải thông tin cá nhân");
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [isAuthenticated, url, userName, logout]);

  // Hàm kiểm tra trạng thái thanh toán
  const checkPaymentStatus = async () => {
    if (!pendingOrderId) return;
    
    try {
      const response = await axios.get(`${url}/api/payment/momo/status/${pendingOrderId}`, {
        withCredentials: true,
      });
      
      if (response.data.success) {
        setPaymentStatus(response.data.paymentStatus);
        
        if (response.data.paymentStatus === 'paid') {
          setShowQrModal(false);
          setCartItems({});
          setDiscount(0);
          setPromoCode("");
          alert("✅ Thanh toán thành công!");
          navigate("/myorders");
        }
      }
    } catch (error) {
      console.error("Kiểm tra trạng thái lỗi:", error);
    }
  };

  // Hàm xác nhận thanh toán thủ công (dùng khi MoMo không gọi IPN)
  const manualConfirmPayment = async () => {
    if (!pendingOrderId) {
      alert("Không tìm thấy mã đơn hàng!");
      return;
    }
    
    try {
      setLoading(true);
      console.log("🔄 Đang xác nhận thanh toán cho đơn hàng:", pendingOrderId);
      
      const response = await axios.post(`${url}/api/payment/momo/manual-update`, {
        orderId: pendingOrderId
      }, { withCredentials: true });
      
      console.log("📥 Response manual update:", response.data);
      
      if (response.data.success) {
        alert("✅ Xác nhận thanh toán thành công!");
        setShowQrModal(false);
        setCartItems({});
        setDiscount(0);
        setPromoCode("");
        navigate("/myorders");
      } else {
        alert(response.data.message || "Không thể xác nhận thanh toán!");
      }
    } catch (error) {
      console.error("❌ Lỗi xác nhận thanh toán:", error);
      alert("Có lỗi xảy ra: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Polling kiểm tra mỗi 3 giây khi mở QR Modal
  useEffect(() => {
    let interval;
    if (showQrModal && pendingOrderId) {
      interval = setInterval(checkPaymentStatus, 3000);
    }
    return () => clearInterval(interval);
  }, [showQrModal, pendingOrderId]);

  const onChangeHandler = (e) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const deliveryFee = getTotalCartAmount() === 0 ? 0 : 15000;

  const handleOrderSuccess = (orderId) => {
    setCartItems({});
    setDiscount(0);
    setPromoCode("");
    alert("✅ Đặt hàng thành công!");
    navigate("/myorders");
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (getTotalCartAmount() === 0) return alert("Giỏ hàng trống!");
    if (!isAuthenticated) return alert("Vui lòng đăng nhập để đặt hàng!");

    if (!data.firstName || !data.email || !data.phone || !data.address) {
      alert("Vui lòng cập nhật đầy đủ thông tin trong trang cá nhân!");
      return;
    }

    const orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        orderItems.push({
          foodId: item._id,
          name: item.name,
          price: item.price,
          quantity: cartItems[item._id],
          image: item.image,
        });
      }
    });

    const discountedAmount = Math.round(
      getTotalCartAmount() * (1 - discount / 100),
    );
    const finalAmount = discountedAmount + deliveryFee;

    const orderData = {
      items: orderItems,
      amount: finalAmount,
      address: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city || "",
        state: data.state || "",
        country: data.country || "Việt Nam",
        note: note,
      },
      paymentMethod,
    };

    setLoading(true);

    try {
      // ========== COD ==========
      if (paymentMethod === "cod") {
        const response = await axios.post(`${url}/api/order/place`, orderData, {
          withCredentials: true,
        });

        if (response.data.success) {
          handleOrderSuccess(response.data.orderId);
        } else {
          alert(response.data.message || "Đặt hàng thất bại!");
        }
      }

      // ========== MOMO ==========
      else if (paymentMethod === "momo") {
        console.log("===== BẮT ĐẦU THANH TOÁN MOMO =====");
        
        // Bước 1: Tạo đơn hàng
        const orderResponse = await axios.post(`${url}/api/order/place`, orderData, {
          withCredentials: true,
        });

        if (!orderResponse.data.success) {
          throw new Error(orderResponse.data.message || "Tạo đơn hàng thất bại");
        }

        const orderId = orderResponse.data.orderId || orderResponse.data.order?._id;
        
        if (!orderId) {
          throw new Error("Không lấy được orderId từ response");
        }

        console.log("✅ Đã tạo đơn hàng với ID:", orderId);

        // Bước 2: Tạo thanh toán MoMo
        const momoRequestBody = {
          orderId: orderId,
          amount: finalAmount,
          orderInfo: `Thanh toan don hang ${orderId}`
        };

        console.log("📤 Gửi request tạo MoMo:", momoRequestBody);

        const momoResponse = await axios.post(
          `${url}/api/payment/momo/create`,
          momoRequestBody,
          {
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' },
          }
        );

        console.log("📥 MoMo Response:", momoResponse.data);

        if (momoResponse.data.success) {
          setPendingOrderId(orderId);
          
          if (momoResponse.data.qrCodeUrl) {
            // Hiển thị QR Modal để quét
            setQrCodeUrl(momoResponse.data.qrCodeUrl);
            setShowQrModal(true);
            setPaymentStatus("pending");
          } else if (momoResponse.data.payUrl) {
            // Fallback: chuyển hướng sang trang MoMo
            window.location.href = momoResponse.data.payUrl;
          } else {
            alert("Không nhận được URL thanh toán từ MoMo");
          }
        } else {
          alert(momoResponse.data?.message || "Lỗi tạo thanh toán MoMo");
        }
      }
    } catch (error) {
      console.error("===== LỖI ORDER =====", error);
      
      if (error.response?.status === 401) {
        alert("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
        logout();
      } else if (error.response?.status === 404) {
        alert("API thanh toán MoMo không tìm thấy (404). Vui lòng kiểm tra backend!");
      } else {
        alert(
          error.response?.data?.message ||
            error.message ||
            "Đã xảy ra lỗi! Vui lòng thử lại.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="order-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="order-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Không thể tải thông tin</h3>
          <p>{profileError}</p>
          <button onClick={() => window.location.reload()}>Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-page">
      <form className="order-container" onSubmit={placeOrder}>
        {/* BÊN TRÁI: THÔNG TIN KHÁCH HÀNG */}
        <div className="order-left">
          <div className="order-card">
            <h2 className="card-title">📋 Thông tin giao hàng</h2>

            <div className="info-display">
              <div className="info-row">
                <span className="label">👤 Họ tên:</span>
                <span className="value">
                  {data.firstName} {data.lastName}
                </span>
              </div>
              <div className="info-row">
                <span className="label">📧 Email:</span>
                <span className="value">{data.email}</span>
              </div>
              <div className="info-row">
                <span className="label">📞 Số điện thoại:</span>
                <span className="value">{data.phone}</span>
              </div>
              <div className="info-row">
                <span className="label">📍 Địa chỉ:</span>
                <span className="value">{data.address || "Chưa cập nhật"}</span>
              </div>
            </div>

            <details className="edit-details">
              <summary>✏️ Sửa thông tin giao hàng (nếu cần)</summary>
              <div className="edit-form">
                <div className="multi-fields">
                  <input
                    name="firstName"
                    onChange={onChangeHandler}
                    value={data.firstName}
                    type="text"
                    placeholder="Họ"
                  />
                  <input
                    name="lastName"
                    onChange={onChangeHandler}
                    value={data.lastName}
                    type="text"
                    placeholder="Tên"
                  />
                </div>
                <input
                  name="email"
                  onChange={onChangeHandler}
                  value={data.email}
                  type="email"
                  placeholder="Email nhận thông báo"
                />
                <input
                  name="phone"
                  onChange={onChangeHandler}
                  value={data.phone}
                  type="tel"
                  placeholder="Số điện thoại liên hệ"
                />
                <input
                  name="address"
                  onChange={onChangeHandler}
                  value={data.address}
                  type="text"
                  placeholder="Địa chỉ chi tiết (Số nhà, tên đường)"
                />
                <div className="multi-fields">
                  <input
                    name="city"
                    onChange={onChangeHandler}
                    value={data.city}
                    type="text"
                    placeholder="Thành phố"
                  />
                  <input
                    name="state"
                    onChange={onChangeHandler}
                    value={data.state}
                    type="text"
                    placeholder="Quận / Huyện"
                  />
                </div>
              </div>
            </details>

            {/* Ô NHẬP GHI CHÚ */}
            <div className="info-group full-width" style={{ marginTop: "16px" }}>
              <label>📝 Ghi chú cho người bán (tùy chọn)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Giao giờ hành chính, thêm ớt, không có hành, gọi trước khi giao..."
                rows="3"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {!data.address && (
              <p className="warning-message">
                ⚠️ Bạn chưa cập nhật địa chỉ. Vui lòng cập nhật trong{" "}
                <a href="/profile">Trang cá nhân</a> hoặc sửa bên trên!
              </p>
            )}
          </div>

          <div className="order-card">
            <h2 className="card-title">💳 Phương thức thanh toán</h2>
            <div className="payment-options">
              {/* COD */}
              <div
                className={`payment-item ${paymentMethod === "cod" ? "active" : ""}`}
                onClick={() => setPaymentMethod("cod")}
              >
                <div className="radio-circle"></div>
                <span>💰 Thanh toán khi nhận hàng (COD)</span>
              </div>

              {/* MoMo */}
              <div
                className={`payment-item ${paymentMethod === "momo" ? "active" : ""}`}
                onClick={() => setPaymentMethod("momo")}
              >
                <div className="radio-circle"></div>
                <div className="payment-logo">
                  <img src={momoLogo} alt="MoMo" className="momo-icon" />
                  <span>📱 Thanh toán qua Ví MoMo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BÊN PHẢI: TỔNG KẾT ĐƠN HÀNG */}
        <div className="order-right">
          <div className="order-summary-card">
            <h2>🛒 Tóm tắt đơn hàng</h2>
            <div className="summary-details">
              <div className="summary-row">
                <p>Tạm tính</p>
                <p>{getTotalCartAmount().toLocaleString()}đ</p>
              </div>
              <div className="summary-row">
                <p>📦 Phí giao hàng</p>
                <p>{deliveryFee.toLocaleString()}đ</p>
              </div>
              {discount > 0 && (
                <div className="summary-row discount">
                  <p>🎉 Giảm giá ({discount}%)</p>
                  <p>
                    -
                    {Math.round(
                      (getTotalCartAmount() * discount) / 100,
                    ).toLocaleString()}
                    đ
                  </p>
                </div>
              )}
              <hr />
              <div className="summary-row total">
                <b>Tổng cộng</b>
                <b>
                  {(getTotalCartAmount() === 0
                    ? 0
                    : Math.round(getTotalCartAmount() * (1 - discount / 100)) +
                      deliveryFee
                  ).toLocaleString()}
                  đ
                </b>
              </div>
            </div>
            <button
              className="place-order-btn"
              type="submit"
              disabled={loading || !data.address}
            >
              {loading ? (
                <div className="spinner"></div>
              ) : (
                "✅ XÁC NHẬN ĐẶT HÀNG"
              )}
            </button>
            {!data.address && (
              <p className="error-message">
                ⚠️ Vui lòng đăng nhập!
              </p>
            )}
          </div>
        </div>
      </form>

      {/* 🔥 MODAL QR CODE THANH TOÁN MOMO */}
      {showQrModal && (
        <div className="qr-modal-overlay">
          <div className="qr-modal">
            <button className="qr-close" onClick={() => setShowQrModal(false)}>✕</button>
            <h3>📱 Quét mã QR bằng MoMo</h3>
            
            <div className="qr-code">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="MoMo QR Code" />
              ) : (
                <div className="qr-placeholder">
                  <div className="loading-spinner"></div>
                  <p>Đang tạo mã QR...</p>
                </div>
              )}
            </div>
            
            <div className="qr-instructions">
              <p>1. Mở ứng dụng <strong>MoMo</strong> trên điện thoại</p>
              <p>2. Chọn <strong>"Quét mã"</strong> (biểu tượng camera)</p>
              <p>3. Quét mã QR bên trên</p>
              <p>4. Xác nhận thanh toán</p>
              <p className="note">⚠️ Nếu không thanh toán được, bấm nút bên dưới!</p>
            </div>
            
            <div className="qr-status">
              <span className={`status-dot ${paymentStatus === 'paid' ? 'success' : 'pending'}`}></span>
              <span>{paymentStatus === 'paid' ? '✅ Đã thanh toán' : '⏳ Chờ thanh toán...'}</span>
            </div>
            
            <div className="qr-actions">
              {/* Nút kiểm tra trạng thái tự động */}
              <button className="btn-check" onClick={checkPaymentStatus}>
                <span className="btn-icon">🔄</span> Kiểm tra trạng thái
              </button>
              
              {/* 🔥 NÚT XÁC NHẬN THỦ CÔNG */}
              <button 
                className="btn-confirm-payment"
                onClick={manualConfirmPayment}
                disabled={loading}
              >
                <span className="btn-icon">✅</span> 
                {loading ? "Đang xử lý..." : "Tôi đã thanh toán xong"}
              </button>
              
              {/* Nút hủy */}
              <button className="btn-cancel" onClick={() => setShowQrModal(false)}>
                <span className="btn-icon">❌</span> Hủy thanh toán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;