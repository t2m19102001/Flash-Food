import React, { useState, useEffect } from 'react'
import './Orders.scss'
import axios from 'axios'
import { toast } from 'react-toastify'

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 40;
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");

  // Filter and search orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address?.phone?.includes(searchTerm);
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesPayment = filterPayment === "all" ||
      (filterPayment === "paid" && order.payment) ||
      (filterPayment === "unpaid" && !order.payment);
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(`${url}/api/order/list`, {
        withCredentials: true
      });
      if (response.data.success) {
        setOrders(response.data.orders.reverse());
      } else {
        toast.error("Không thể tải danh sách đơn hàng");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
      } else {
        toast.error("Lỗi khi tải danh sách đơn hàng");
      }
    } finally {
      setLoading(false);
    }
  };

  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value;
    const order = orders.find(o => o._id === orderId);

    const allowedTransitions = {
      "pending": ["confirmed", "cancelled"],
      "pending_payment": ["confirmed", "cancelled"],
      "confirmed": ["processing", "cancelled"],
      "processing": ["shipped", "cancelled"],
      "shipped": ["delivered"],
      "delivered": [],
      "cancelled": [],
      "payment_failed": []
    };

    if (!allowedTransitions[order?.status]?.includes(newStatus)) {
      toast.error(`Không thể chuyển trạng thái này`);
      event.target.value = order.status;
      return;
    }

    try {
      const response = await axios.post(`${url}/api/order/status`, {
        orderId: orderId,
        status: newStatus
      }, {
        withCredentials: true
      });
      if (response.data.success) {
        await fetchAllOrders();
        toast.success("Cập nhật trạng thái thành công");
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Lỗi khi cập nhật trạng thái");
      event.target.value = order.status;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'status-pending',
      'pending_payment': 'status-warning',
      'confirmed': 'status-confirmed',
      'processing': 'status-processing',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled',
      'payment_failed': 'status-failed'
    };
    return colors[status] || 'status-pending';
  };

  const getStatusText = (status) => {
    const texts = {
      'pending': '⏳ Đang xử lý',
      'pending_payment': '💳 Chờ thanh toán',
      'confirmed': '✅ Đã thanh toán',
      'processing': '🍳 Đang chuẩn bị',
      'shipped': '🚚 Đang giao hàng',
      'delivered': '🎉 Đã giao thành công',
      'cancelled': '❌ Đã hủy',
      'payment_failed': '💔 Thanh toán thất bại'
    };
    return texts[status] || status;
  };

  const getAvailableStatusOptions = (currentStatus) => {
    const statusFlow = {
      'pending': [
        { value: 'pending', label: '⏳ Đang xử lý' },
        { value: 'confirmed', label: '✅ Đã xác nhận' }
      ],
      'pending_payment': [
        { value: 'pending_payment', label: '💳 Chờ thanh toán' },
        { value: 'confirmed', label: '✅ Đã xác nhận' }
      ],
      'confirmed': [
        { value: 'confirmed', label: '✅ Đã xác nhận' },
        { value: 'processing', label: '🍳 Đang chuẩn bị' }
      ],
      'processing': [
        { value: 'processing', label: '🍳 Đang chuẩn bị' },
        { value: 'shipped', label: '🚚 Đang giao hàng' }
      ],
      'shipped': [
        { value: 'shipped', label: '🚚 Đang giao hàng' },
        { value: 'delivered', label: '🎉 Đã giao' }
      ],
      'delivered': [
        { value: 'delivered', label: '🎉 Đã giao' }
      ],
      'cancelled': [
        { value: 'cancelled', label: '❌ Đã hủy' }
      ]
    };
    return statusFlow[currentStatus] || [{ value: currentStatus, label: getStatusText(currentStatus) }];
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  const handleOpenCancelModal = (order) => {
    setOrderToCancel(order);
    setShowCancelModal(true);
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setOrderToCancel(null);
    setCancelReason("");
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error("Vui lòng nhập lý do hủy đơn");
      return;
    }

    try {
      const response = await axios.post(`${url}/api/order/cancel`, {
        orderId: orderToCancel._id,
        reason: cancelReason,
        cancelledBy: "admin"
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success("✅ Đã hủy đơn hàng thành công");
        await fetchAllOrders();
        handleCloseCancelModal();
        if (showDetailModal && selectedOrder?._id === orderToCancel._id) {
          handleCloseModal();
        }
      } else {
        toast.error(response.data.message || "Không thể hủy đơn hàng");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Lỗi khi hủy đơn hàng");
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  return (
    <div className="orders-page">
      <div className="orders-header">
        <div>
          <h2>📦 Quản Lý Đơn Hàng</h2>
          <p className="subtitle">Theo dõi và xử lý tất cả các đơn hàng</p>
        </div>
        <div className="orders-count">
          <strong>{orders.length}</strong> đơn hàng
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải danh sách đơn hàng...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-icon">📭</div>
          <h3>Chưa có đơn hàng nào</h3>
          <p>Các đơn hàng mới sẽ hiển thị ở đây khi khách hàng đặt hàng.</p>
        </div>
      ) : (
        <>
          <div className="toolbar">
            <div className="toolbar-left">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Tìm kiếm đơn hàng..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <div className="filter-group">
                <select
                  className="filter-dropdown"
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                >
                  <option value="all">📋 Tất cả trạng thái</option>
                  <option value="pending">⏳ Đang xử lý</option>
                  <option value="pending_payment">💳 Chờ thanh toán</option>
                  <option value="confirmed">✅ Đã xác nhận</option>
                  <option value="processing">🍳 Đang chuẩn bị</option>
                  <option value="shipped">🚚 Đang giao</option>
                  <option value="delivered">🎉 Đã giao</option>
                  <option value="cancelled">❌ Đã hủy</option>
                </select>
                <select
                  className="filter-dropdown"
                  value={filterPayment}
                  onChange={(e) => { setFilterPayment(e.target.value); setCurrentPage(1); }}
                >
                  <option value="all">💰 Tất cả thanh toán</option>
                  <option value="paid">✅ Đã thanh toán</option>
                  <option value="unpaid">⏳ Chưa thanh toán</option>
                </select>
                <button className="toolbar-btn" onClick={fetchAllOrders} title="Làm mới">🔄</button>
              </div>
            </div>
            <div className="toolbar-right">
              <div className="pagination-info">
                {filteredOrders.length > 0 ? `${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filteredOrders.length)} / ${filteredOrders.length}` : '0 / 0'}
              </div>
              <button className="toolbar-btn" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>◀</button>
              <button className="toolbar-btn" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>▶</button>
            </div>
          </div>

          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>📝 Mã đơn</th>
                  <th>👤 Người nhận</th>
                  <th>📞 SĐT</th>
                  <th>📧 Email</th>
                  <th>📝 Ghi chú</th>
                  <th>⏰ Thời gian</th>
                  <th>📊 Trạng thái</th>
                  <th>💰 Thanh toán</th>
                  <th>⚙️ Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="order-id">#{order._id?.slice(-8).toUpperCase()}</td>
                    <td className="customer-name">
                      {order.address?.firstName} {order.address?.lastName}
                    </td>
                    <td>{order.address?.phone}</td>
                    <td>{order.address?.email}</td>
                    <td className="order-note">
                      {order.address?.note ? (
                        <span className="note-text" title={order.address.note}>
                          📝 {order.address.note.length > 30 ? order.address.note.substring(0, 30) + '...' : order.address.note}
                        </span>
                      ) : (
                        <span className="no-note">—</span>
                      )}
                    </td>
                    <td className="order-time">
                      {new Date(order.date).toLocaleDateString('vi-VN')}
                      <br />
                      <span className="time">{new Date(order.date).toLocaleTimeString('vi-VN')}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td>
                      {order.payment ? (
                        <span className="payment-status paid">✅ Đã thanh toán</span>
                      ) : (
                        <span className="payment-status unpaid">⏳ Chưa thanh toán</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="view-detail-btn" onClick={() => handleViewDetail(order)}>
                          📋 Chi tiết
                        </button>
                        {(order.status === "pending" || order.status === "pending_payment") && (
                          <button className="cancel-order-btn" onClick={() => handleOpenCancelModal(order)} title="Hủy đơn">
                            ❌
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal Chi tiết đơn hàng */}
      {showDetailModal && selectedOrder && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Chi tiết đơn hàng #{selectedOrder._id?.slice(-8).toUpperCase()}</h2>
              <button className="close-modal-btn" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="order-info-section">
                <div className="info-grid">
                  <div className="info-card">
                    <h3>📝 Thông tin đơn hàng</h3>
                    <div className="info-item"><label>Mã đơn:</label><span>#{selectedOrder._id?.slice(-8).toUpperCase()}</span></div>
                    <div className="info-item"><label>Thời gian:</label><span>{new Date(selectedOrder.date).toLocaleString('vi-VN')}</span></div>
                    <div className="info-item"><label>Thanh toán:</label>{selectedOrder.payment ? <span className="payment-status paid">Đã thanh toán</span> : <span className="payment-status unpaid">Chưa thanh toán</span>}</div>
                    <div className="info-item"><label>Trạng thái:</label>
                      {selectedOrder.status === "cancelled" || selectedOrder.status === "delivered" ? (
                        <span className={`status-badge ${getStatusColor(selectedOrder.status)}`}>{getStatusText(selectedOrder.status)}</span>
                      ) : (
                        <select className={`status-select ${getStatusColor(selectedOrder.status)}`} value={selectedOrder.status} onChange={(e) => statusHandler(e, selectedOrder._id)}>
                          {getAvailableStatusOptions(selectedOrder.status).map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                        </select>
                      )}
                    </div>
                  </div>
                  <div className="info-card">
                    <h3>📍 Thông tin người nhận</h3>
                    <div className="info-item"><label>Họ tên:</label><span>{selectedOrder.address?.firstName} {selectedOrder.address?.lastName}</span></div>
                    <div className="info-item"><label>SĐT:</label><span>{selectedOrder.address?.phone}</span></div>
                    <div className="info-item"><label>Email:</label><span>{selectedOrder.address?.email}</span></div>
                    <div className="info-item"><label>Địa chỉ:</label><span>{selectedOrder.address?.address}, {selectedOrder.address?.city}</span></div>
                    {/* 🔥 THÊM PHẦN HIỂN THỊ GHI CHÚ TRONG MODAL */}
                    {selectedOrder.address?.note && (
                      <div className="info-item note-item">
                        <label>📝 Ghi chú:</label>
                        <span className="note-text">{selectedOrder.address.note}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="products-section">
                <h3>🛒 Danh sách món ăn ({selectedOrder.items?.length || 0} món)</h3>
                <div className="products-table">
                  <table>
                    <thead>
                      <tr><th>Hình</th><th>Tên món</th><th>Đơn giá</th><th>Số lượng</th><th>Thành tiền</th></tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td><img src={item.image ? `${url}/images/${item.image}` : '/placeholder.png'} alt={item.name} className="product-image" onError={(e) => { e.target.src = 'https://placehold.co/50x50?text=No+Image'; }} /></td>
                          <td>{item.name}</td>
                          <td>{item.price?.toLocaleString()}đ</td>
                          <td>x{item.quantity}</td>
                          <td>{(item.price * item.quantity).toLocaleString()}đ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="payment-summary">
                  <div className="summary-row"><span>Tạm tính:</span><span>{(selectedOrder.amount - 15000).toLocaleString()}đ</span></div>
                  <div className="summary-row"><span>Phí giao hàng:</span><span>15,000đ</span></div>
                  <div className="summary-row total"><span>Tổng cộng:</span><span>{selectedOrder.amount?.toLocaleString()}đ</span></div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {(selectedOrder.status === "pending" || selectedOrder.status === "pending_payment") && (
                <button className="btn-cancel-order" onClick={() => { handleCloseModal(); handleOpenCancelModal(selectedOrder); }}>❌ Hủy đơn hàng</button>
              )}
              <button className="btn-close" onClick={handleCloseModal}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hủy đơn */}
      {showCancelModal && orderToCancel && (
        <div className="modal-overlay" onClick={handleCloseCancelModal}>
          <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cancel-modal-header"><h2>⚠️ Hủy đơn hàng</h2><button className="close-modal-btn" onClick={handleCloseCancelModal}>×</button></div>
            <div className="cancel-modal-body">
              <p>Bạn đang hủy đơn hàng <strong>#{orderToCancel._id?.slice(-8).toUpperCase()}</strong></p>
              <div className="form-group"><label>Lý do hủy:</label><textarea placeholder="Nhập lý do hủy đơn..." value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows="4" /></div>
              <div className="cancel-warning"><p>⚠️ Hành động này không thể hoàn tác!</p></div>
            </div>
            <div className="cancel-modal-footer"><button className="btn-confirm-cancel" onClick={handleCancelOrder}>Xác nhận hủy</button><button className="btn-back" onClick={handleCloseCancelModal}>Quay lại</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders;