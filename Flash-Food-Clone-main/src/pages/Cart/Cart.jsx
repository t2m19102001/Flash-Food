import { useContext, useState } from "react";
import "./Cart.scss";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";

const Cart = () => {
  const { 
    cartItems, 
    food_list, 
    removeFromCart, 
    getTotalCartAmount, 
    url, 
    token, 
    promoCode, 
    setPromoCode, 
    discount, 
    setDiscount, 
    getImageUrl 
  } = useContext(StoreContext);

  const navigate = useNavigate();
  const [promoInput, setPromoInput] = useState(promoCode);
  const [promoMessage, setPromoMessage] = useState(discount > 0 ? `Đã áp dụng giảm ${discount}%` : "");
  const [promoError, setPromoError] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  
  // 🔥 STATE CHO MODAL XÁC NHẬN XÓA
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [itemNameToRemove, setItemNameToRemove] = useState("");

  const handleRemoveClick = (itemId, itemName) => {
    setItemToRemove(itemId);
    setItemNameToRemove(itemName);
    setShowConfirmModal(true);
  };

  const confirmRemove = () => {
    if (itemToRemove) {
      removeFromCart(itemToRemove);
    }
    setShowConfirmModal(false);
    setItemToRemove(null);
    setItemNameToRemove("");
  };

  const cancelRemove = () => {
    setShowConfirmModal(false);
    setItemToRemove(null);
    setItemNameToRemove("");
  };

  const applyPromoCode = async () => {
    if (!promoInput.trim() || isApplying) return;
    
    if (!token) {
      setPromoMessage("Vui lòng đăng nhập để dùng mã khuyến mãi");
      setPromoError(true);
      return;
    }
    
    setIsApplying(true);
    
    try {
      const response = await axios.post(`${url}/api/promo/validate`, { code: promoInput }, {
        headers: { token }
      });
      
      if (response.data.success) {
        setPromoCode(promoInput.toUpperCase());
        setDiscount(response.data.discountPercent);
        setPromoMessage(response.data.message);
        setPromoError(false);
      } else {
        setPromoCode("");
        setDiscount(0);
        setPromoMessage(response.data.message);
        setPromoError(true);
      }
    } catch (error) {
      console.error("Promo error:", error);
      setPromoMessage(error.response?.data?.message || "Lỗi khi kiểm tra mã khuyến mãi");
      setPromoError(true);
    } finally {
      setIsApplying(false);
    }
  };

  const subtotal = getTotalCartAmount();
  const deliveryFee = subtotal === 0 ? 0 : 15000;
  const discountAmount = Math.round(subtotal * discount / 100);
  const finalTotal = subtotal === 0 ? 0 : subtotal - discountAmount + deliveryFee;

  return (
    <div className="cart">
      <div className="cart-container">
        <div className="cart-left">
          <div className="cart-items-header">
            <p>Sản phẩm</p>
            <p>Tên</p>
            <p>Giá</p>
            <p>Số lượng</p>
            <p>Tổng</p>
            <p>Xóa</p>
          </div>
          <div className="cart-items-list">
            {food_list.map((item) => {
              if (cartItems[item._id] > 0) {
                return (
                  <div key={item._id} className="cart-items-item">
                    <img src={getImageUrl(item.image)} alt={item.name} />
                    <p className="item-name">{item.name}</p>
                    <p>{item.price.toLocaleString()}đ</p>
                    <div className="item-quantity">{cartItems[item._id]}</div>
                    <p className="item-total">{(item.price * cartItems[item._id]).toLocaleString()}đ</p>
                    <p 
                      onClick={() => handleRemoveClick(item._id, item.name)} 
                      className="cross"
                      style={{ cursor: "pointer" }}
                    >
                      ✕
                    </p>
                  </div>
                );
              }
              return null;
            })}
            {subtotal === 0 && (
              <div className="empty-cart">
                <div className="empty-icon">🛒</div>
                <p>Giỏ hàng đang trống!</p>
                <button onClick={() => navigate('/')}>Quay lại thực đơn</button>
              </div>
            )}
          </div>
        </div>

        <div className="cart-right">
          <div className="cart-summary-card">
            <h2>📋 Tóm tắt đơn hàng</h2>
            <div className="cart-total-details">
              <p>Tạm tính</p>
              <p>{subtotal.toLocaleString()}đ</p>
            </div>
            <div className="cart-total-details">
              <p>📦 Phí vận chuyển</p>
              <p>{deliveryFee.toLocaleString()}đ</p>
            </div>
            {discount > 0 && (
              <div className="cart-total-details discount">
                <p>🎉 Khuyến mãi ({discount}%)</p>
                <p>-{discountAmount.toLocaleString()}đ</p>
              </div>
            )}
            <hr />
            <div className="cart-total-details total">
              <b>Tổng cộng</b>
              <b>{finalTotal.toLocaleString()}đ</b>
            </div>
            <button 
              className="checkout-btn" 
              onClick={() => navigate("/order")} 
              disabled={subtotal === 0}
            >
              {subtotal === 0 ? "🛑 Giỏ hàng trống" : "💳 TIẾN HÀNH THANH TOÁN"}
            </button>
          </div>

          <div className="cart-promocode-card">
            <p>🎁 Bạn có mã giảm giá?</p>
            <div className="cart-promocode-input">
              <input 
                type="text" 
                placeholder="Nhập mã..." 
                value={promoInput} 
                onChange={(e) => setPromoInput(e.target.value)} 
                disabled={isApplying}
              />
              <button 
                onClick={applyPromoCode} 
                disabled={isApplying || !promoInput.trim()}
                className={isApplying ? "loading" : ""}
              >
                {isApplying ? (
                  <>
                    <span className="spinner-small"></span>
                    Đang xử lý...
                  </>
                ) : (
                  "Áp dụng"
                )}
              </button>
            </div>
            {promoMessage && (
              <p className={`promo-message ${promoError ? "error" : "success"}`}>
                {promoError ? "❌ " : "✅ "}{promoMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 🔥 CUSTOM CONFIRM MODAL */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={cancelRemove}
        onConfirm={confirmRemove}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa "${itemNameToRemove}" khỏi giỏ hàng?`}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
};

export default Cart;