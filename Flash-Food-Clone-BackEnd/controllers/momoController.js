import crypto from 'crypto-js';
import axios from 'axios';
import mongoose from 'mongoose';
import qr from 'qrcode';
import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';

const requireEnv = (key) => {
    const v = process.env[key];
    if (!v) throw new Error(`Missing required env var: ${key}`);
    return v;
};

const config = {
    accessKey: requireEnv('MOMO_ACCESS_KEY'),
    secretKey: requireEnv('MOMO_SECRET_KEY'),
    partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO',
    partnerName: process.env.MOMO_PARTNER_NAME || 'Flash Food',
    storeName: process.env.MOMO_STORE_NAME || 'FlashFoodStore',
    ipnUrl: requireEnv('MOMO_IPN_URL'),
    redirectUrl: requireEnv('MOMO_REDIRECT_URL'),
    requestType: 'captureWallet',
    apiEndpoint: 'https://test-payment.momo.vn/v2/gateway/api/create'
};

console.log('✅ MoMo config loaded');

// Kiểm tra ObjectId hợp lệ
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// ========== 1. TẠO THANH TOÁN MOMO (CÓ QR CODE) ==========
export const createMomoPayment = async (req, res) => {
    console.log("🟢 createMomoPayment được gọi");
    
    try {
        const { orderId, amount, orderInfo } = req.body;
        
        console.log("📦 Dữ liệu nhận:", { orderId, amount, orderInfo });
        
        if (!orderId || !amount) {
            return res.status(400).json({ 
                success: false, 
                message: 'Thiếu thông tin thanh toán!' 
            });
        }
        
        // Kiểm tra orderId hợp lệ
        if (!isValidObjectId(orderId)) {
            return res.status(400).json({
                success: false,
                message: 'Order ID không hợp lệ!'
            });
        }
        
        // Kiểm tra order tồn tại
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng!'
            });
        }
        
        // Tạo requestId riêng cho MoMo
        const requestId = `${orderId}_${Date.now()}`;
        
        // Cập nhật order
        order.momoRequestId = requestId;
        order.paymentStatus = 'pending';
        order.paymentMethod = 'momo';
        order.status = 'pending_payment';
        await order.save();
        
        // Tạo signature
        const rawSignature = `accessKey=${config.accessKey}&amount=${amount}&extraData=&ipnUrl=${config.ipnUrl}&orderId=${requestId}&orderInfo=${orderInfo}&partnerCode=${config.partnerCode}&redirectUrl=${config.redirectUrl}&requestId=${requestId}&requestType=${config.requestType}`;
        
        const signature = crypto.HmacSHA256(rawSignature, config.secretKey).toString();
        
        // Request body gửi sang MoMo
        const requestBody = {
            partnerCode: config.partnerCode,
            partnerName: config.partnerName,
            storeId: config.storeName,
            requestId: requestId,
            amount: amount,
            orderId: requestId,
            orderInfo: orderInfo || `Thanh toán đơn hàng ${orderId}`,
            redirectUrl: config.redirectUrl,
            ipnUrl: config.ipnUrl,
            lang: 'vi',
            requestType: config.requestType,
            extraData: '',
            signature: signature
        };
        
        console.log("📤 Gửi sang MoMo...");
        
        const response = await axios.post(config.apiEndpoint, requestBody, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        });
        
        console.log("📥 MoMo response:", response.data);
        
        if (response.data?.payUrl) {
            // Tạo QR Code từ payUrl
            let qrCodeDataUrl = null;
            try {
                qrCodeDataUrl = await qr.toDataURL(response.data.payUrl, {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#ffffff'
                    }
                });
                console.log("✅ Đã tạo QR Code thành công");
            } catch (qrError) {
                console.error("❌ Lỗi tạo QR Code:", qrError);
            }
            
            res.json({
                success: true,
                payUrl: response.data.payUrl,
                qrCodeUrl: qrCodeDataUrl,
                requestId: requestId,
                orderId: orderId,
                message: 'Tạo thanh toán MoMo thành công'
            });
        } else {
            res.status(400).json({
                success: false,
                message: response.data?.message || 'Không thể tạo thanh toán MoMo',
                resultCode: response.data?.resultCode
            });
        }
    } catch (error) {
        console.error("❌ MoMo Payment Error:", error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi tạo thanh toán MoMo: ' + (error.response?.data?.message || error.message)
        });
    }
};

