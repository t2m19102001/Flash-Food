import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
import './Payment.scss';

// Load Stripe (thay bằng publishable key thật của bạn)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_demo');

// Component nhập thẻ thanh toán
const PaymentForm = ({ clientSecret, orderId, amount, onSuccess, onError }) => {
  const { url } = useContext(StoreContext);
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setIsProcessing(true);
    setCardError('');
    
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: 'Khách hàng',
          },
        },
      });
      
      if (error) {
        console.error('Payment error:', error);
        setCardError(error.message);
        onError?.(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded!', paymentIntent);
        
        // Gọi API xác nhận thanh toán thành công
        await axios.post(`${url}/api/payment/success`, {
          orderId: orderId,
          paymentIntentId: paymentIntent.id
        }, {
          withCredentials: true
        });
        
        onSuccess?.(paymentIntent);
      }
    } catch (err) {
      console.error('Payment confirmation error:', err);
      setCardError(err.message);
      onError?.(err.message);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="stripe-form">
      <div className="card-element-wrapper">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#1e293b',
                '::placeholder': {
                  color: '#94a3b8',
                },
              },
              invalid: {
                color: '#dc2626',
              },
            },
            hidePostalCode: true,
          }}
        />
      </div>
      
      {cardError && <div className="error-message">{cardError}</div>}
      
      <button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="pay-button"
      >
        {isProcessing ? (
          <div className="spinner"></div>
        ) : (
          `Thanh toán ${amount.toLocaleString()}đ`
        )}
      </button>
    </form>
  );
};

// Component chính
const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Lấy dữ liệu từ state (được navigate từ Order page)
    const state = location.state;
    
    if (state?.clientSecret && state?.orderId) {
      setClientSecret(state.clientSecret);
      setOrderId(state.orderId);
      setAmount(state.amount || 0);
      setLoading(false);
    } else {
      // Nếu không có state, redirect về giỏ hàng
      alert('Không có thông tin thanh toán!');
      navigate('/cart');
    }
  }, [location, navigate]);
  
  const handlePaymentSuccess = (paymentIntent) => {
    alert('Thanh toán thành công!');
    navigate('/myorders');
  };
  
  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    // Không redirect, để user thử lại
  };
  
  if (loading) {
    return (
      <div className="payment-loading">
        <div className="spinner"></div>
        <p>Đang tải thông tin thanh toán...</p>
      </div>
    );
  }
  
  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <h1>Thanh toán đơn hàng</h1>
          <p>Vui lòng nhập thông tin thẻ để hoàn tất thanh toán</p>
        </div>
        
        <div className="payment-content">
          <div className="order-info">
            <h3>Thông tin đơn hàng</h3>
            <div className="order-details">
              <div className="detail-row">
                <span>Mã đơn hàng:</span>
                <strong>#{orderId?.slice(-8)}</strong>
              </div>
              <div className="detail-row">
                <span>Số tiền cần thanh toán:</span>
                <strong className="amount">{amount.toLocaleString()}đ</strong>
              </div>
            </div>
          </div>
          
          <div className="payment-methods">
            <h3>Phương thức thanh toán</h3>
            <div className="method-card">
              <div className="method-header">
                <span className="method-icon">💳</span>
                <span>Thẻ tín dụng / Ghi nợ</span>
              </div>
              <Elements stripe={stripePromise}>
                <PaymentForm
                  clientSecret={clientSecret}
                  orderId={orderId}
                  amount={amount}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>
            </div>
          </div>
        </div>
        
        <button className="back-button" onClick={() => navigate('/cart')}>
          ← Quay lại giỏ hàng
        </button>
      </div>
    </div>
  );
};

export default Payment;