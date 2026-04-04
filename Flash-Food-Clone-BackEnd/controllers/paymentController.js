import stripe from 'stripe';
import 'dotenv/config';

const stripeInstance = process.env.STRIPE_SECRET_KEY
    ? stripe(process.env.STRIPE_SECRET_KEY)
    : null;

// Create payment intent
const createPaymentIntent = async (req, res) => {
    try {
        if (!stripeInstance) {
            return res.json({ success: false, message: 'Stripe chưa được cấu hình' });
        }

        const { amount, currency = 'vnd', orderId, items, customerEmail } = req.body;

        if (!amount || amount <= 0) {
            return res.json({
                success: false,
                message: 'Số tiền không hợp lệ'
            });
        }

        const paymentIntent = await stripeInstance.paymentIntents.create({
            amount: Math.round(amount),
            currency: currency.toLowerCase(),
            metadata: {
                orderId: orderId || '',
                itemCount: items ? items.length.toString() : '0',
                customerEmail: customerEmail || 'guest@example.com'
            },
            automatic_payment_methods: {
                enabled: true
            }
        });

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency
        });

    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.json({
            success: false,
            message: error.message || 'Không thể tạo payment intent'
        });
    }
};

// Confirm payment (webhook)
const confirmPayment = async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        let event;

        try {
            event = stripeInstance.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (err) {
            console.log(`Webhook signature verification failed:`, err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
    } catch (error) {
        console.error('Error confirming payment:', error);
        res.json({
            success: false,
            message: error.message || 'Không thể xác nhận thanh toán'
        });
    }
};

// Handle payment success
const handlePaymentSuccess = async (req, res) => {
    try {
        const { paymentIntentId, orderId } = req.body;

        // Update order payment status
        const { default: orderModel } = await import('../models/orderModel.js');
        await orderModel.findByIdAndUpdate(orderId, {
            payment: true,
            paymentId: paymentIntentId,
            paymentMethod: 'stripe',
            paidAt: new Date()
        });

        // Broadcast payment update
        if (global.broadcastOrderUpdate) {
            const updatedOrder = await orderModel.findById(orderId);
            global.broadcastOrderUpdate(orderId, 'Paid', updatedOrder.userId);
        }

        res.json({
            success: true,
            message: 'Thanh toán thành công'
        });

    } catch (error) {
        console.error('Error handling payment success:', error);
        res.json({
            success: false,
            message: error.message || 'Không thể xử lý thanh toán thành công'
        });
    }
};

// Get payment methods
const getPaymentMethods = async (req, res) => {
    try {
        const paymentMethods = await stripeInstance.paymentMethods.list({
            limit: 10,
            type: 'card'
        });

        res.json({
            success: true,
            paymentMethods: paymentMethods.data
        });

    } catch (error) {
        console.error('Error fetching payment methods:', error);
        res.json({
            success: false,
            message: error.message || 'Không thể lấy phương thức thanh toán'
        });
    }
};

export { createPaymentIntent, confirmPayment, handlePaymentSuccess, getPaymentMethods };