// ========== 2. IPN WEBHOOK (MOMO GỌI VỀ SAU KHI QUÉT QR) ==========
export const momoIpnHandler = async (req, res) => {
    console.log("🟢 MoMo IPN Handler nhận được:", req.body);
    
    try {
        const {
            orderId,
            resultCode,
            message,
            transactionId,
            amount,
            payType,
            responseTime
        } = req.body;
        
        // Lấy originalOrderId từ requestId
        let originalOrderId = null;
        if (orderId) {
            const parts = orderId.split('_');
            if (parts.length > 0 && isValidObjectId(parts[0])) {
                originalOrderId = parts[0];
            }
        }
        
        if (!originalOrderId) {
            console.error("❌ IPN: Không thể lấy originalOrderId từ:", orderId);
            return res.status(200).json({ message: 'Received' });
        }
        
        console.log(`📋 IPN - Order: ${originalOrderId}, ResultCode: ${resultCode}`);
        
        if (resultCode === 0) {
            // Thanh toán thành công
            const updatedOrder = await orderModel.findByIdAndUpdate(
                originalOrderId,
                {
                    paymentStatus: 'paid',
                    status: 'confirmed',
                    transactionId: transactionId,
                    paidAt: new Date(),
                    paymentMethod: 'momo',
                    ipnReceived: true,
                    ipnData: {
                        resultCode, message, payType, responseTime, amount
                    }
                },
                { new: true }
            );
            
            if (updatedOrder) {
                console.log(`✅ IPN: Đã cập nhật đơn hàng ${originalOrderId} thành công!`);
                
                // Xóa giỏ hàng
                if (updatedOrder.userId) {
                    await userModel.findByIdAndUpdate(updatedOrder.userId, { cartData: {} });
                    console.log(`🗑️ Đã xóa giỏ hàng của user ${updatedOrder.userId}`);
                }
            }
        } else {
            // Thanh toán thất bại
            console.log(`❌ IPN: Thanh toán thất bại cho đơn hàng ${originalOrderId}`);
            console.log(`⚠️ Lỗi: ${message} (Code: ${resultCode})`);
            
            await orderModel.findByIdAndUpdate(originalOrderId, {
                paymentStatus: 'failed',
                status: 'payment_failed',
                failureReason: message,
                failureCode: resultCode,
                ipnReceived: true,
                ipnData: { resultCode, message, responseTime }
            });
        }
        
        // Luôn trả 200 cho MoMo
        res.status(200).json({ message: 'Received' });
    } catch (error) {
        console.error("❌ MoMo IPN Error:", error);
        res.status(200).json({ message: 'Received' });
    }
};

// ========== 3. CALLBACK (RETURN URL) ==========
export const momoCallback = async (req, res) => {
    console.log("🟢 MoMo Callback nhận được:", req.query);
    
    try {
        const { orderId, resultCode, message, transactionId } = req.query;
        
        let originalOrderId = null;
        if (orderId) {
            const parts = orderId.split('_');
            if (parts.length > 0 && isValidObjectId(parts[0])) {
                originalOrderId = parts[0];
            }
        }
        
        if (resultCode === '0') {
            // Cập nhật trạng thái đơn hàng nếu chưa được IPN cập nhật
            if (originalOrderId) {
                await orderModel.findByIdAndUpdate(originalOrderId, {
                    paymentStatus: 'paid',
                    status: 'confirmed',
                    transactionId: transactionId,
                    paidAt: new Date()
                });
            }
            return res.redirect(`${process.env.FRONTEND_URL}/payment-success?success=true&orderId=${originalOrderId}`);
        } else {
            return res.redirect(`${process.env.FRONTEND_URL}/payment-success?success=false&message=${encodeURIComponent(message || 'Thanh toán thất bại')}`);
        }
    } catch (error) {
        console.error("Callback error:", error);
        return res.redirect(`${process.env.FRONTEND_URL}/payment-success?success=false&message=System error`);
    }
};

