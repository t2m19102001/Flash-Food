import { useContext, useEffect, useState } from "react";
import "./MyOrders.scss";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const MyOrders = () => {
  const { url, isAuthenticated, logout } = useContext(StoreContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      setError("Vui lòng đăng nhập để xem đơn hàng");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${url}/api/order/userorders`, {}, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setOrders(response.data.orders.reverse());
      } else {
        setError(response.data.message || "Không thể tải đơn hàng");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      
      if (error.response?.status === 401) {
        setError("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
        logout();
      } else if (error.response) {
        setError(error.response.data?.message || "Lỗi kết nối đến máy chủ");
      } else if (error.request) {
        setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.");
      } else {
        setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    
    setCancellingId(orderId);
    try {
      const response = await axios.post(`${url}/api/order/cancel`, {
        orderId: orderId,
        reason: "Khách hàng yêu cầu hủy",
        cancelledBy: "user"
      }, {
        withCredentials: true
      });
      
      if (response.data.success) {
        alert("✅ Đã hủy đơn hàng thành công!");
        fetchOrders();
      } else {
        alert(response.data.message || "Hủy đơn thất bại");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert(error.response?.data?.message || "Không thể hủy đơn hàng");
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
      setError("Vui lòng đăng nhập để xem đơn hàng");
    }
  }, [isAuthenticated]);

  const getStatusBadge = (status) => {
    const statusMap = {
      "pending": { text: "⏳ Đang xử lý", class: "status-pending" },
      "pending_payment": { text: "💳 Chờ thanh toán", class: "status-warning" },
      "confirmed": { text: "✅ Đã thanh toán", class: "status-confirmed" },
      "processing": { text: "🍳 Đang chuẩn bị", class: "status-processing" },
      "shipped": { text: "🚚 Đang giao hàng", class: "status-shipped" },
      "delivered": { text: "🎉 Đã giao thành công", class: "status-delivered" },
      "cancelled": { text: "❌ Đã hủy", class: "status-cancelled" },
      "payment_failed": { text: "💔 Thanh toán thất bại", class: "status-failed" },
      "refunded": { text: "🔄 Đã hoàn tiền", class: "status-refunded" }
    };
    return statusMap[status] || { text: status || "⏳ Đang xử lý", class: "status-pending" };
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="myorders">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="myorders">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Không thể tải đơn hàng</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchOrders}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="myorders">
      <div className="orders-header">
        <h2>📦 Đơn hàng của tôi</h2>
        <p className="orders-count">Tổng cộng {orders.length} đơn hàng</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-icon">🛒</div>
          <h3>Bạn chưa có đơn hàng nào</h3>
          <p>Hãy khám phá thực đơn và đặt ngay những món ngon nhé!</p>
          <button className="shop-now-btn" onClick={() => navigate('/')}>
            🍽️ Mua sắm ngay
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order, index) => {
            const statusInfo = getStatusBadge(order.status);
            const isCancellable = order.status === 'pending' || order.status === 'pending_payment';
            const orderNote = order.address?.note; // 🔥 LẤY GHI CHÚ TỪ ĐƠN HÀNG
            
            return (
              <div key={index} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <span className="order-id">#{order._id?.slice(-8)}</span>
                    <span className="order-date">{formatDate(order.date || order.createdAt)}</span>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${statusInfo.class}`}>
                      {statusInfo.text}
                    </span>
                  </div>
                </div>

                <div className="order-items">
                  {order.items?.map((item, i) => (
                    <div key={i} className="order-item">
                      <div className="item-info">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                      </div>
                      <div className="item-price">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 🔥 THÊM PHẦN HIỂN THỊ GHI CHÚ */}
                {orderNote && (
                  <div className="order-note">
                    <span className="note-label">📝 Ghi chú:</span>
                    <span className="note-text">{orderNote}</span>
                  </div>
                )}

                <div className="order-footer">
                  <div className="order-address">
                    <span className="address-label">📍 Địa chỉ:</span>
                    <span className="address-text">
                      {order.address?.address || order.address?.street || 'Chưa cập nhật'}
                    </span>
                  </div>
                  <div className="order-total">
                    <span className="total-label">Tổng cộng:</span>
                    <span className="total-amount">{formatPrice(order.amount)}</span>
                  </div>
                </div>

                <div className="order-actions">
                  <button 
                    className="action-btn detail-btn" 
                    onClick={() => navigate(`/order/${order._id}`)}
                  >
                    📋 Xem chi tiết
                  </button>
                  {isCancellable && (
                    <button 
                      className="action-btn cancel-btn" 
                      onClick={() => handleCancelOrder(order._id)}
                      disabled={cancellingId === order._id}
                    >
                      {cancellingId === order._id ? 'Đang xử lý...' : '❌ Hủy đơn'}
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <button className="action-btn review-btn" onClick={() => alert('Tính năng đang phát triển')}>
                      ⭐ Đánh giá
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;