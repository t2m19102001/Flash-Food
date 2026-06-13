import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const OrderStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const orderIdParam = searchParams.get("orderId");
    const resultCode = searchParams.get("resultCode");
    
    console.log("OrderStatus params:", { orderIdParam, resultCode });
    
    if (orderIdParam) {
      setOrderId(orderIdParam);
      if (resultCode === "0") {
        setStatus("success");
      } else {
        setStatus("failed");
      }
    } else {
      setStatus("failed");
    }
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div style={{ textAlign: "center", padding: "60px" }}>
        <div className="spinner"></div>
        <p>Đang xử lý thanh toán...</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "60px", maxWidth: "500px", margin: "0 auto" }}>
      {status === "success" ? (
        <>
          <div style={{ fontSize: "64px" }}>✅</div>
          <h2>Thanh toán thành công!</h2>
          <p>Cảm ơn bạn đã đặt hàng.</p>
          {orderId && <p>Mã đơn hàng: #{orderId}</p>}
          <button onClick={() => navigate("/myorders")} style={btnPrimary}>
            Xem đơn hàng
          </button>
          <button onClick={() => navigate("/")} style={btnSecondary}>
            Tiếp tục mua sắm
          </button>
        </>
      ) : (
        <>
          <div style={{ fontSize: "64px" }}>❌</div>
          <h2>Thanh toán thất bại</h2>
          <p>Vui lòng thử lại hoặc chọn phương thức khác.</p>
          <button onClick={() => navigate("/cart")} style={btnPrimary}>
            Quay lại giỏ hàng
          </button>
          <button onClick={() => navigate("/order")} style={btnSecondary}>
            Thử lại
          </button>
        </>
      )}
    </div>
  );
};

const btnPrimary = {
  background: "#ff6b4a",
  color: "white",
  border: "none",
  padding: "12px 24px",
  borderRadius: "40px",
  fontSize: "15px",
  fontWeight: "600",
  cursor: "pointer",
  margin: "10px",
};

const btnSecondary = {
  background: "#f1f5f9",
  color: "#475569",
  border: "1px solid #e2e8f0",
  padding: "12px 24px",
  borderRadius: "40px",
  fontSize: "15px",
  fontWeight: "600",
  cursor: "pointer",
  margin: "10px",
};

export default OrderStatus;