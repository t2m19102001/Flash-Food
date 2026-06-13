import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Blog.scss';

const Blog = () => {
  const navigate = useNavigate();

  const posts = [
    {
      id: 1,
      title: 'Top 10 món ăn được đặt nhiều nhất tháng',
      date: '15/05/2024',
      author: 'Flash Food Team',
      excerpt: 'Khám phá những món ăn được yêu thích nhất trên Flash Food, từ cơm tấm, phở, bánh mì đến các món ăn vặt hấp dẫn...',
      content: 'Chi tiết bài viết Top 10 món ăn được đặt nhiều nhất tháng...',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500',
      category: 'Ẩm thực'
    },
    {
      id: 2,
      title: 'Bí quyết đặt đồ ăn nhanh và tiết kiệm',
      date: '10/05/2024',
      author: 'Flash Food Team',
      excerpt: 'Mẹo nhỏ giúp bạn đặt đồ ăn nhanh chóng và nhận nhiều ưu đãi từ Flash Food...',
      content: 'Chi tiết bài viết về bí quyết đặt đồ ăn...',
      image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=500',
      category: 'Mẹo hay'
    },
    {
      id: 3,
      title: 'Flash Food ra mắt tính năng mới',
      date: '05/05/2024',
      author: 'Flash Food Team',
      excerpt: 'Cập nhật những tính năng mới giúp trải nghiệm đặt đồ ăn tốt hơn bao giờ hết...',
      content: 'Chi tiết về các tính năng mới...',
      image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=500',
      category: 'Cập nhật'
    },
    {
      id: 4,
      title: 'Xu hướng ẩm thực 2024: Healthy Food lên ngôi',
      date: '28/04/2024',
      author: 'Flash Food Team',
      excerpt: 'Các món ăn healthy đang trở thành xu hướng được nhiều người trẻ yêu thích...',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500',
      category: 'Xu hướng'
    },
    {
      id: 5,
      title: 'Review top 5 nhà hàng lẩu ngon nhất Sài Gòn',
      date: '20/04/2024',
      author: 'Flash Food Team',
      excerpt: 'Những địa chỉ lẩu ngon, chất lượng, giá cả phải chăng tại Sài Gòn...',
      image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500',
      category: 'Review'
    },
    {
      id: 6,
      title: 'Cách sử dụng mã giảm giá Flash Food hiệu quả',
      date: '15/04/2024',
      author: 'Flash Food Team',
      excerpt: 'Hướng dẫn chi tiết cách săn mã giảm giá và áp dụng để tiết kiệm tối đa...',
      image: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=500',
      category: 'Hướng dẫn'
    }
  ];

  const handleReadMore = (post) => {
    // Chuyển đến trang chi tiết bài viết, truyền state qua navigate
    navigate(`/blog/${post.id}`, { state: { post } });
  };

  return (
    <div className="blog-page">
      <div className="blog-hero">
        <div className="hero-content">
          <h1>Blog ẩm thực</h1>
          <p>Những bài viết thú vị về ẩm thực và Flash Food</p>
          <div className="hero-stats">
            <span>📝 {posts.length} bài viết</span>
            <span>👥 50k+ độc giả</span>
            <span>🔥 Cập nhật hàng tuần</span>
          </div>
        </div>
      </div>

      <div className="blog-container">
        <div className="blog-header">
          <h2>Bài viết mới nhất</h2>
          <div className="blog-categories">
            <button className="category-btn active">Tất cả</button>
            <button className="category-btn">Ẩm thực</button>
            <button className="category-btn">Mẹo hay</button>
            <button className="category-btn">Review</button>
            <button className="category-btn">Cập nhật</button>
          </div>
        </div>

        <div className="blog-grid">
          {posts.map((post) => (
            <div className="blog-card" key={post.id}>
              <div className="card-image">
                <img src={post.image} alt={post.title} />
                <span className="card-category">{post.category}</span>
              </div>
              <div className="blog-content">
                <div className="post-meta">
                  <span className="post-date">📅 {post.date}</span>
                  <span className="post-author">✍️ {post.author}</span>
                </div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <div className="blog-footer">
                  <button 
                    className="read-more" 
                    onClick={() => handleReadMore(post)}
                  >
                    Đọc tiếp <span className="arrow">→</span>
                  </button>
                  <div className="post-stats">
                    <span>❤️ 234</span>
                    <span>💬 45</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="blog-pagination">
          <button className="pagination-btn active">1</button>
          <button className="pagination-btn">2</button>
          <button className="pagination-btn">3</button>
          <button className="pagination-btn next">Tiếp theo →</button>
        </div>
      </div>
    </div>
  );
};

export default Blog;