// ========== 4. KIỂM TRA TRẠNG THÁI ==========
export const checkMomoStatus = async (req, res) => {
    try {
        const { orderId } = req.params || req.body;
        
        if (!orderId || !isValidObjectId(orderId)) {
            return res.status(400).json({ success: false, message: 'Order ID không hợp lệ!' });
        }
        
        const order = await orderModel.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }
        
        res.json({
            success: true,
            paymentStatus: order.paymentStatus || 'pending',
            status: order.status,
            transactionId: order.transactionId,
            amount: order.amount,
            paidAt: order.paidAt,
            message: order.paymentStatus === 'paid' ? 'Thanh toán thành công!' : 'Đang chờ thanh toán...'
        });
    } catch (error) {
        console.error("Check status error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ========== 5. LẤY THÔNG TIN GIAO DỊCH ==========
export const getMomoTransactionInfo = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        if (!orderId || !isValidObjectId(orderId)) {
            return res.status(400).json({ success: false, message: 'Order ID không hợp lệ!' });
        }
        
        const order = await orderModel.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }
        
        res.json({
            success: true,
            transaction: {
                orderId: order._id,
                paymentStatus: order.paymentStatus,
                transactionId: order.transactionId,
                amount: order.amount,
                paidAt: order.paidAt,
                method: order.paymentMethod
            }
        });
    } catch (error) {
        console.error("Get transaction error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ========== 6. MANUAL UPDATE (DÙNG KHI IPN KHÔNG HOẠT ĐỘNG) ==========
export const manualUpdatePaymentStatus = async (req, res) => {
    console.log("🟢 manualUpdatePaymentStatus được gọi");
    
    try {
        const { orderId } = req.body;
        
        if (!orderId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Thiếu orderId!' 
            });
        }
        
        if (!isValidObjectId(orderId)) {
            return res.status(400).json({
                success: false,
                message: 'Order ID không hợp lệ!'
            });
        }
        
        const order = await orderModel.findById(orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng!'
            });
        }
        
        // Kiểm tra nếu đã thanh toán rồi thì không cập nhật lại
        if (order.paymentStatus === 'paid') {
            return res.json({
                success: true,
                message: 'Đơn hàng đã được thanh toán trước đó!',
                alreadyPaid: true
            });
        }
        
        // Cập nhật trạng thái đơn hàng thành công
        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId,
            {
                paymentStatus: 'paid',
                status: 'confirmed',
                paidAt: new Date(),
                paymentMethod: 'momo',
                manualConfirmed: true,
                manualConfirmedAt: new Date()
            },
            { new: true }
        );
        
        if (updatedOrder) {
            console.log(`✅ Manual update: Đã cập nhật đơn hàng ${orderId} thành công!`);
            
            // Xóa giỏ hàng của user
            if (updatedOrder.userId) {
                await userModel.findByIdAndUpdate(updatedOrder.userId, { cartData: {} });
                console.log(`🗑️ Đã xóa giỏ hàng của user ${updatedOrder.userId}`);
            }
            
            res.json({
                success: true,
                message: 'Cập nhật thanh toán thành công!',
                order: updatedOrder
            });
        } else {
            res.status(500).json({ 
                success: false, 
                message: 'Không thể cập nhật đơn hàng!' 
            });
        }
    } catch (error) {
        console.error("❌ Manual update error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};