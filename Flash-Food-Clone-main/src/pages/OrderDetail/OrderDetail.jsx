import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import './OrderDetail.scss';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { url, isAuthenticated, getImageUrl, logout, token } = useContext(StoreContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  
  // State cho modal hủy đơn
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log("🔍 OrderDetail - orderId:", orderId);
  console.log("🔍 OrderDetail - isAuthenticated:", isAuthenticated);

  const fetchOrderDetail = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!orderId) {
      setError("Không tìm thấy mã đơn hàng");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = `${url}/api/order/${orderId}`;
      console.log("🟢 Gọi API:", apiUrl);
      
      const response = await axios.get(apiUrl, {
        withCredentials: true,
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      console.log("📥 Response:", response.data);
      
      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        setError(response.data.message || 'Không thể tải đơn hàng');
      }
    } catch (err) {
      console.error('❌ Lỗi:', err);
      
      if (err.response?.status === 401) {
        setError('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!');
        setTimeout(() => logout(), 1500);
      } else if (err.response?.status === 404) {
        setError('Không tìm thấy đơn hàng');
      } else {
        setError(err.response?.data?.message || 'Không thể tải thông tin đơn hàng');
      }
    } finally {
      setLoading(false);
    }
  };

  // Mở modal xác nhận hủy đơn
  const openCancelModal = () => {
    setCancelReason('');
    setShowCancelModal(true);
  };

  // Xử lý hủy đơn
  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert('Vui lòng nhập lý do hủy đơn');
      return;
    }

    setIsSubmitting(true);
    setCancelling(true);
    
    try {
      const response = await axios.post(`${url}/api/order/cancel`, {
        orderId: orderId,
        reason: cancelReason.trim(),
        cancelledBy: 'user'
      }, {
        withCredentials: true,
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (response.data.success) {
        alert('✅ Đã hủy đơn hàng thành công!');
        setShowCancelModal(false);
        fetchOrderDetail();
      } else {
        alert(response.data.message || 'Hủy đơn thất bại');
      }
    } catch (err) {
      console.error('Lỗi hủy đơn:', err);
      alert(err.response?.data?.message || 'Không thể hủy đơn hàng');
    } finally {
      setIsSubmitting(false);
      setCancelling(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { text: '⏳ Đang xử lý', class: 'status-pending' },
      'pending_payment': { text: '💳 Chờ thanh toán', class: 'status-warning' },
      'confirmed': { text: '✅ Đã xác nhận', class: 'status-confirmed' },
      'processing': { text: '🍳 Đang chuẩn bị', class: 'status-processing' },
      'shipped': { text: '🚚 Đang giao hàng', class: 'status-shipped' },
      'delivered': { text: '🎉 Đã giao thành công', class: 'status-delivered' },
      'cancelled': { text: '❌ Đã hủy', class: 'status-cancelled' },
      'payment_failed': { text: '💔 Thanh toán thất bại', class: 'status-failed' }
    };
    return statusMap[status] || { text: status || 'Đang xử lý', class: 'status-pending' };
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

  const canCancel = () => {
    if (!order) return false;
    const cancellableStatuses = ['pending', 'pending_payment', 'confirmed'];
    return cancellableStatuses.includes(order.status);
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    } else {
      setLoading(false);
      setError("Không tìm thấy mã đơn hàng");
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Không thể tải đơn hàng</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/myorders')}>Quay lại đơn hàng</button>
          <button onClick={fetchOrderDetail} style={{ marginLeft: '10px', background: '#ff6b4a' }}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const statusInfo = getStatusBadge(order.status);

  return (
    <div className="order-detail-page">
      <div className="order-detail-container">
        <div className="order-detail-header">
          <button className="back-btn" onClick={() => navigate('/myorders')}>
            ← Quay lại
          </button>
          <h1>Chi tiết đơn hàng</h1>
          <div className={`status-badge ${statusInfo.class}`}>
            {statusInfo.text}
          </div>
        </div>

        <div className="order-info-section">
          <div className="info-card">
            <h3>📋 Thông tin đơn hàng</h3>
            <div className="info-row">
              <span>Mã đơn hàng:</span>
              <strong>#{order._id?.slice(-8)}</strong>
            </div>
            <div className="info-row">
              <span>Ngày đặt:</span>
              <span>{formatDate(order.date || order.createdAt)}</span>
            </div>
            <div className="info-row">
              <span>Phương thức thanh toán:</span>
              <span className="payment-method">
                {order.paymentMethod === 'cod' ? '💰 Thanh toán khi nhận hàng' : 
                 order.paymentMethod === 'momo' ? '📱 Ví MoMo' : '💳 Thẻ tín dụng'}
              </span>
            </div>
            <div className="info-row">
              <span>Trạng thái thanh toán:</span>
              <span className={order.paymentStatus === 'paid' ? 'paid' : 'unpaid'}>
                {order.paymentStatus === 'paid' ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'}
              </span>
            </div>
          </div>

          <div className="info-card">
            <h3>📍 Địa chỉ giao hàng</h3>
            <p><strong>{order.address?.firstName} {order.address?.lastName}</strong></p>
            <p>{order.address?.address}</p>
            <p>{order.address?.city}, {order.address?.country}</p>
            <p>📞 {order.address?.phone}</p>
            <p>📧 {order.address?.email}</p>
          </div>
        </div>

        <div className="items-section">
          <h3>🛒 Danh sách món ăn</h3>
          <div className="items-list">
            {order.items?.map((item, index) => (
              <div key={index} className="order-item">
                <img 
                  src={getImageUrl(item.image)} 
                  alt={item.name} 
                  className="item-image"
                  onError={(e) => { e.target.src = '/default-food.png'; }}
                />
                <div className="item-info">
                  <p className="item-name">{item.name}</p>
                  <p className="item-price">{formatPrice(item.price)}</p>
                </div>
                <div className="item-quantity">x{item.quantity}</div>
                <div className="item-total">{formatPrice(item.price * item.quantity)}</div>
              </div>
            ))}
          </div>
          
          <div className="order-summary">
            <div className="summary-row">
              <span>Tạm tính:</span>
              <span>{formatPrice(order.amount - (order.shippingFee || 15000))}</span>
            </div>
            <div className="summary-row">
              <span>Phí giao hàng:</span>
              <span>{formatPrice(order.shippingFee || 15000)}</span>
            </div>
            {order.discount > 0 && (
              <div className="summary-row discount">
                <span>Giảm giá:</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Tổng cộng:</span>
              <span>{formatPrice(order.amount)}</span>
            </div>
          </div>
        </div>

        {canCancel() && (
          <div className="action-section">
            <button 
              className="cancel-order-btn" 
              onClick={openCancelModal}
              disabled={cancelling}
            >
              {cancelling ? 'Đang xử lý...' : '❌ Hủy đơn hàng'}
            </button>
          </div>
        )}

        {order.status === 'delivered' && (
          <div className="action-section">
            <button className="review-btn" onClick={() => alert('Tính năng đánh giá đang phát triển')}>
              ⭐ Đánh giá đơn hàng
            </button>
          </div>
        )}
      </div>

      {/* Modal xác nhận hủy đơn */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelOrder}
        title="Hủy đơn hàng"
        message={
          <div className="cancel-reason-form">
            <p>Bạn có chắc muốn hủy đơn hàng <strong>#{order._id?.slice(-8)}</strong>?</p>
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

export default OrderDetail;