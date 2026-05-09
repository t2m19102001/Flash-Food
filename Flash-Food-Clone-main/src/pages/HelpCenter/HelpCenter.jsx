import React, { useState } from 'react';
import './HelpCenter.scss';

const HelpCenter = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: 'Làm thế nào để đặt hàng trên Flash Food?',
      answer: 'Bạn chỉ cần chọn món ăn yêu thích, thêm vào giỏ hàng, sau đó nhập địa chỉ giao hàng và thanh toán. Đơn hàng sẽ được giao đến bạn trong vòng 30-45 phút.'
    },
    {
      id: 2,
      question: 'Phí giao hàng được tính như thế nào?',
      answer: 'Phí giao hàng được tính dựa trên khoảng cách từ nhà hàng đến địa chỉ của bạn. Mức phí tối thiểu là 15,000đ và tối đa là 35,000đ.'
    },
    {
      id: 3,
      question: 'Tôi có thể hủy đơn hàng không?',
      answer: 'Có, bạn có thể hủy đơn hàng trong vòng 5 phút sau khi đặt. Sau thời gian đó, đơn hàng đã được xác nhận và không thể hủy.'
    },
    {
      id: 4,
      question: 'Phương thức thanh toán nào được chấp nhận?',
      answer: 'Chúng tôi chấp nhận thanh toán khi nhận hàng (COD), thanh toán qua thẻ tín dụng/ghi nợ (Stripe), và thanh toán qua ví MoMo.'
    },
    {
      id: 5,
      question: 'Làm sao để theo dõi đơn hàng của tôi?',
      answer: 'Bạn có thể theo dõi đơn hàng trong mục "Đơn hàng của tôi" sau khi đăng nhập. Trạng thái đơn hàng sẽ được cập nhật liên tục.'
    },
    {
      id: 6,
      question: 'Tôi có thể đặt hàng trước không?',
      answer: 'Có, bạn có thể đặt hàng trước từ 1-7 ngày. Chỉ cần chọn thời gian giao hàng mong muốn trong phần đặt hàng.'
    }
  ];

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="help-center">
      <div className="help-hero">
        <h1>Trung tâm trợ giúp</h1>
        <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7</p>
      </div>

      <div className="help-container">
        <div className="help-grid">
          <div className="help-sidebar">
            <div className="contact-card">
              <h3>📞 Liên hệ hỗ trợ</h3>
              <div className="contact-item">
                <span className="icon">📱</span>
                <div>
                  <strong>Hotline:</strong>
                  <p>1900 1234</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="icon">✉️</span>
                <div>
                  <strong>Email:</strong>
                  <p>support@flashfood.com</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="icon">💬</span>
                <div>
                  <strong>Chat trực tiếp:</strong>
                  <p>8:00 - 22:00 hàng ngày</p>
                </div>
              </div>
            </div>

            <div className="faq-categories">
              <h3>Danh mục</h3>
              <ul>
                <li className="active">Tất cả câu hỏi</li>
                <li>Đặt hàng & Thanh toán</li>
                <li>Giao hàng</li>
                <li>Tài khoản & Bảo mật</li>
                <li>Khuyến mãi & Ưu đãi</li>
              </ul>
            </div>
          </div>

          <div className="faq-section">
            <h2>Câu hỏi thường gặp</h2>
            <div className="faq-list">
              {faqs.map((faq) => (
                <div key={faq.id} className={`faq-item ${openFaq === faq.id ? 'open' : ''}`}>
                  <div className="faq-question" onClick={() => toggleFaq(faq.id)}>
                    <span>{faq.question}</span>
                    <span className="faq-icon">{openFaq === faq.id ? '−' : '+'}</span>
                  </div>
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;