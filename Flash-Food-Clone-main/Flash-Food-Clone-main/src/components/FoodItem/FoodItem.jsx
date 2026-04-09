import { useContext, useState } from 'react'
import './FoodItem.scss'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'
import ReviewPopup from '../ReviewPopup/ReviewPopup'
import { useNavigate } from 'react-router-dom' // Bước 1: Import useNavigate

const FoodItem = ({ id, name, price, description, image, rating, address }) => {

  const { cartItems, addToCart, removeFromCart, getImageUrl } = useContext(StoreContext) // Lấy getImageUrl từ Context
  const [showReview, setShowReview] = useState(false)
  const navigate = useNavigate() // Bước 2: Khởi tạo navigate

  // Hàm để chuyển trang khi click vào ảnh hoặc tên
  const handleNavigate = () => {
    navigate(`/product/${id}`); // Điều hướng đến Route đã khai báo trong App.jsx
    window.scrollTo(0, 0); // Cuộn lên đầu trang cho đẹp
  }

  return (
    <div className='food-item'>
      <div className="food-item-container">
        {/* Bước 3: Sử dụng getImageUrl để hiện ảnh từ database và thêm sự kiện click */}
        <img
          className='food-item-image'
          src={getImageUrl(image)}
          alt={name}
          onClick={handleNavigate}
          style={{ cursor: 'pointer' }}
        />
        {
          !cartItems[id]
            ? <img className='add' onClick={() => addToCart(id)} src={assets.add_icon_white} />
            : <div className='food-item-counter'>
              <img onClick={() => removeFromCart(id)} src={assets.remove_icon_red} />
              <p>{cartItems[id]}</p>
              <img onClick={() => addToCart(id)} src={assets.add_icon_green} />
            </div>
        }
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          {/* Bước 4: Cho phép click vào tên món ăn để xem chi tiết */}
          <p onClick={handleNavigate} style={{ cursor: 'pointer' }}>{name}</p>
          <img
            src={assets.rating_starts}
            alt=""
            className="rating-clickable"
            onClick={() => setShowReview(true)}
            title="Xem đánh giá"
          />
        </div>
        <p className='food-item-desc'>{description}</p>
        {rating && <p className='food-item-rating'>⭐ {rating}</p>}
        {address && <p className='food-item-address'>📍 {address}</p>}
        {/* Hiển thị giá có dấu phân cách nghìn cho chuyên nghiệp */}
        <p className='food-item-price'>{price.toLocaleString()} VNĐ</p>
      </div>

      {showReview && (
        <ReviewPopup
          foodId={id}
          foodName={name}
          onClose={() => setShowReview(false)}
        />
      )}
    </div>
  )
}

export default FoodItem