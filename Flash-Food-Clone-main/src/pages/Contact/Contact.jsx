import React, { useState } from 'react';
import axios from 'axios';
import './Contact.scss';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Xóa thông báo khi user bắt đầu nhập lại
    if (responseMessage.text) setResponseMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate cơ bản
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setResponseMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin!' });
      return;
    }
    
    // Validate email
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(formData.email)) {
      setResponseMessage({ type: 'error', text: 'Email không hợp lệ!' });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post('/api/contact/submit', formData);
      
      if (response.data.success) {
        setResponseMessage({ type: 'success', text: response.data.message });
        // Reset form
        setFormData({ name: '', email: '', subject: '', message: '' });
        
        // Tự động xóa thông báo sau 5 giây
        setTimeout(() => {
          setResponseMessage({ type: '', text: '' });
        }, 5000);
      } else {
        setResponseMessage({ type: 'error', text: response.data.message || 'Gửi thất bại!' });
      }
    } catch (error) {
      console.error('Contact error:', error);
      setResponseMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Lỗi kết nối! Vui lòng thử lại sau.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <h1>Liên hệ với chúng tôi</h1>
        <p>Chúng tôi luôn sẵn sàng lắng nghe bạn</p>
      </div>

      <div className="contact-container">
        <div className="contact-info">
          <h2>Thông tin liên hệ</h2>
          <div className="info-item">
            <span className="info-icon">📍</span>
            <div>
              <strong>Địa chỉ:</strong>
              <p>123 Đường Học Tập, Quận 9, TP. Hồ Chí Minh</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">📞</span>
            <div>
              <strong>Điện thoại:</strong>
              <p>086 757 84xx</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">✉️</span>
            <div>
              <strong>Email:</strong>
              <p>support@flashfood.com</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">⏰</span>
            <div>
              <strong>Giờ làm việc:</strong>
              <p>Thứ 2 - Chủ nhật: 8:00 - 22:00</p>
            </div>
          </div>
        </div>

        <div className="contact-form">
          <h2>Gửi tin nhắn cho chúng tôi</h2>
          
          {responseMessage.text && (
            <div className={`alert-message ${responseMessage.type}`}>
              {responseMessage.type === 'success' ? '✅' : '❌'} {responseMessage.text}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Họ và tên *"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email *"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <input
              type="text"
              name="subject"
              placeholder="Tiêu đề *"
              value={formData.subject}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <textarea
              name="message"
              rows="5"
              placeholder="Nội dung tin nhắn *"
              value={formData.message}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Đang gửi...
                </>
              ) : (
                'Gửi tin nhắn'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;