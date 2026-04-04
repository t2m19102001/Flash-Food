import { useContext, useState } from "react";
import "./Cart.scss";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Cart = () => {
  const { cartItems, food_list, removeFromCart, getTotalCartAmount, url, token, promoCode, setPromoCode, discount, setDiscount } =
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

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Mặt hàng</p>
          <p>Tiêu đề</p>
          <p>Giá</p>
          <p>Số lượng</p>
          <p>Tổng tiền</p>
          <p>Xóa</p>
        </div>
        <br />
        <hr />
        {food_list.map((item, index) => {
          if (cartItems[item._id] > 0) {
            return (
              <div>
                <div key={index} className="cart-items-title cart-items-item">
                  <img src={item.image} alt="" />
                  <p>{item.name}</p>
                  <p>{item.price} VNĐ</p>
                  <p>{cartItems[item._id]}</p>
                  <p>{item.price * cartItems[item._id]} VNĐ</p>
                  <p onClick={() => removeFromCart(item._id)} className="cross">
                    x
                  </p>
                </div>
                <hr />
              </div>
            );
          }
        })}
      </div>
      <div className="total">
        <div className="cart-bottom">
          <div className="cart-total">
            <h2>Tổng giỏ hàng</h2>
            <div className="cart-total-details">
              <p>Giá tiền:</p>
              <p>{getTotalCartAmount()} VNĐ</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Phí vận chuyển:</p>
              <p>{getTotalCartAmount()===0 ? 0:5} VNĐ</p>
            </div>
            <hr />
            {discount > 0 && (
              <>
                <div className="cart-total-details">
                  <p>Giảm giá ({discount}%):</p>
                  <p>-{Math.round(getTotalCartAmount() * discount / 100)} VNĐ</p>
                </div>
                <hr />
              </>
            )}
            <div className="cart-total-details">
              <b>Tổng tiền :</b>
              <b> {getTotalCartAmount()===0 ? 0 : Math.round(getTotalCartAmount() * (1 - discount / 100)) + 5} VNĐ</b>
            </div>
            <button onClick={() => navigate("/order")}>
              TIẾN HÀNH THANH TOÁN
            </button>
          </div>
        </div>
        <div className="cart-promocode">
          <div>
            <p>Nếu bạn có mã khuyến mãi ! Nhập tại đây.</p>
            <div className="cart-promocode-input">
              <input type="text" placeholder="Mã khuyến mãi" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} />
              <button onClick={applyPromoCode}>Xác nhận</button>
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
