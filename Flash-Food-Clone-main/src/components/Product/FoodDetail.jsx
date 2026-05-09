import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import './FoodDetail.scss';

const FoodDetail = () => {
  const { foodId } = useParams();
  const navigate = useNavigate();
  const { food_list, addToCart, getImageUrl, userName } = useContext(StoreContext);

  // 1. Tìm món ăn hiện tại
  const foodItem = food_list.find((item) => String(item._id) === String(foodId));

  // 2. Logic lọc 5 món gợi ý cùng Category
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    if (foodItem && food_list.length > 0) {
      const suggestions = food_list
        .filter(item => item.category === foodItem.category && String(item._id) !== String(foodId))
        .slice(0, 5);
      setRelatedProducts(suggestions);
    }
  }, [foodId, foodItem, food_list]);

  // Lấy tên người dùng để hiển thị thân thiện
  const displayName = userName || "bạn";

  if (food_list.length === 0) {
    return (
      <div className='loading-container'>
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }
  
  if (!foodItem) {
    return (
      <div className='error-container'>
        <div className="error-content">
          <div className="error-icon">🍽️</div>
          <h2>Rất tiếc {displayName}!</h2>
          <p>Chúng tôi không tìm thấy món ăn bạn đang tìm kiếm.</p>
          <div className="error-actions">
            <button className="btn-primary" onClick={() => navigate('/')}>
              🏠 Về trang chủ
            </button>
            <button className="btn-secondary" onClick={() => navigate('/#expl-menu')}>
              🍕 Xem thực đơn
            </button>
          </div>
          <div className="error-suggestion">
            <p>💡 Gợi ý: Món ăn có thể đã được cập nhật hoặc không còn trong danh sách.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='food-detail'>
      {/* KHỐI CHI TIẾT CHÍNH */}
      <div className='food-detail-container'>
        <div className='food-detail-left'>
          <img src={getImageUrl(foodItem.image)} alt={foodItem.name} />
        </div>

        <div className='food-detail-right'>
          <nav className="breadcrumb">
            <span onClick={() => navigate('/')}>Trang chủ</span> 
            <span className="separator">›</span>
            <span className="current">{foodItem.name}</span>
          </nav>
          
          <p className="category-tag">🍽️ {foodItem.category}</p>
          <h1 className='food-name'>{foodItem.name}</h1>
          
          <div className="rating-section">
            <div className="stars">★★★★★</div>
            <span className="rating-count">50+ đánh giá trên FlashFood</span>
          </div>

          <div className="status-section">
            <span className="status-open">● Đang mở cửa</span>
            <span className="time">06:00 - 21:00</span>
          </div>

          <div className="price-section">
            <span className="currency">₫</span>
            <span className="amount">{foodItem.price.toLocaleString()}</span>
          </div>

          <div className="service-info">
            <div className="info-item">
              <p className="label">PHÍ DỊCH VỤ</p>
              <p className="value highlight-orange">0.0% Phí dịch vụ</p>
            </div>
            <div className="info-item border-left">
              <p className="label">DỊCH VỤ BỞI</p>
              <p className="value highlight-black">FlashFood</p>
            </div>
          </div>

          <div className="description-box">
             <p className="label">MÔ TẢ MÓN ĂN</p>
             <p className='desc'>{foodItem.description || "Món ăn chuẩn vị Flash Food, được chế biến từ nguyên liệu tươi ngon mỗi ngày."}</p>
          </div>

          <button className="add-to-cart-btn" onClick={() => addToCart(foodItem._id)}>
            🛒 THÊM VÀO GIỎ HÀNG
          </button>
        </div>
      </div>

      {/* --- PHẦN GỢI Ý: 5 MÓN + 1 Ô XEM THÊM --- */}
      {relatedProducts.length > 0 && (
        <div className="related-products">
          <div className="related-header">
            <h2 className="related-title">Món ăn bạn có thể thích</h2>
            <span className="view-all-text" onClick={() => navigate('/#expl-menu')}>Xem tất cả</span>
          </div>
          
          <div className="related-grid">
            {relatedProducts.map((item) => (
              <div 
                key={item._id} 
                className="related-item-card" 
                onClick={() => navigate(`/product/${item._id}`)}
              >
                <div className="related-img-wrapper">
                  <img src={getImageUrl(item.image)} alt={item.name} />
                </div>
                <div className="related-info">
                  <h3 className="related-name">{item.name}</h3>
                  <p className="related-price">{item.price.toLocaleString()}đ</p>
                </div>
              </div>
            ))}

            <div className="view-more-card" onClick={() => navigate('/#expl-menu')}>
              <div className="view-more-content">
                <div className="plus-icon">+</div>
                <p>Xem thêm</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodDetail;