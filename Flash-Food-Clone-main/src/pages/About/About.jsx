import React from 'react';
import './About.scss';
import { assets } from '../../assets/assets';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-hero">
        <h1>Về chúng tôi</h1>
        <p>Flash Food - Giao đồ ăn nhanh chóng, tiện lợi và uy tín</p>
      </div>

      <div className="about-container">
        <div className="about-section">
          <div className="about-image">
            <img src={assets.about_img} alt="About Flash Food" />
          </div>
          <div className="about-content">
            <h2>Câu chuyện của chúng tôi</h2>
            <p>
              Flash Food được thành lập vào năm 2024 với sứ mệnh thay đổi cách mọi người 
              đặt đồ ăn trực tuyến. Chúng tôi kết nối hàng ngàn nhà hàng, quán ăn với 
              khách hàng trên toàn thành phố.
            </p>
            <p>
              Với đội ngũ giao hàng chuyên nghiệp và công nghệ hiện đại, chúng tôi cam kết 
              mang đến trải nghiệm đặt đồ ăn nhanh chóng, tiện lợi và đáng tin cậy nhất.
            </p>
          </div>
        </div>

        <div className="stats-section">
          <h2>Flash Food bằng con số</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">1000+</span>
              <span className="stat-label">Đối tác nhà hàng</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">50,000+</span>
              <span className="stat-label">Đơn hàng mỗi ngày</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">500+</span>
              <span className="stat-label">Nhân viên giao hàng</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">4.8/5</span>
              <span className="stat-label">Đánh giá từ khách hàng</span>
            </div>
          </div>
        </div>

        <div className="mission-section">
          <div className="mission-card">
            <h3>🎯 Sứ mệnh</h3>
            <p>Mang bữa ăn ngon đến mọi nhà một cách nhanh chóng và tiện lợi nhất.</p>
          </div>
          <div className="mission-card">
            <h3>👁️ Tầm nhìn</h3>
            <p>Trở thành nền tảng giao đồ ăn hàng đầu Đông Nam Á vào năm 2030.</p>
          </div>
          <div className="mission-card">
            <h3>💎 Giá trị cốt lõi</h3>
            <p>Nhanh chóng - Tin cậy - Chất lượng - Đổi mới - Khách hàng là trung tâm.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;