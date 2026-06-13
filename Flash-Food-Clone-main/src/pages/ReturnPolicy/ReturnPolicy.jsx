import React from 'react';
import './ReturnPolicy.scss';

const ReturnPolicy = () => {
  return (
    <div className="return-policy">
      <div className="policy-hero">
        <h1>Chính sách đổi trả</h1>
        <p>Quyền lợi của khách hàng là ưu tiên hàng đầu</p>
      </div>

      <div className="policy-container">
        <div className="policy-content">
          <div className="policy-section">
            <h2>🔄 Điều kiện đổi trả</h2>
            <ul>
              <li>Sản phẩm bị lỗi từ nhà sản xuất</li>
              <li>Sản phẩm không đúng với đơn đặt hàng</li>
              <li>Sản phẩm bị hư hỏng trong quá trình vận chuyển</li>
              <li>Sản phẩm hết hạn sử dụng</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2>⏰ Thời gian đổi trả</h2>
            <div className="time-cards">
              <div className="time-card">
                <span className="time-number">30</span>
                <span className="time-label">phút</span>
                <p>Đối với sản phẩm tươi sống</p>
              </div>
              <div className="time-card">
                <span className="time-number">60</span>
                <span className="time-label">phút</span>
                <p>Đối với sản phẩm đã qua chế biến</p>
              </div>
              <div className="time-card">
                <span className="time-number">7</span>
                <span className="time-label">ngày</span>
                <p>Đối với sản phẩm đóng gói</p>
              </div>
            </div>
          </div>

          <div className="policy-section">
            <h2>📋 Quy trình đổi trả</h2>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Liên hệ hotline</h3>
                  <p>Gọi ngay 1900 1234 để thông báo vấn đề</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Cung cấp thông tin</h3>
                  <p>Mã đơn hàng, lý do, hình ảnh/video minh chứng</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Xác nhận đổi trả</h3>
                  <p>Flash Food xác nhận và xử lý trong 24h</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Hoàn tiền/Đổi món</h3>
                  <p>Hoàn tiền hoặc gửi món thay thế miễn phí</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;