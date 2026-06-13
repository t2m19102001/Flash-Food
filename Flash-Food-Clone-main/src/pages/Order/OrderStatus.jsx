import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const OrderStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const orderIdParam = searchParams.get("orderId");
    const resultCode = searchParams.get("resultCode");
    
    if (orderIdParam) {
      setOrderId(orderIdParam);
      if (resultCode === "0") {
        setStatus("success");
      } else {
        setStatus("failed");
      }
    }
  }, [searchParams]);

  if (status === "loading") {
    return <div className="loading">Đang xử lý...</div>;
  }

  return (
    <div className="order-status-page">
      {status === "success" ? (
        <div className="success-card">
          <div className="icon">✅</div>
          <h2>Thanh toán thành công!</h2>
          <p>Cảm ơn bạn đã đặt hàng. Đơn hàng #{orderId} đã được ghi nhận.</p>
          <button onClick={() => navigate("/myorders")}>Xem đơn hàng</button>
          <button onClick={() => navigate("/")}>Tiếp tục mua sắm</button>
        </div>
      ) : (
        <div className="failed-card">
          <div className="icon">❌</div>
          <h2>Thanh toán thất bại</h2>
          <p>Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại!</p>
          <button onClick={() => navigate("/cart")}>Quay lại giỏ hàng</button>
        </div>
      )}
    </div>
  );
};

export default OrderStatus;