import { loadStripe } from '@stripe/stripe-js';

// 🔥 LẤY KEY TỪ BIẾN MÔI TRƯỜNG (không hardcode)
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

// Kiểm tra Stripe có được cấu hình không
const isStripeConfigured = !!STRIPE_PUBLISHABLE_KEY && STRIPE_PUBLISHABLE_KEY !== 'pk_test_51234567890';

class StripeService {
  constructor() {
    this.stripe = null;
    this.elements = null;
    this.isEnabled = isStripeConfigured;
  }

  // Kiểm tra Stripe có sẵn sàng không
  isAvailable() {
    if (!this.isEnabled) {
      console.warn('⚠️ Stripe is disabled: Missing or invalid publishable key');
      return false;
    }
    return true;
  }

  // Initialize Stripe
  async initialize() {
    if (!this.isAvailable()) {
      console.warn('⚠️ Stripe not available, skipping initialization');
      return null;
    }
    
    if (!this.stripe) {
      try {
        this.stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
        console.log('✅ Stripe initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Stripe:', error);
        this.isEnabled = false;
        return null;
      }
    }
    return this.stripe;
  }

  // Create payment intent
  async createPaymentIntent(amount, orderData) {
    if (!this.isAvailable()) {
      return { 
        clientSecret: null, 
        error: 'Stripe chưa được cấu hình. Vui lòng liên hệ quản trị viên!' 
      };
    }

    try {
      const response = await fetch('/api/payment/create-intent', {  // 🔥 SỬA ĐÚNG ENDPOINT
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount),  // Số tiền đã là VND, không nhân 100
          currency: 'vnd',
          orderId: orderData?.orderId,
          items: orderData?.items,
          customerEmail: orderData?.customerEmail
        }),
        credentials: 'include'  // 🔥 THÊM CREDENTIALS
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create payment intent');
      }

      return { clientSecret: data.clientSecret, error: null };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return { clientSecret: null, error: error.message };
    }
  }

  // Create payment form elements
  createPaymentElements(clientSecret) {
    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    const options = {
      clientSecret,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#ff6b4a',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }
      },
      fonts: [{
        cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
      }]
    };

    this.elements = this.stripe.elements(options);
    return this.elements;
  }

  // Create payment form
  createPaymentForm(elements, clientSecret) {
    const paymentElement = elements.create('payment', {
      layout: 'tabs',
      paymentMethodOrder: ['card', 'apple_pay', 'google_pay']
    });

    return paymentElement;
  }

  // Confirm payment
  async confirmPayment(clientSecret, elements) {
    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    const { error } = await this.stripe.confirmPayment({
      clientSecret,
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
        return_method: 'if_required'
      }
    });

    return { error };
  }

  // Handle payment result
  handlePaymentResult(result) {
    if (result.error) {
      return {
        success: false,
        error: result.error.message,
        type: 'payment_failed'
      };
    }

    return {
      success: true,
      message: 'Thanh toán thành công',
      type: 'payment_succeeded'
    };
  }

  // Get supported payment methods
  getSupportedPaymentMethods() {
    if (!this.isAvailable()) {
      return [];
    }
    
    return [
      {
        id: 'card',
        name: 'Thẻ tín dụng/Ghi nợ',
        icon: '💳'
      },
      {
        id: 'apple_pay',
        name: 'Apple Pay',
        icon: '🍎'
      },
      {
        id: 'google_pay',
        name: 'Google Pay',
        icon: '🤖'
      }
    ];
  }

  // Format amount for display
  formatAmount(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  // Get Stripe status
  getStatus() {
    return {
      isEnabled: this.isAvailable(),
      hasPublishableKey: !!STRIPE_PUBLISHABLE_KEY,
      publishableKeyPrefix: STRIPE_PUBLISHABLE_KEY ? STRIPE_PUBLISHABLE_KEY.substring(0, 7) + '...' : 'none'
    };
  }
}

// Create singleton instance
const stripeService = new StripeService();

export default stripeService;