import { useContext, useEffect, useState } from "react";
import "./MyOrders.scss";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";

const MyOrders = () => {
  const { url, isAuthenticated, logout, token } = useContext(StoreContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  // State cho modal hủy đơn
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        withCredentials: true,
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
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

  // Mở modal xác nhận hủy đơn
  const openCancelModal = (order) => {
    setSelectedOrder(order);
    setCancelReason("");
    setShowCancelModal(true);
  };

  // Xử lý hủy đơn
  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert("Vui lòng nhập lý do hủy đơn");
      return;
    }

    setIsSubmitting(true);
    setCancellingId(selectedOrder?._id);
    
    try {
      const response = await axios.post(`${url}/api/order/cancel`, {
        orderId: selectedOrder._id,
        reason: cancelReason.trim(),
        cancelledBy: "user"
      }, {
        withCredentials: true,
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (response.data.success) {
        alert("✅ Đã hủy đơn hàng thành công!");
        setShowCancelModal(false);
        fetchOrders();
      } else {
        alert(response.data.message || "Hủy đơn thất bại");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert(error.response?.data?.message || "Không thể hủy đơn hàng");
    } finally {
      setIsSubmitting(false);
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
            const orderNote = order.address?.note;
            
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
                      onClick={() => openCancelModal(order)}
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

      {/* Modal xác nhận hủy đơn */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelOrder}
        title="Hủy đơn hàng"
        message={
          <div className="cancel-reason-form">
            <p>Bạn có chắc muốn hủy đơn hàng <strong>#{selectedOrder?._id?.slice(-8)}</strong>?</p>
            <p className="reason-label">Vui lòng cho biết lý do:</p>
            <textarea
              className="reason-input"
              placeholder="Nhập lý do hủy đơn..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows="3"
              disabled={isSubmitting}
            />
          </div>
        }
        confirmText={isSubmitting ? "Đang xử lý..." : "Xác nhận hủy"}
        cancelText="Quay lại"
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default MyOrders;