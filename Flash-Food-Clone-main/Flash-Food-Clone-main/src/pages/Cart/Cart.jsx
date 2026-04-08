import { useContext, useState } from "react";
import "./Cart.scss";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Cart = () => {
  const { cartItems, food_list, removeFromCart, getTotalCartAmount, url, token, promoCode, setPromoCode, discount, setDiscount, getImageUrl } =
    useContext(StoreContext);

  const navigate = useNavigate();
  const [promoInput, setPromoInput] = useState(promoCode);
  const [promoMessage, setPromoMessage] = useState(discount > 0 ? `Đã áp dụng giảm ${discount}%` : "");
  const [promoError, setPromoError] = useState(false);

  const applyPromoCode = async () => {
    if (!promoInput.trim()) return;
    if (!token) {
      setPromoMessage("Vui lòng đăng nhập để dùng mã khuyến mãi");
      setPromoError(true);
      return;
    }
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
      setPromoMessage("Lỗi khi kiểm tra mã khuyến mãi");
      setPromoError(true);
    }
  };

  const deliveryFee = getTotalCartAmount() === 0 ? 0 : 15000; // Để 15k cho giống thực tế hơn Lâm nhé

  return (
    <div className="cart">
      <div className="cart-container">
        {/* Bảng danh sách sản phẩm */}
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
            {food_list.map((item, index) => {
              if (cartItems[item._id] > 0) {
                return (
                  <div key={item._id}>
                    <div className="cart-items-item">
                      <img src={getImageUrl(item.image)} alt={item.name} />
                      <p className="item-name">{item.name}</p>
                      <p>{item.price.toLocaleString()}đ</p>
                      <div className="item-quantity">{cartItems[item._id]}</div>
                      <p className="item-total">{(item.price * cartItems[item._id]).toLocaleString()}đ</p>
                      <p onClick={() => removeFromCart(item._id)} className="cross">✕</p>
                    </div>
                  </div>
                );
              }
            })}
            {getTotalCartAmount() === 0 && (
              <div className="empty-cart">
                <p>Giỏ hàng đang trống Lâm ơi!</p>
                <button onClick={() => navigate('/')}>Quay lại thực đơn</button>
              </div>
            )}
          </div>
        </div>

        {/* Phần tổng tiền và Promocode bên phải */}
        <div className="cart-right">
          <div className="cart-summary-card">
            <h2>Tóm tắt đơn hàng</h2>
            <div className="cart-total-details">
              <p>Tạm tính</p>
              <p>{getTotalCartAmount().toLocaleString()} VNĐ</p>
            </div>
            <div className="cart-total-details">
              <p>Phí vận chuyển</p>
              <p>{deliveryFee.toLocaleString()} VNĐ</p>
            </div>
            {discount > 0 && (
              <div className="cart-total-details discount">
                <p>Khuyến mãi ({discount}%)</p>
                <p>-{Math.round(getTotalCartAmount() * discount / 100).toLocaleString()} VNĐ</p>
              </div>
            )}
            <hr />
            <div className="cart-total-details final">
              <b>Tổng cộng</b>
              <b>{(getTotalCartAmount() === 0 ? 0 : Math.round(getTotalCartAmount() * (1 - discount / 100)) + deliveryFee).toLocaleString()} VNĐ</b>
            </div>
            <button className="checkout-btn" onClick={() => navigate("/order")} disabled={getTotalCartAmount()===0}>
              TIẾN HÀNH THANH TOÁN
            </button>
          </div>

          <div className="cart-promocode-card">
            <p>Bạn có mã giảm giá?</p>
            <div className="cart-promocode-input">
              <input type="text" placeholder="Nhập mã..." value={promoInput} onChange={(e) => setPromoInput(e.target.value)} />
              <button onClick={applyPromoCode}>Áp dụng</button>
            </div>
            {promoMessage && (
              <p className={`promo-message ${promoError ? "error" : "success"}`}>{promoMessage}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;