import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import './OrderDetail.scss';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { url, isAuthenticated, getImageUrl, logout } = useContext(StoreContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // 🔥 THÊM LOG ĐỂ DEBUG
  console.log("🔍 OrderDetail - orderId từ params:", orderId);
  console.log("🔍 OrderDetail - isAuthenticated:", isAuthenticated);
  console.log("🔍 OrderDetail - url:", url);

  const fetchOrderDetail = async () => {
    console.log("🟢 fetchOrderDetail được gọi");
    
    if (!isAuthenticated) {
      console.log("❌ Chưa đăng nhập, chuyển hướng về login");
      navigate('/login');
      return;
    }
    
    if (!orderId) {
      console.log("❌ Không có orderId");
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
        withCredentials: true
      });
      
      console.log("📥 Response nhận được:", response.data);
      
      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        setError(response.data.message || 'Không thể tải đơn hàng');
      }
    } catch (err) {
      console.error('❌ Lỗi chi tiết:', err);
      console.error('❌ Response status:', err.response?.status);
      console.error('❌ Response data:', err.response?.data);
      
      if (err.response?.status === 401) {
        setError('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!');
        setTimeout(() => logout(), 1500);
      } else if (err.response?.status === 404) {
        setError('Không tìm thấy đơn hàng');
      } else if (err.code === 'ECONNABORTED' || err.message === 'Network Error') {
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend!');
      } else {
        setError(err.response?.data?.message || 'Không thể tải thông tin đơn hàng');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    
    setCancelling(true);
    try {
      const response = await axios.post(`${url}/api/order/cancel`, {
        orderId: orderId,
        reason: 'Khách hàng yêu cầu hủy',
        cancelledBy: 'user'
      }, {
        withCredentials: true
      });
      
      if (response.data.success) {
        alert('✅ Đã hủy đơn hàng thành công!');
        fetchOrderDetail(); // Refresh lại thông tin
      } else {
        alert(response.data.message || 'Hủy đơn thất bại');
      }
    } catch (err) {
      console.error('Lỗi hủy đơn:', err);
      alert(err.response?.data?.message || 'Không thể hủy đơn hàng');
    } finally {
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

  // 🔥 useEffect để gọi API khi component mount
  useEffect(() => {
    console.log("🔄 useEffect chạy, orderId:", orderId);
    if (orderId) {
      fetchOrderDetail();
    } else {
      console.log("❌ orderId không tồn tại, không gọi API");
      setLoading(false);
      setError("Không tìm thấy mã đơn hàng");
    }
  }, [orderId]); // 🔥 THÊM orderId VÀO DEPENDENCY

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
              <span>{formatPrice(order.amount - 15000)}</span>
            </div>
            <div className="summary-row">
              <span>Phí giao hàng:</span>
              <span>{formatPrice(15000)}</span>
            </div>
            {order.discount > 0 && (
              <div className="summary-row discount">
                <span>Giảm giá ({order.discount}%):</span>
                <span>-{formatPrice(order.amount * order.discount / 100)}</span>
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
              onClick={handleCancelOrder}
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
    </div>
  );
};

export default OrderDetail;