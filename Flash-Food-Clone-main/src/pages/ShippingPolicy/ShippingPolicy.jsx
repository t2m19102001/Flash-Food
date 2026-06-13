import React from 'react';
import './ShippingPolicy.scss';

const ShippingPolicy = () => {
  return (
    <div className="shipping-policy">
      <div className="policy-hero">
        <h1>Chính sách vận chuyển</h1>
        <p>Cam kết giao hàng nhanh chóng và an toàn</p>
      </div>

      <div className="policy-container">
        <div className="policy-content">
          <div className="policy-section">
            <h2>📦 Phạm vi giao hàng</h2>
            <p>Flash Food hiện đang cung cấp dịch vụ giao hàng tại:</p>
            <ul>
              <li>📍 Quận 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12</li>
              <li>📍 Quận Bình Thạnh, Phú Nhuận, Tân Bình, Tân Phú</li>
              <li>📍 Quận Gò Vấp, Bình Tân, Thủ Đức</li>
              <li>📍 Huyện Hóc Môn, Nhà Bè, Bình Chánh</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2>⏰ Thời gian giao hàng</h2>
            <div className="info-grid">
              <div className="info-card">
                <span className="info-icon">🚀</span>
                <h3>Giao hàng siêu tốc</h3>
                <p>15-25 phút (nội thành)</p>
                <small>Phí: 25,000đ</small>
              </div>
              <div className="info-card">
                <span className="info-icon">🛵</span>
                <h3>Giao hàng tiêu chuẩn</h3>
                <p>30-45 phút</p>
                <small>Phí: 15,000đ</small>
              </div>
              <div className="info-card">
                <span className="info-icon">📅</span>
                <h3>Đặt hàng trước</h3>
                <p>Chọn giờ mong muốn</p>
                <small>Phí: 15,000đ</small>
              </div>
            </div>
          </div>

          <div className="policy-section">
            <h2>💰 Phí vận chuyển</h2>
            <table className="price-table">
              <thead>
                <tr><th>Khoảng cách</th><th>Phí giao hàng</th></tr>
              </thead>
              <tbody>
                <tr><td>Dưới 2km</td><td>15,000đ</td></tr>
                <tr><td>2km - 5km</td><td>20,000đ</td></tr>
                <tr><td>5km - 10km</td><td>25,000đ</td></tr>
                <tr><td>Trên 10km</td><td>35,000đ</td></tr>
              </tbody>
            </table>
          </div>

          <div className="policy-section">
            <h2>⚠️ Lưu ý khi nhận hàng</h2>
            <ul>
              <li>Kiểm tra sản phẩm trước khi thanh toán</li>
              <li>Quay video khi mở hàng nếu có vấn đề</li>
              <li>Từ chối nhận nếu sản phẩm bị hư hỏng</li>
              <li>Liên hệ hotline 1900 1234 nếu cần hỗ trợ</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;