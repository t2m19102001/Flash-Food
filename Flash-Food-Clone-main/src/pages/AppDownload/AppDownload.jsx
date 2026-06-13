import React from 'react';
import './AppDownload.scss';
import { assets } from '../../assets/assets';

const AppDownload = () => {
    return (
        <div className="app-download-page">
            <div className="app-download-container">
                <div className="app-download-hero">
                    <div className="hero-icon">📱</div>
                    <h1>Flash Food App</h1>
                    <p>Ứng dụng giao đồ ăn nhanh chóng, tiện lợi</p>
                </div>

                <div className="app-download-content">
                    <div className="coming-soon-card">
                        <div className="coming-soon-icon">🚀</div>
                        <h2>Đang phát triển</h2>
                        <p>
                            Ứng dụng Flash Food đang được đội ngũ phát triển hoàn thiện 
                            với nhiều tính năng hiện đại, mang đến trải nghiệm tốt nhất cho khách hàng.
                        </p>
                        <div className="progress-bar">
                            <div className="progress-fill"></div>
                        </div>
                        <p className="progress-text">Tiến độ phát triển: 85%</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <span className="feature-icon">⚡</span>
                            <h3>Đặt hàng nhanh</h3>
                            <p>Chỉ với vài thao tác đơn giản</p>
                        </div>
                        <div className="feature-card">
                            <span className="feature-icon">📍</span>
                            <h3>Theo dõi đơn hàng</h3>
                            <p>Vị trí giao hàng realtime</p>
                        </div>
                        <div className="feature-card">
                            <span className="feature-icon">🎁</span>
                            <h3>Ưu đãi hấp dẫn</h3>
                            <p>Nhiều mã giảm giá độc quyền</p>
                        </div>
                        <div className="feature-card">
                            <span className="feature-icon">💳</span>
                            <h3>Thanh toán đa dạng</h3>
                            <p>COD, Ví MoMo, Thẻ tín dụng</p>
                        </div>
                    </div>

                    <div className="store-buttons">
                        <h3>Sắp ra mắt trên</h3>
                        <div className="store-buttons-group">
                            <button className="store-btn google-play" disabled>
                                <span className="store-icon">▶️</span>
                                <div className="store-text">
                                    <small>Google Play</small>
                                    <strong>COMING SOON</strong>
                                </div>
                            </button>
                            <button className="store-btn app-store" disabled>
                                <span className="store-icon">🍎</span>
                                <div className="store-text">
                                    <small>App Store</small>
                                    <strong>COMING SOON</strong>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="notification-box">
                        <p>📧 Đăng ký để nhận thông báo khi ứng dụng ra mắt</p>
                        <div className="email-subscribe">
                            <input type="email" placeholder="Nhập email của bạn" />
                            <button>Đăng ký</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppDownload;