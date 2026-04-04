import { useContext, useState } from "react";
import "./Order.scss";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Order = () => {
  const { getTotalCartAmount, token, food_list, cartItems, setCartItems, url, discount, promoCode, setDiscount, setPromoCode } = useContext(StoreContext);
  const navigate = useNavigate();

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    country: "",
    phone: ""
  });

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const onChangeHandler = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    if (getTotalCartAmount() === 0) {
      alert("Giỏ hàng trống!");
      return;
    }

    if (!token) {
      alert("Vui lòng đăng nhập để đặt hàng!");
      return;
    }

    // Build order items from cart
    const orderItems = [];
    food_list.forEach(item => {
      if (cartItems[item._id] > 0) {
        orderItems.push({
          ...item,
          quantity: cartItems[item._id]
        });
      }
    });

    const discountedAmount = Math.round(getTotalCartAmount() * (1 - discount / 100));
    const orderData = {
      items: orderItems,
      amount: discountedAmount + 5,
      address: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        phone: data.phone
      },
      paymentMethod
    };

    setLoading(true);
    try {
      if (paymentMethod === "stripe") {
        // Tạo payment intent trước
        const paymentRes = await axios.post(`${url}/api/payment/create-intent`, {
          amount: discountedAmount + 5,
          items: orderItems,
          customerEmail: data.email
        }, { headers: { token } });

        if (!paymentRes.data.success) {
          alert(paymentRes.data.message || "Không thể tạo thanh toán Stripe");
          setLoading(false);
          return;
        }

        // Đặt hàng với thông tin payment
        orderData.paymentId = paymentRes.data.paymentIntentId;
        const response = await axios.post(`${url}/api/order/place`, orderData, {
          headers: { token }
        });

        if (response.data.success) {
          setCartItems({});
          setDiscount(0);
          setPromoCode("");
          alert("Đặt hàng thành công! Thanh toán đang được xử lý.");
          navigate("/myorders");
        } else {
          alert(response.data.message || "Đặt hàng thất bại!");
        }
      } else {
        // COD - Thanh toán khi nhận hàng
        const response = await axios.post(`${url}/api/order/place`, orderData, {
          headers: { token }
        });

        if (response.data.success) {
          setCartItems({});
          setDiscount(0);
          setPromoCode("");
          alert("Đặt hàng thành công!");
          navigate("/myorders");
        } else {
          alert(response.data.message || "Đặt hàng thất bại!");
        }
      }
    } catch (error) {
      console.error("Order error:", error);
      alert("Đã xảy ra lỗi khi đặt hàng!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="order" onSubmit={placeOrder} method="post">
      <div className="order-left">
        <p className="title">Thông tin giao hàng</p>
        <div className="multi-fields">
          <input name="firstName" onChange={onChangeHandler} value={data.firstName} type="text" placeholder="Họ" required />
          <input name="lastName" onChange={onChangeHandler} value={data.lastName} type="text" placeholder="Tên" required />
        </div>
        <input name="email" onChange={onChangeHandler} value={data.email} type="email" placeholder="Email" required />
        <input name="address" onChange={onChangeHandler} value={data.address} type="text" placeholder="Địa chỉ" required />
        <div className="multi-fields">
          <input name="city" onChange={onChangeHandler} value={data.city} type="text" placeholder="Thành phố" required />
          <input name="state" onChange={onChangeHandler} value={data.state} type="text" placeholder="Quận/Huyện" />
        </div>
        <div className="multi-fields">
          <input name="country" onChange={onChangeHandler} value={data.country} type="text" placeholder="Quốc gia" required />
          <input name="phone" onChange={onChangeHandler} value={data.phone} type="tel" placeholder="Số điện thoại" required />
        </div>

        <p className="title" style={{ fontSize: 22, marginTop: 30, marginBottom: 15 }}>Phương thức thanh toán</p>
        <div className="payment-methods">
          <label className={`payment-option ${paymentMethod === "cod" ? "selected" : ""}`}>
            <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
            <span>Thanh toán khi nhận hàng (COD)</span>
          </label>
          <label className={`payment-option ${paymentMethod === "stripe" ? "selected" : ""}`}>
            <input type="radio" name="payment" value="stripe" checked={paymentMethod === "stripe"} onChange={() => setPaymentMethod("stripe")} />
            <span>Thanh toán online (Stripe)</span>
          </label>
        </div>
      </div>
      <div className="order-right">
        <div className="cart-total">
          <h2>Tổng giỏ hàng</h2>
          <div className="cart-total-details">
            <p>Giá tiền:</p>
            <p>{getTotalCartAmount()} VNĐ</p>
          </div>
          <hr />
          <div className="cart-total-details">
            <p>Phí vận chuyển:</p>
            <p>{getTotalCartAmount() === 0 ? 0 : 5} VNĐ</p>
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
            <b>
              {" "}
              {getTotalCartAmount() === 0 ? 0 : Math.round(getTotalCartAmount() * (1 - discount / 100)) + 5} VNĐ
            </b>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "ĐANG XỬ LÝ..." : "THANH TOÁN"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default Order;
