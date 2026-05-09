import './Header.scss'
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleViewMenu = () => {
    // Cuộn đến phần thực đơn nếu đang ở trang chủ
    const menuSection = document.getElementById('expl-menu');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Nếu không tìm thấy (ở trang khác), chuyển về trang chủ rồi cuộn
      navigate('/');
      setTimeout(() => {
        const menuSectionAfterNav = document.getElementById('expl-menu');
        if (menuSectionAfterNav) {
          menuSectionAfterNav.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <div className='header'>
      <div className="header-overlay"></div>
      <div className="header-contents">
        <div className="header-badge">🍕 Flash Food</div>
        <h1>Đặt món <span className="highlight">yêu thích</span> của bạn<br />tại đây</h1>
        <p>Hàng ngàn món ngon từ các nhà hàng nổi tiếng, giao hàng nhanh chóng chỉ trong 30 phút</p>
        <div className="header-buttons">
          <button className="btn-primary" onClick={handleViewMenu}>
            🍽️ Xem thực đơn
          </button>
          <button className="btn-secondary" onClick={() => window.location.href = '/app-download'}>
            📱 Tải ứng dụng
          </button>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-number">1000+</span>
            <span className="stat-label">Món ăn</span>
          </div>
          <div className="stat">
            <span className="stat-number">500+</span>
            <span className="stat-label">Nhà hàng</span>
          </div>
          <div className="stat">
            <span className="stat-number">50k+</span>
            <span className="stat-label">Khách hàng</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header