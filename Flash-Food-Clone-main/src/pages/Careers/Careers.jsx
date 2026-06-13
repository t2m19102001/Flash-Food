import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Careers.scss';

const Careers = () => {
  const navigate = useNavigate();
  const [selectedJob, setSelectedJob] = useState(null);

  const jobs = [
    {
      id: 1,
      title: 'Nhân viên giao hàng',
      type: 'Toàn thời gian',
      salary: '10-15 triệu',
      location: 'TP.HCM',
      description: 'Tìm kiếm ứng viên năng động, có phương tiện di chuyển, am hiểu đường phố TP.HCM.',
      requirements: ['Có bằng lái xe máy', 'Có phương tiện cá nhân', 'Sức khỏe tốt']
    },
    {
      id: 2,
      title: 'Chuyên viên chăm sóc khách hàng',
      type: 'Toàn thời gian',
      salary: '8-12 triệu',
      location: 'TP.HCM',
      description: 'Xử lý các khiếu nại, hỗ trợ khách hàng qua điện thoại và chat.',
      requirements: ['Giao tiếp tốt', 'Kỹ năng xử lý tình huống', 'Tiếng Anh cơ bản']
    },
    {
      id: 3,
      title: 'Developer Full Stack',
      type: 'Toàn thời gian',
      salary: '20-30 triệu',
      location: 'TP.HCM (Remote)',
      description: 'Phát triển và bảo trì hệ thống web/app của Flash Food.',
      requirements: ['ReactJS, Node.js', 'MongoDB, Express', 'Kinh nghiệm 2+ năm']
    },
    {
      id: 4,
      title: 'Nhân viên Marketing',
      type: 'Bán thời gian',
      salary: '8-10 triệu',
      location: 'TP.HCM',
      description: 'Lên kế hoạch và triển khai các chiến dịch marketing online.',
      requirements: ['Content creator', 'Quản lý fanpage', 'Chạy quảng cáo']
    },
    {
      id: 5,
      title: 'Thiết kế đồ họa',
      type: 'Toàn thời gian',
      salary: '12-18 triệu',
      location: 'TP.HCM',
      description: 'Thiết kế banner, poster, các ấn phẩm truyền thông.',
      requirements: ['Thành thạo Photoshop, Illustrator', 'Có portfolio']
    }
  ];

  const handleApply = (job) => {
    setSelectedJob(job);
    // Chuyển đến form ứng tuyển
    navigate('/apply', { state: { job } });
  };

  const handleViewDetails = (job) => {
    setSelectedJob(job);
    // Hiển thị modal hoặc chuyển trang chi tiết
    navigate(`/careers/${job.id}`, { state: { job } });
  };

  return (
    <div className="careers-page">
      <div className="careers-hero">
        <div className="hero-content">
          <h1>Gia nhập đội ngũ Flash Food</h1>
          <p>Cùng chúng tôi tạo ra những trải nghiệm tuyệt vời</p>
          <div className="hero-stats">
            <span>🎯 10+ vị trí đang mở</span>
            <span>👥 500+ nhân viên</span>
            <span>🏆 Top 10 nơi làm việc tốt nhất</span>
          </div>
        </div>
      </div>

      <div className="careers-container">
        <div className="careers-intro">
          <h2>Tại sao chọn Flash Food?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <span className="benefit-icon">🏢</span>
              <h3>Môi trường năng động</h3>
              <p>Làm việc trong môi trường trẻ trung, sáng tạo, cơ hội phát triển bản thân</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">💰</span>
              <h3>Lương thưởng hấp dẫn</h3>
              <p>Thu nhập cạnh tranh + thưởng theo hiệu suất + thưởng cuối năm</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">📈</span>
              <h3>Cơ hội thăng tiến</h3>
              <p>Lộ trình phát triển rõ ràng, đánh giá năng lực định kỳ</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">🍱</span>
              <h3>Phúc lợi hấp dẫn</h3>
              <p>Ăn trưa miễn phí, bảo hiểm sức khỏe, du lịch hàng năm</p>
            </div>
          </div>
        </div>

        <div className="jobs-section">
          <h2>Vị trí đang tuyển</h2>
          <div className="jobs-list">
            {jobs.map((job) => (
              <div className="job-card" key={job.id}>
                <div className="job-info">
                  <h3>{job.title}</h3>
                  <div className="job-meta">
                    <span className="job-type">📋 {job.type}</span>
                    <span className="job-salary">💰 {job.salary}</span>
                    <span className="job-location">📍 {job.location}</span>
                  </div>
                  <p className="job-desc">{job.description}</p>
                </div>
                <div className="job-actions">
                  <button className="apply-btn" onClick={() => handleApply(job)}>
                    Ứng tuyển ngay →
                  </button>
                  <button className="details-btn" onClick={() => handleViewDetails(job)}>
                    Chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="careers-contact">
          <h3>Không tìm thấy vị trí phù hợp?</h3>
          <p>Hãy gửi CV của bạn cho chúng tôi, chúng tôi sẽ liên hệ khi có cơ hội phù hợp</p>
          <button className="submit-cv-btn" onClick={() => navigate('/contact')}>
            Gửi CV ứng tuyển
          </button>
        </div>
      </div>
    </div>
  );
};

export default Careers;