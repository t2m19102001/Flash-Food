import { useContext, useState } from 'react'
import './FoodItem.scss'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'
import ReviewPopup from '../ReviewPopup/ReviewPopup'
import { useNavigate } from 'react-router-dom'

const FoodItem = ({ id, name, price, description, image }) => {

  const { cartItems, addToCart, removeFromCart, getImageUrl } = useContext(StoreContext)
  const [showReview, setShowReview] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const navigate = useNavigate()

  const handleNavigate = () => {
    navigate(`/product/${id}`)
    window.scrollTo(0, 0)
  }

  // Format giá tiền
  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + 'đ'
  }

  // Hiển thị toast notification
  const showNotification = (message, type = 'success') => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 2000)
  }

  // Xử lý thêm vào giỏ với animation
  const handleAddToCart = async () => {
    setIsAdding(true)
    addToCart(id)
    showNotification(` Đã thêm ${name} vào giỏ hàng!`)
    setTimeout(() => {
      setIsAdding(false)
    }, 300)
  }

  const handleRemoveFromCart = () => {
    removeFromCart(id)
    showNotification(`🗑️ Đã xóa ${name} khỏi giỏ hàng`, 'remove')
  }

  return (
    <>
      <div 
        className='food-item'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="food-item-container">
          <div className="food-item-image-wrapper">
            <img 
              className={`food-item-image ${isHovered ? 'hovered' : ''}`}
              src={getImageUrl(image)} 
              alt={name} 
              onClick={handleNavigate}
            />
            <div className="food-item-overlay" onClick={handleNavigate}>
              <span>🔍 Xem chi tiết</span>
            </div>
          </div>
          
          <div className="food-item-action">
            {!cartItems[id] ? (
              <button 
                className={`add-to-cart-btn ${isAdding ? 'adding' : ''}`}
                onClick={handleAddToCart}
                disabled={isAdding}
              >
                {isAdding ? (
                  <>
                    <span className="spinner-small"></span>
                    Đang thêm...
                  </>
                ) : (
                  <>
                    <img src={assets.add_icon_white} alt="Thêm vào giỏ" />
                    <span>Thêm vào giỏ</span>
                  </>
                )}
              </button>
            ) : (
              <div className='food-item-counter'>
                <button 
                  onClick={handleRemoveFromCart} 
                  className="counter-btn remove"
                >
                  <img src={assets.remove_icon_red} alt="Bớt" />
                </button>
                <span className="counter-number">{cartItems[id]}</span>
                <button 
                  onClick={handleAddToCart} 
                  className="counter-btn add"
                >
                  <img src={assets.add_icon_green} alt="Thêm" />
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="food-item-info">
          <div className="food-item-name-rating">
            <p onClick={handleNavigate} className="food-item-name">
              {name}
            </p>
            <div 
              className="food-item-rating" 
              onClick={() => setShowReview(true)}
              title="Xem đánh giá"
            >
              <img src={assets.rating_starts} alt="Đánh giá" />
              <span className="rating-count">(0)</span>
            </div>
          </div>
          
          <p className='food-item-desc'>{description}</p>
          
          <div className="food-item-price-wrapper">
            <span className="food-item-price">{formatPrice(price)}</span>
            {price > 100000 && <span className="price-badge">Hot 🔥</span>}
          </div>
        </div>

        {showReview && (
          <ReviewPopup
            foodId={id}
            foodName={name}
            onClose={() => setShowReview(false)}
          />
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className={`toast-notification ${showToast ? 'show' : ''}`}>
          <div className="toast-content">
            <span className="toast-icon">{toastMessage.includes('') ? '🎉' : '🗑️'}</span>
            <span className="toast-message">{toastMessage}</span>
          </div>
        </div>
      )}
    </>
  )
}

export default FoodItem