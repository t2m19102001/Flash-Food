import { useContext, useEffect, useState } from "react";
import "./MyOrders.scss";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await axios.post(`${url}/api/order/userorders`, {}, {
        headers: { token }
      });
      if (response.data.success) {
        setOrders(response.data.orders.reverse());
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Đang xử lý": return "#f0ad4e";
      case "Đang giao": return "#5bc0de";
      case "Đã giao": return "#5cb85c";
      case "Cancelled": return "#d9534f";
      default: return "#f0ad4e";
    }
  };

  if (loading) {
    return <div className="myorders"><p>Đang tải đơn hàng...</p></div>;
  }

  return (
    <div className="myorders">
      <h2>Đơn hàng của tôi</h2>
      {orders.length === 0 ? (
        <p className="no-orders">Bạn chưa có đơn hàng nào.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order, index) => (
            <div key={index} className="order-item">
              <div className="order-header">
                <span className="order-date">
                  {new Date(order.date || order.createdAt).toLocaleDateString("vi-VN")}
                </span>
                <span className="order-status" style={{ color: getStatusColor(order.status) }}>
                  {order.status || "Đang xử lý"}
                </span>
              </div>
              <div className="order-foods">
                {order.items.map((item, i) => (
                  <span key={i}>
                    {item.name} x {item.quantity}
                    {i < order.items.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
              <div className="order-footer">
                <span className="order-total">{order.amount} VNĐ</span>
                <span className="order-items-count">{order.items.length} món</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
