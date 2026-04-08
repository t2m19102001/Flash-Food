import React, { useState, useEffect } from 'react';
import stripeService from '../../utils/stripeService';
import './PaymentForm.scss';

const PaymentForm = ({ orderData, onPaymentSuccess, onPaymentError }) => {
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [error, setError] = useState(null);
  const [paymentElement, setPaymentElement] = useState(null);

  useEffect(() => {
    initializePayment();
  }, [orderData]);

  const initializePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize Stripe
      await stripeService.initialize();

      // Create payment intent
      const { clientSecret, error: intentError } = await stripeService.createPaymentIntent(
        orderData.amount,
        orderData
      );

      if (intentError) {
        setError(intentError);
        setLoading(false);
        return;
      }

      setClientSecret(clientSecret);

      // Create payment elements
      const elements = stripeService.createPaymentElements(clientSecret);
      const paymentElement = stripeService.createPaymentForm(elements, clientSecret);
      setPaymentElement(paymentElement);

      // Mount payment element
      paymentElement.mount('#payment-element');

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!clientSecret || !paymentElement) {
      setError('Payment form not ready');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Confirm payment
      const { error } = await stripeService.confirmPayment(clientSecret, paymentElement);

      if (error) {
        setError(error.message);
        onPaymentError(error);
      } else {
        const result = stripeService.handlePaymentResult({ success: true });
        onPaymentSuccess(result);
      }

      setLoading(false);
    } catch (err) {
      setError(err.message);
      onPaymentError(err);
      setLoading(false);
    }
  };

  const supportedMethods = stripeService.getSupportedPaymentMethods();

  return (
    <div className="payment-form">
      <div className="payment-header">
        <h3>💳 Thanh Toán Đơn Hàng</h3>
        <div className="order-summary">
          <div className="summary-item">
            <span>Mã đơn hàng:</span>
            <span>#{orderData.orderId?.slice(-6).toUpperCase() || 'N/A'}</span>
          </div>
          <div className="summary-item">
            <span>Tổng tiền:</span>
            <span>{stripeService.formatAmount(orderData.amount)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="payment-error">
          <p>⚠️ {error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="payment-form-container">
        <div className="payment-methods">
          <h4>Phương thức thanh toán được hỗ trợ:</h4>
          <div className="methods-grid">
            {supportedMethods.map(method => (
              <div key={method.id} className="method-item">
                <span className="method-icon">{method.icon}</span>
                <span className="method-name">{method.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="payment-element-container">
          <div id="payment-element" className="payment-element" />
          {loading && (
            <div className="payment-loading">
              <div className="spinner"></div>
              <p>Đang xử lý thanh toán...</p>
            </div>
          )}
        </div>

        <div className="payment-actions">
          <button 
            type="submit" 
            className="pay-button"
            disabled={loading || !clientSecret}
          >
            {loading ? (
              <>
                <div className="button-spinner"></div>
                Đang thanh toán...
              </>
            ) : (
              <>
                🔒 Thanh toán {stripeService.formatAmount(orderData.amount)}
              </>
            )}
          </button>
          
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => onPaymentError({ message: 'User cancelled payment' })}
            disabled={loading}
          >
            Hủy
          </button>
        </div>
      </form>

      <div className="payment-security">
        <h4>🔒 Bảo Mật Thanh Toán</h4>
        <ul>
          <li>Thông tin thẻ được mã hóa và bảo mật</li>
          <li>Chúng tôi không lưu trữ thông tin thẻ tín dụng</li>
          <li>Thanh toán được xử lý qua Stripe bảo mật</li>
          <li>Compliance với PCI DSS</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentForm;
