import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';

// ========== KIỂM TRA CẤU HÌNH STRIPE ==========
const isStripeConfigured = () => {
    const hasSecretKey = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== '';
    
    if (!hasSecretKey) {
        console.log('⚠️ Stripe is DISABLED: STRIPE_SECRET_KEY not configured');
        console.log('   Only COD and MoMo payments are available');
    }
    
    return hasSecretKey;
};

const stripeEnabled = isStripeConfigured();

// ========== CREATE PAYMENT INTENT (DISABLED) ==========
export const createPaymentIntent = async (req, res) => {
    return res.status(503).json({ 
        success: false, 
        message: 'Thanh toán Stripe hiện không khả dụng. Vui lòng chọn COD hoặc MoMo.' 
    });
};

// ========== WEBHOOK HANDLER (DISABLED) ==========
export const confirmPayment = async (req, res) => {
    return res.status(503).json({ 
        success: false, 
        message: 'Stripe webhook không hoạt động.' 
    });
};

// ========== HANDLE PAYMENT SUCCESS (DISABLED) ==========
export const handlePaymentSuccess = async (req, res) => {
    return res.status(503).json({ 
        success: false, 
        message: 'Thanh toán Stripe không khả dụng.' 
    });
};

// ========== GET PAYMENT METHODS ==========
export const getPaymentMethods = async (req, res) => {
    res.json({
        success: true,
        methods: ['cod', 'momo']  // Chỉ COD và MoMo
    });
};

// ========== KIỂM TRA CẤU HÌNH ==========
export const checkStripeConfigStatus = async (req, res) => {
    res.json({
        success: true,
        config: {
            isStripeConfigured: false,
            availablePaymentMethods: ['cod', 'momo'],
            message: 'Stripe is disabled. Use COD or MoMo.'
        }
    });
};