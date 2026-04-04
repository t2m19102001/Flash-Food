import React, { useState, useEffect } from 'react'
import './Orders.scss'
import axios from 'axios'
import { toast } from 'react-toastify'
import { getCookie } from '../../utils/cookieHelper'
import OrderStatusNotifications from '../../components/OrderStatusNotifications/OrderStatusNotifications'

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
    const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address.phone.includes(searchTerm);
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesPayment = filterPayment === "all" ||
      (filterPayment === "paid" && order.payment) ||
      (filterPayment === "unpaid" && !order.payment);
    return matchesSearch && matchesStatus && matchesPayment;
  });


  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const fetchAllOrders = async () => {
    try {
      const token = getCookie("adminToken");
      const response = await axios.get(`${url}/api/order/list`, {
        headers: { token }
      });
      if (response.data.success) {
        setOrders(response.data.orders.reverse()); // Đơn mới nhất lên đầu
      } else {
        toast.error("Không thể tải danh sách đơn hàng");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Lỗi khi tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value;
    const order = orders.find(o => o._id === orderId);

    // Validation workflow: Chỉ cho phép chuyển theo luồng đúng
    const allowedTransitions = {
      "Processing": ["Food Preparing", "Cancelled"],
      "Food Preparing": ["Out for Delivery", "Cancelled"],
      "Out for Delivery": ["Delivered"],
      "Delivered": [], // Không thể chuyển từ Delivered
      "Cancelled": [] // Không thể chuyển từ Cancelled
    };

    if (!allowedTransitions[order.status].includes(newStatus)) {
      toast.error(`Không thể chuyển từ "${getStatusText(order.status)}" sang "${getStatusText(newStatus)}"`);
      event.target.value = order.status; // Reset về trạng thái cũ
      return;
    }

    try {
      const token = getCookie("adminToken");
      const response = await axios.post(`${url}/api/order/status`, {
        orderId: orderId,
        status: newStatus
      }, {
        headers: { token }
      });
      if (response.data.success) {
        await fetchAllOrders();
        toast.success("Cập nhật trạng thái thành công");
        // Update selected order if it's open
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Lỗi khi cập nhật trạng thái");
      event.target.value = order.status; // Reset về trạng thái cũ
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Processing":
        return "status-processing";
      case "Food Preparing":
        return "status-preparing";
      case "Out for Delivery":
        return "status-delivery";
      case "Delivered":
        return "status-delivered";
      case "Done":
        return "status-done";
      case "Cancelled":
        return "status-cancelled";
      default:
        return "status-processing";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Processing":
        return "Đang xử lý";
      case "Food Preparing":
        return "Đang chuẩn bị";
      case "Out for Delivery":
        return "Đang giao";
      case "Delivered":
        return "Đã giao";
      case "Done":
        return "Đã giao";
      case "Cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getAvailableStatusOptions = (currentStatus) => {
    const statusFlow = {
      "Processing": [
        { value: "Processing", label: "Đang xử lý" },
        { value: "Food Preparing", label: "Đang chuẩn bị món" }
      ],
      "Food Preparing": [
        { value: "Food Preparing", label: "Đang chuẩn bị món" },
        { value: "Out for Delivery", label: "Đang giao hàng" }
      ],
      "Out for Delivery": [
        { value: "Out for Delivery", label: "Đang giao hàng" },
        { value: "Delivered", label: "Đã giao hàng" }
      ],
      "Delivered": [
        { value: "Delivered", label: "Đã giao hàng" }
      ],
      "Cancelled": [
        { value: "Cancelled", label: "Đã hủy" }
      ]
    };
    return statusFlow[currentStatus] || [];
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

    if (!orderToCancel || !orderToCancel._id) {
      toast.error("Không tìm thấy thông tin đơn hàng");
      return;
    }

    try {
      const token = getCookie("adminToken");
      const response = await axios.post(`${url}/api/order/cancel`, {
        orderId: orderToCancel._id,
        reason: cancelReason,
        cancelledBy: "admin"
      }, {
        headers: { token }
      });

      if (response.data.success) {
        toast.success("Đã hủy đơn hàng thành công");
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
          <h2>Quản Lý Đơn Hàng</h2>
          <p className="subtitle">Theo dõi và xử lý tất cả các đơn hàng</p>
        </div>
        <div className="orders-count">
          <strong>{orders.length}</strong> đơn hàng
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <p>Đang tải danh sách đơn hàng...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-orders">
          <h3>Chưa có đơn hàng nào</h3>
          <p>Các đơn hàng mới sẽ hiển thị ở đây khi khách hàng đặt hàng.</p>
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="toolbar">
            <div className="toolbar-left">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Tìm..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="filter-group">
                <select
                  className="filter-dropdown"
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">▼ Trạng thái</option>
                  <option value="Processing">Đang xử lý</option>
                  <option value="Food Preparing">Đang chuẩn bị</option>
                  <option value="Out for Delivery">Đang giao</option>
                  <option value="Delivered">Đã giao</option>
                </select>
                <select
                  className="filter-dropdown"
                  value={filterPayment}
                  onChange={(e) => {
                    setFilterPayment(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">▼ Thanh toán</option>
                  <option value="paid">Đã Thanh Toán</option>
                  <option value="unpaid">Chưa Thanh Toán</option>
                </select>
                <button className="toolbar-btn" onClick={fetchAllOrders} title="Làm mới">
                  🔄
                </button>
              </div>
            </div>
            <div className="toolbar-right">
              <div className="pagination-info">
                {filteredOrders.length > 0 ? `${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filteredOrders.length)} / ${filteredOrders.length}` : '0 / 0'}
              </div>
              <button
                className="toolbar-btn"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ◀
              </button>
              <button
                className="toolbar-btn"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                ▶
              </button>
            </div>
          </div>

          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Tên người nhận</th>
                  <th>Số điện thoại</th>
                  <th>Email</th>
                  <th>Thời gian đặt</th>
                  <th>Trạng thái</th>
                  <th>Trạng Thái Thanh Toán</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="order-id">#{order._id.slice(-6).toUpperCase()}</td>
                    <td className="customer-name">
                      {order.address.firstName} {order.address.lastName}
                    </td>
                    <td>{order.address.phone}</td>
                    <td>{order.address.email}</td>
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
                        <span className="payment-status paid">Đã thanh toán</span>
                      ) : (
                        <span className="payment-status unpaid">Chưa thanh toán</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="view-detail-btn"
                          onClick={() => handleViewDetail(order)}
                        >
                          Chi tiết
                        </button>
                        {(order.status === "Processing" || order.status === "Food Preparing") && (
                          <button
                            className="cancel-order-btn"
                            onClick={() => handleOpenCancelModal(order)}
                            title="Hủy đơn hàng"
                          >
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
              <h2>Chi tiết đơn hàng #{selectedOrder._id.slice(-6).toUpperCase()}</h2>
              <button className="close-modal-btn" onClick={handleCloseModal}>×</button>
            </div>

            <div className="modal-body">
              {/* Phần trên: Thông tin đơn hàng và người nhận */}
              <div className="order-info-section">
                <div className="info-grid">
                  <div className="info-card">
                    <h3>Thông tin đơn hàng</h3>
                    <div className="info-item">
                      <label>Mã đơn hàng:</label>
                      <span>#{selectedOrder._id.slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="info-item">
                      <label>Thời gian đặt:</label>
                      <span>
                        {new Date(selectedOrder.date).toLocaleDateString('vi-VN')} - {' '}
                        {new Date(selectedOrder.date).toLocaleTimeString('vi-VN')}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Trạng thái thanh toán:</label>
                      {selectedOrder.payment ? (
                        <span className="payment-status paid">Đã thanh toán</span>
                      ) : (
                        <span className="payment-status unpaid">Chưa thanh toán</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Trạng thái đơn hàng:</label>
                      {selectedOrder.status === "Cancelled" || selectedOrder.status === "Delivered" || selectedOrder.status === "Done" ? (
                        <span className={`status-badge ${getStatusColor(selectedOrder.status)}`}>
                          {getStatusText(selectedOrder.status)}
                        </span>
                      ) : (
                        <select
                          className={`status-select ${getStatusColor(selectedOrder.status)}`}
                          value={selectedOrder.status}
                          onChange={(e) => statusHandler(e, selectedOrder._id)}
                        >
                          {getAvailableStatusOptions(selectedOrder.status).map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  <div className="info-card">
                    <h3>Thông tin người nhận</h3>
                    <div className="info-item">
                      <label>Họ tên:</label>
                      <span>{selectedOrder.address.firstName} {selectedOrder.address.lastName}</span>
                    </div>
                    <div className="info-item">
                      <label>Số điện thoại:</label>
                      <span>{selectedOrder.address.phone}</span>
                    </div>
                    <div className="info-item">
                      <label>Email:</label>
                      <span>{selectedOrder.address.email}</span>
                    </div>
                    <div className="info-item">
                      <label>Địa chỉ:</label>
                      <span>
                        {selectedOrder.address.street}, {selectedOrder.address.state}, {' '}
                        {selectedOrder.address.city}, {selectedOrder.address.country} - {' '}
                        {selectedOrder.address.zipcode}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phần dưới: Danh sách sản phẩm và tổng tiền */}
              <div className="products-section">
                <h3>Danh sách sản phẩm ({selectedOrder.items?.length || 0} món)</h3>
                <div className="products-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Hình ảnh</th>
                        <th>Tên món</th>
                        <th>Đơn giá</th>
                        <th>Số lượng</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <img
                              src={`${url}${item.image}`}
                              alt={item.name}
                              className="product-image"
                            />
                          </td>
                          <td className="product-name">{item.name}</td>
                          <td>{item.price.toLocaleString('vi-VN')} VND</td>
                          <td className="quantity">x{item.quantity}</td>
                          <td className="total-price">
                            {(item.price * item.quantity).toLocaleString('vi-VN')} VND
                          </td>
                        </tr>
                      )) || (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                              Không có thông tin sản phẩm
                            </td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>

                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div className="payment-summary">
                    <div className="summary-row">
                      <span>Tổng tiền món:</span>
                      <span>{(selectedOrder.amount - 10000).toLocaleString('vi-VN')} VND</span>
                    </div>
                    <div className="summary-row">
                      <span>Phí giao hàng:</span>
                      <span>10,000 VND</span>
                    </div>
                    <div className="summary-row total">
                      <span>Tổng thanh toán:</span>
                      <span>{selectedOrder.amount.toLocaleString('vi-VN')} VND</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              {(selectedOrder.status === "Processing" || selectedOrder.status === "Food Preparing") && (
                <button
                  className="btn-cancel-order"
                  onClick={() => {
                    handleCloseModal();
                    handleOpenCancelModal(selectedOrder);
                  }}
                >
                  Hủy đơn hàng
                </button>
              )}
              <button className="btn-close" onClick={handleCloseModal}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hủy đơn hàng */}
      {showCancelModal && orderToCancel && (
        <div className="modal-overlay" onClick={handleCloseCancelModal}>
          <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cancel-modal-header">
              <h2>⚠️ Hủy đơn hàng</h2>
              <button className="close-modal-btn" onClick={handleCloseCancelModal}>×</button>
            </div>

            <div className="cancel-modal-body">
              <p className="warning-text">
                Bạn đang thực hiện hủy đơn hàng <strong>#{orderToCancel && orderToCancel._id ? orderToCancel._id.slice(-6).toUpperCase() : 'N/A'}</strong>
              </p>
              <p className="info-text">
                Khách hàng: <strong>{orderToCancel && orderToCancel.address ? `${orderToCancel.address.firstName || 'N/A'} ${orderToCancel.address.lastName || ''}` : 'N/A'}</strong>
              </p>

              <div className="form-group">
                <label htmlFor="cancelReason">Lý do hủy đơn: <span className="required">*</span></label>
                <textarea
                  id="cancelReason"
                  className="cancel-reason-input"
                  placeholder="Vui lòng nhập lý do hủy đơn (VD: Hết món, Địa chỉ không hợp lệ, Đơn hàng giả...)"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows="4"
                  maxLength="500"
                />
                <div className="char-count">{cancelReason.length}/500</div>
              </div>

              <div className="cancel-warning">
                <p>⚠️ <strong>Lưu ý:</strong></p>
                <ul>
                  <li>Khách hàng sẽ nhận được thông báo về việc hủy đơn</li>
                  <li>Lý do hủy sẽ được gửi kèm trong thông báo</li>
                  <li>Hành động này không thể hoàn tác</li>
                </ul>
              </div>
            </div>

            <div className="cancel-modal-footer">
              <button className="btn-confirm-cancel" onClick={handleCancelOrder}>
                Xác nhận hủy
              </button>
              <button className="btn-back" onClick={handleCloseCancelModal}>
                Quay lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Order Status Notifications */}
      <OrderStatusNotifications />
    </div>
  )
}

export default Orders
