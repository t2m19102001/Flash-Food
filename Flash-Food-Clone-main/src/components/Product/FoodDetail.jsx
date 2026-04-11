import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import './FoodDetail.scss';

const FoodDetail = () => {
  const { foodId } = useParams();
  const navigate = useNavigate();
  const { food_list, addToCart, getImageUrl } = useContext(StoreContext);

  // 1. Tìm món ăn hiện tại
  const foodItem = food_list.find((item) => String(item._id) === String(foodId));

  // 2. Logic lọc 5 món gợi ý cùng Category
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0); // Cuộn lên đầu khi đổi món
    
    if (foodItem && food_list.length > 0) {
      const suggestions = food_list
        .filter(item => item.category === foodItem.category && String(item._id) !== String(foodId))
        .slice(0, 5); // Chỉ lấy đúng 5 món
      setRelatedProducts(suggestions);
    }
  }, [foodId, foodItem, food_list]);

  if (food_list.length === 0) return <div className='loading'>Đang tải dữ liệu...</div>;
  if (!foodItem) return <div className='error'>Không tìm thấy món ăn Lâm ơi!</div>;

  return (
    <div className='food-detail'>
      {/* KHỐI CHI TIẾT CHÍNH */}
      <div className='food-detail-container'>
        <div className='food-detail-left'>
          <img src={getImageUrl(foodItem.image)} alt={foodItem.name} />
        </div>

        <div className='food-detail-right'>
          <nav className="breadcrumb">
            <span onClick={() => navigate('/')}>Home</span> » TP. HCM » {foodItem.name}
          </nav>
          
          <p className="category-tag">MÓN ĂN / ĐỒ UỐNG</p>
          <h1 className='food-name'>{foodItem.name}</h1>
          
          <div className="rating-section">
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <span className="rating-count">50+ đánh giá trên FlashFood</span>
          </div>

          <div className="status-section">
            <span className="status-open">● Mở cửa</span>
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
             <p className='desc'>{foodItem.description || "Món ăn chuẩn vị Flash Food."}</p>
          </div>

          <button className="add-to-cart-btn" onClick={() => addToCart(foodItem._id)}>
            THÊM VÀO GIỎ HÀNG
          </button>
        </div>
      </div>

      {/* --- PHẦN GỢI Ý: 5 MÓN + 1 Ô XEM THÊM --- */}
      {relatedProducts.length > 0 && (
        <div className="related-products">
          <div className="related-header">
            <h2 className="related-title">Món ăn bạn có thể thích</h2>
            <span className="view-all-text" onClick={() => navigate('/menu')}>Xem tất cả</span>
          </div>
          
          <div className="related-grid">
            {relatedProducts.map((item) => (
              <div 
                key={item._id} 
                className="related-item-card" 
                onClick={() => navigate(`/food/${item._id}`)}
              >
                <div className="related-img-wrapper">
                  <img src={getImageUrl(item.image)} alt={item.name} />
                </div>
                <div className="related-info">
                  <h3 className="related-name">{item.name}</h3>
                  <p className="related-price">₫{item.price.toLocaleString()}</p>
                </div>
              </div>
            ))}

            {/* Ô XEM THÊM (VỊ TRÍ THỨ 6) */}
            <div className="view-more-card" onClick={() => navigate('/menu')}>
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