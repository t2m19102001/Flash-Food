// src/services/momoService.js
import CryptoJS from 'crypto-js';

const MOMO_CONFIG = {
  endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create',
  partnerCode: 'MOMO',
  accessKey: 'F8BBA842ECF85',
  secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
  redirectUrl: 'http://localhost:5173/payment-success',
  ipnUrl: 'http://localhost:5173/payment-callback'
};

export const createMomoPayment = async (orderInfo) => {
  const requestId = `REQ_${Date.now()}`;
  const orderId = `ORDER_${Date.now()}`;
  
  // Tạo signature
  const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${orderInfo.totalPrice}&extraData=&ipnUrl=${MOMO_CONFIG.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo.orderInfo}&partnerCode=${MOMO_CONFIG.partnerCode}&redirectUrl=${MOMO_CONFIG.redirectUrl}&requestId=${requestId}&requestType=captureWallet`;
  
  const signature = CryptoJS.HmacSHA256(rawSignature, MOMO_CONFIG.secretKey).toString();
  
  const requestBody = {
    partnerCode: MOMO_CONFIG.partnerCode,
    partnerName: 'Flash Food',
    storeId: 'FlashFoodStore',
    requestId: requestId,
    amount: orderInfo.totalPrice,
    orderId: orderId,
    orderInfo: orderInfo.orderInfo,
    redirectUrl: MOMO_CONFIG.redirectUrl,
    ipnUrl: MOMO_CONFIG.ipnUrl,
    lang: 'vi',
    requestType: 'captureWallet',
    extraData: '',
    signature: signature
  };
  
  try {
    const response = await fetch(MOMO_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Lỗi thanh toán MoMo:', error);
    throw error;
  }
};