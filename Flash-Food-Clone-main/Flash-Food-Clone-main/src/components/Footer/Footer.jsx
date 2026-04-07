import "./Footer.scss";
import { assets } from "../../assets/assets";
const Footer = () => {
  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
          <img src={assets.logo} alt="" />
          <p>123 Đường Học Tập , Quận 9, Tp. Hồ Chí Minh</p>
          <div className="footer-social-icons">
            <img src={assets.facebook_icon} alt="" />
            <img src={assets.twitter_icon} alt="" />
            <img src={assets.linkedin_icon} alt="" />
          </div>
        </div>
        <div className="footer-content-center-1">
          <h2>Dịch Vụ</h2>
          <ul>
            <li>Flash Food - giao đồ ăn</li>
            <li>Flash Food - đi chợ</li>
            <li>Flash Food - vận chuyển</li>
            <li>Flash Food - giao đồ ăn siêu tốc</li>
          </ul>
        </div>
        <div className="footer-content-center-2">
          <h2>Công ty</h2>
          <ul>
            <li>Trang chủ</li>
            <li>Liên lạc</li>
            <li>Vận chuyển</li>
            <li>Chính sách</li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>Liên lạc</h2>
          <ul>
            <li>Sđt: 086-757-84**</li>
            <li>Email:25TX810016@student.hcmute.edu.vn</li>
            <li>Email:25TX810012@student.hcmute.edu.vn</li>
            <li>Email:25TX810009@student.hcmute.edu.vn</li>
          </ul>
        </div>
        <div className="app-download" id="app-download">
          <p>
            Tải App xuống để có trải nghiêm tốt hơn <br />
            Flash Food App:
          </p>
          <div className="app-download-platforms">
            <img src={assets.play_store} alt="" />
            <img src={assets.app_store} alt="" />
          </div>
        </div>
      </div>
     
      <p className="footer-copyright">
        Copyright2024 @ FlashFoood.abc - By Nhóm 8 - HCMUTE
      </p>
    </div>
  );
};

export default Footer;
