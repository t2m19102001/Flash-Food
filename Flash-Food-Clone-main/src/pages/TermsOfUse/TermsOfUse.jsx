import React, { useRef } from 'react';
import './TermsOfUse.scss';

const TermsOfUse = () => {
  // Tạo ref cho từng section
  const sectionRefs = {
    intro: useRef(null),
    register: useRef(null),
    order: useRef(null),
    delivery: useRef(null),
    cancel: useRef(null),
    security: useRef(null),
    legal: useRef(null)
  };

  // Hàm cuộn đến section tương ứng
  const scrollToSection = (sectionKey) => {
    sectionRefs[sectionKey]?.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  const menuItems = [
    { id: 'intro', label: '1. Giới thiệu', ref: sectionRefs.intro },
    { id: 'register', label: '2. Đăng ký tài khoản', ref: sectionRefs.register },
    { id: 'order', label: '3. Đặt hàng & Thanh toán', ref: sectionRefs.order },
    { id: 'delivery', label: '4. Giao hàng', ref: sectionRefs.delivery },
    { id: 'cancel', label: '5. Hủy đơn & Đổi trả', ref: sectionRefs.cancel },
    { id: 'security', label: '6. Bảo mật thông tin', ref: sectionRefs.security },
    { id: 'legal', label: '7. Trách nhiệm pháp lý', ref: sectionRefs.legal }
  ];

  const [activeSection, setActiveSection] = React.useState('intro');

  // Theo dõi scroll để active menu
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      
      for (const [key, ref] of Object.entries(sectionRefs)) {
        if (ref.current) {
          const { offsetTop, offsetHeight } = ref.current;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(key);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="terms-of-use">
      <div className="terms-hero">
        <h1>Điều khoản sử dụng</h1>
        <p>Vui lòng đọc kỹ trước khi sử dụng dịch vụ</p>
      </div>

      <div className="terms-container">
        <div className="terms-content">
          <div className="terms-sidebar">
            <ul>
              {menuItems.map((item) => (
                <li 
                  key={item.id}
                  className={activeSection === item.id ? 'active' : ''}
                  onClick={() => scrollToSection(item.id)}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="terms-main">
            <div className="terms-section" ref={sectionRefs.intro}>
              <h2>1. Giới thiệu</h2>
              <p>Chào mừng bạn đến với Flash Food - nền tảng giao đồ ăn trực tuyến hàng đầu Việt Nam. Bằng việc sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản dưới đây.</p>
              <p>Flash Food cam kết mang đến trải nghiệm đặt đồ ăn trực tuyến tốt nhất với đa dạng nhà hàng, món ăn và dịch vụ giao hàng nhanh chóng.</p>
            </div>

            <div className="terms-section" ref={sectionRefs.register}>
              <h2>2. Đăng ký tài khoản</h2>
              <p>Để sử dụng dịch vụ, bạn cần đăng ký tài khoản với thông tin chính xác và đầy đủ. Bạn chịu trách nhiệm bảo mật thông tin tài khoản của mình.</p>
              <ul>
                <li>Tuổi tối thiểu: 18 tuổi</li>
                <li>Thông tin cá nhân phải chính xác</li>
                <li>Mỗi người chỉ được có một tài khoản</li>
                <li>Không chia sẻ tài khoản cho người khác</li>
              </ul>
            </div>

            <div className="terms-section" ref={sectionRefs.order}>
              <h2>3. Đặt hàng & Thanh toán</h2>
              <p>Khi đặt hàng, bạn cam kết thanh toán đầy đủ số tiền của đơn hàng. Flash Food có quyền từ chối đơn hàng nếu phát hiện thông tin gian lận.</p>
              <p>Các phương thức thanh toán được chấp nhận: Thanh toán khi nhận hàng (COD), Thẻ tín dụng/ghi nợ (Stripe), Ví MoMo.</p>
            </div>

            <div className="terms-section" ref={sectionRefs.delivery}>
              <h2>4. Giao hàng</h2>
              <p>Thời gian giao hàng chỉ mang tính ước tính. Flash Food không chịu trách nhiệm về sự chậm trễ do các yếu tố khách quan (thời tiết, kẹt xe, thiên tai...).</p>
              <p>Phí giao hàng được tính dựa trên khoảng cách và hiển thị rõ ràng trước khi bạn đặt hàng.</p>
            </div>

            <div className="terms-section" ref={sectionRefs.cancel}>
              <h2>5. Hủy đơn & Đổi trả</h2>
              <p>Khách hàng có thể hủy đơn trong vòng 5 phút sau khi đặt. Chính sách đổi trả áp dụng theo quy định của từng nhà hàng đối tác.</p>
              <p>Đối với sản phẩm lỗi từ nhà hàng, Flash Food sẽ hỗ trợ đổi trả miễn phí trong vòng 30 phút kể từ khi nhận hàng.</p>
            </div>

            <div className="terms-section" ref={sectionRefs.security}>
              <h2>6. Bảo mật thông tin</h2>
              <p>Flash Food cam kết bảo vệ thông tin cá nhân của khách hàng. Chúng tôi không chia sẻ thông tin cho bên thứ ba khi chưa có sự đồng ý.</p>
              <p>Mọi thông tin thanh toán đều được mã hóa và bảo mật theo tiêu chuẩn quốc tế.</p>
            </div>

            <div className="terms-section" ref={sectionRefs.legal}>
              <h2>7. Trách nhiệm pháp lý</h2>
              <p>Flash Food không chịu trách nhiệm về bất kỳ thiệt hại nào phát sinh từ việc sử dụng dịch vụ ngoài các quy định của pháp luật.</p>
              <p>Mọi tranh chấp sẽ được giải quyết theo pháp luật Việt Nam tại Tòa án có thẩm quyền tại TP. Hồ Chí Minh.</p>
            </div>

            <div className="terms-footer">
              <p>Cập nhật lần cuối: 15/05/2024</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;