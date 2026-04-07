import { useState, useEffect, useContext } from 'react'
import './ReviewPopup.scss'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'

const ReviewPopup = ({ foodId, foodName, onClose }) => {
    const { url, token, userName } = useContext(StoreContext)
    const [reviews, setReviews] = useState([])
    const [averageRating, setAverageRating] = useState(0)
    const [totalReviews, setTotalReviews] = useState(0)
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`${url}/api/review/food/${foodId}`)
            if (response.data.success) {
                setReviews(response.data.reviews)
                setAverageRating(response.data.averageRating)
                setTotalReviews(response.data.totalReviews)
            }
        } catch (err) {
            console.error("Error fetching reviews:", err)
        }
    }

    useEffect(() => {
        fetchReviews()
    }, [foodId])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!token) {
            setError("Vui lòng đăng nhập để đánh giá")
            return
        }
        if (rating === 0) {
            setError("Vui lòng chọn số sao")
            return
        }

        setLoading(true)
        setError("")
        try {
            const response = await axios.post(
                `${url}/api/review/add`,
                { foodId, rating, comment },
                { headers: { token } }
            )
            if (response.data.success) {
                setRating(0)
                setComment("")
                fetchReviews()
            } else {
                setError(response.data.message)
            }
        } catch (err) {
            setError("Có lỗi xảy ra, vui lòng thử lại")
        } finally {
            setLoading(false)
        }
    }

    const renderStars = (count, size = 16) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} style={{ fontSize: size, color: i < count ? '#ffc107' : '#ddd' }}>
                &#9733;
            </span>
        ))
    }

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        })
    }

    return (
        <div className="review-popup-overlay" onClick={onClose}>
            <div className="review-popup" onClick={(e) => e.stopPropagation()}>
                <div className="review-popup-header">
                    <div>
                        <h2>Đánh giá</h2>
                        <p className="review-food-name">{foodName}</p>
                    </div>
                    <span className="review-close" onClick={onClose}>&times;</span>
                </div>

                <div className="review-summary">
                    <div className="review-avg">
                        <span className="avg-number">{averageRating}</span>
                        <div>
                            <div className="avg-stars">{renderStars(Math.round(averageRating), 20)}</div>
                            <span className="review-count">{totalReviews} đánh giá</span>
                        </div>
                    </div>
                </div>

                {token && (
                    <form className="review-form" onSubmit={handleSubmit}>
                        <p className="form-label">Đánh giá của bạn:</p>
                        <div className="star-input">
                            {Array.from({ length: 5 }, (_, i) => (
                                <span
                                    key={i}
                                    className={`star-select ${i < (hoverRating || rating) ? 'active' : ''}`}
                                    onClick={() => setRating(i + 1)}
                                    onMouseEnter={() => setHoverRating(i + 1)}
                                    onMouseLeave={() => setHoverRating(0)}
                                >
                                    &#9733;
                                </span>
                            ))}
                            {rating > 0 && <span className="rating-text">
                                {['', 'Tệ', 'Không hài lòng', 'Bình thường', 'Hài lòng', 'Tuyệt vời'][rating]}
                            </span>}
                        </div>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Chia sẻ trải nghiệm của bạn..."
                            rows={3}
                        />
                        {error && <p className="review-error">{error}</p>}
                        <button type="submit" disabled={loading}>
                            {loading ? "Đang gửi..." : "Gửi đánh giá"}
                        </button>
                    </form>
                )}

                <div className="review-list">
                    {reviews.length === 0 ? (
                        <p className="no-reviews">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                    ) : (
                        reviews.map((review) => (
                            <div key={review._id} className="review-item">
                                <div className="review-item-header">
                                    <div className="reviewer-info">
                                        <span className="reviewer-name">
                                            {review.userId?.name || "Ẩn danh"}
                                        </span>
                                        <span className="review-date">{formatDate(review.date)}</span>
                                    </div>
                                    <div className="review-stars">{renderStars(review.rating)}</div>
                                </div>
                                {review.comment && (
                                    <p className="review-comment">{review.comment}</p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default ReviewPopup
