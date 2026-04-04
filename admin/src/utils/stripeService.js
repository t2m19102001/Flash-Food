import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890';

class StripeService {
  constructor() {
    this.stripe = null;
    this.elements = null;
  }

  // Initialize Stripe
  async initialize() {
    if (!this.stripe) {
      this.stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
    }
    return this.stripe;
  }

  // Create payment intent
  async createPaymentIntent(amount, orderData) {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Stripe expects amount in cents
          currency: 'vnd',
          orderId: orderData.orderId,
          items: orderData.items,
          customerEmail: orderData.customerEmail
        })
      });

      const { clientSecret, error } = await response.json();

      if (error) {
        throw new Error(error.message);
      }

      return { clientSecret, error: null };
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
          colorPrimary: '#ff6347',
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
}

// Create singleton instance
const stripeService = new StripeService();

export default stripeService;
