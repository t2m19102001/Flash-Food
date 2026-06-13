import "./Footer.scss";
import { assets } from "../../assets/assets";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Link tải ứng dụng thật (thay bằng link của bạn nếu cần)
  const googlePlayUrl = "https://play.google.com/store/apps/details?id=your.app.id";
  const appStoreUrl = "https://apps.apple.com/vn/app/your-app-id";

  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        {/* Cột 1: Logo & Giới thiệu */}
        <div className="footer-column">
          <img src={assets.logo} alt="Flash Food" className="footer-logo" />
          <p className="footer-description">
            Flash Food - Nền tảng giao đồ ăn nhanh chóng, tiện lợi và uy tín hàng đầu Việt Nam.
          </p>
          <div className="footer-social-icons">
            <a href="#" className="social-icon facebook">
              <img src={assets.facebook_icon} alt="Facebook" />
            </a>
            <a href="#" className="social-icon twitter">
              <img src={assets.twitter_icon} alt="Twitter" />
            </a>
            <a href="#" className="social-icon linkedin">
              <img src={assets.linkedin_icon} alt="LinkedIn" />
            </a>
          </div>
        </div>

        {/* Cột 2: Dịch vụ */}
        <div className="footer-column">
          <h3 className="footer-title">Dịch vụ</h3>
          <ul className="footer-links">
            <li><a href="#">Giao đồ ăn nhanh</a></li>
            <li><a href="#">Đi chợ hộ</a></li>
            <li><a href="#">Vận chuyển hàng hóa</a></li>
            <li><a href="#">Giao đồ ăn siêu tốc</a></li>
          </ul>
        </div>

        {/* Cột 3: Công ty */}
        <div className="footer-column">
          <h3 className="footer-title">Công ty</h3>
          <ul className="footer-links">
            <li><a href="/">Trang chủ</a></li>
            <li><a href="/about">Giới thiệu</a></li>
            <li><a href="/contact">Liên hệ</a></li>
            <li><a href="/careers">Tuyển dụng</a></li>
            <li><a href="/blog">Blog</a></li>
          </ul>
        </div>

        {/* Cột 4: Hỗ trợ */}
        <div className="footer-column">
          <h3 className="footer-title">Hỗ trợ</h3>
          <ul className="footer-links">
            <li><a href="/help-center">Trung tâm trợ giúp</a></li>
            <li><a href="/shipping-policy">Chính sách vận chuyển</a></li>
            <li><a href="/return-policy">Chính sách đổi trả</a></li>
            <li><a href="/terms-of-use">Điều khoản sử dụng</a></li>
          </ul>
        </div>

        {/* Cột 5: Liên hệ & Tải app */}
        <div className="footer-column">
          <h3 className="footer-title">Liên hệ</h3>
          <ul className="footer-contact">
            <li>
              <span className="contact-icon">📍</span>
              <span>123 Đường Học Tập, Quận 9, TP. Hồ Chí Minh</span>
            </li>
            <li>
              <span className="contact-icon">📞</span>
              <span>086 757 84xx</span>
            </li>
            <li>
              <span className="contact-icon">✉️</span>
              <div className="contact-emails">
                <span>25TX810016@student.hcmute.edu.vn</span>
                <span>25TX810012@student.hcmute.edu.vn</span>
              </div>
            </li>
          </ul>
          
          {/* Phần Tải App - đã sửa thành biểu tượng đặc trưng, khi bấm mở link tải */}
          <div className="app-download">
            <p className="app-title">📱 Tải App ngay!</p>
            <div className="app-download-platforms">
              {/* Google Play - biểu tượng đặc trưng */}
              <a 
                href={googlePlayUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="app-store-btn google-play-btn"
              >
                <img 
                  src={assets.google_play_icon || assets.play_store} 
                  alt="Google Play" 
                  className="store-icon"
                />
                <div className="store-btn-text">
                  <span className="store-small">Tải trên</span>
                  <span className="store-name">Google Play</span>
                </div>
              </a>
              
              {/* App Store - biểu tượng đặc trưng */}
              <a 
                href={appStoreUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="app-store-btn apple-store-btn"
              >
                <img 
                  src={assets.app_store_icon || assets.app_store} 
                  alt="App Store" 
                  className="store-icon"
                />
                <div className="store-btn-text">
                  <span className="store-small">Tải trên</span>
                  <span className="store-name">App Store</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p className="footer-copyright">
            © {currentYear} Flash Food. Được phát triển bởi Nhóm 8 - HCMUTE
          </p>
          <div className="footer-payment">
            <span className="payment-badge">Visa</span>
            <span className="payment-badge">Mastercard</span>
            <span className="payment-badge">MoMo</span>
            <span className="payment-badge">COD</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;