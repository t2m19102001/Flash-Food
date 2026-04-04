import { useContext, useState } from 'react'
import './FoodItem.scss'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'
import ReviewPopup from '../ReviewPopup/ReviewPopup'

const FoodItem = ({ id, name, price, description, image }) => {

  const { cartItems, addToCart, removeFromCart } = useContext(StoreContext)
  const [showReview, setShowReview] = useState(false)

  return (
    <div className='food-item'>
      <div className="food-item-container">
        <img className='food-item-image' src={image} alt="" />
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
          <p>{name}</p>
          <img
            src={assets.rating_starts}
            alt=""
            className="rating-clickable"
            onClick={() => setShowReview(true)}
            title="Xem đánh giá"
          />
        </div>
        <p className='food-item-desc'>{description}</p>
        <p className='food-item-price'>{price} VNĐ</p>
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