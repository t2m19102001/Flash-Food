import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './ReviewList.scss';

const ReviewList = ({ foodId }) => {
  const { url, isAuthenticated, userId, getImageUrl } = useContext(StoreContext);
  
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${url}/api/review/food/${foodId}?page=1&limit=20`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.totalReviews || 0);
        
        if (isAuthenticated && userId) {
          const myReview = data.reviews?.find(r => r.userId?._id === userId);
          setUserReview(myReview || null);
        }
      }
    } catch (error) {
      console.error('Lỗi lấy review:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (foodId) {
      fetchReviews();
    }
  }, [foodId, isAuthenticated]);
  
  // 🔥 SỬA: Lấy token trực tiếp từ localStorage
  const getToken = () => {
    return localStorage.getItem("token");
  };
  
  const handleAddReview = async (e) => {
    e.preventDefault();
    
    const token = getToken();
    console.log("🔑 Token từ localStorage:", token);
    
    if (!isAuthenticated || !token) {
      alert('Vui lòng đăng nhập để đánh giá');
      return;
    }
    
    if (!comment.trim()) {
      alert('Vui lòng nhập nội dung đánh giá');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`${url}/api/review/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ foodId, rating, comment: comment.trim() })
      });
      
      console.log("📡 Response status:", response.status);
      const data = await response.json();
      console.log("📦 Response data:", data);
      
      if (response.status === 401) {
        alert('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        localStorage.removeItem("token");
        window.location.reload();
        return;
      }
      
      if (data.success) {
        alert('Đánh giá thành công!');
        setShowForm(false);
        setRating(5);
        setComment('');
        fetchReviews();
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Lỗi thêm review:', error);
      alert('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditReview = async (e) => {
    e.preventDefault();
    
    const token = getToken();
    if (!token) {
      alert('Vui lòng đăng nhập lại');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`${url}/api/review/edit/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment: comment.trim() })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Cập nhật đánh giá thành công!');
        setShowForm(false);
        setEditingId(null);
        setRating(5);
        setComment('');
        fetchReviews();
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Lỗi sửa review:', error);
      alert('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteReview = async (reviewId) => {
    const token = getToken();
    if (!token) {
      alert('Vui lòng đăng nhập lại');
      return;
    }
    
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    try {
      const response = await fetch(`${url}/api/review/delete/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        alert('Xóa đánh giá thành công!');
        fetchReviews();
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Lỗi xóa review:', error);
      alert('Có lỗi xảy ra, vui lòng thử lại');
    }
  };
  
  const renderStars = (stars, size = 'small') => {
    const starArray = [];
    for (let i = 1; i <= 5; i++) {
      starArray.push(
        <span key={i} className={`star ${i <= stars ? 'filled' : ''} ${size}`}>
          ★
        </span>
      );
    }
    return starArray;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };
  
  const getAvatarUrl = (imageFileName) => {
    if (!imageFileName) return "";
    if (imageFileName.startsWith("http")) return imageFileName;
    return `${url}/images/${imageFileName}`;
  };
  
  if (loading) {
    return (
      <div className="review-section">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải đánh giá...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="review-section">
      <div className="review-header">
        <div className="rating-summary">
          <div className="average-rating">
            <span className="rating-number">{averageRating.toFixed(1)}</span>
            <div className="stars-container">{renderStars(Math.round(averageRating), 'medium')}</div>
            <span className="total-reviews">({totalReviews} đánh giá)</span>
          </div>
          
          {isAuthenticated && !userReview && !showForm && (
            <button className="write-review-btn" onClick={() => setShowForm(true)}>
              ✍️ Viết đánh giá
            </button>
          )}
          
          {isAuthenticated && userReview && !showForm && (
            <div className="my-review">
              <span>Bạn đã đánh giá: {renderStars(userReview.rating)}</span>
              <button className="edit-btn" onClick={() => {
                setEditingId(userReview._id);
                setRating(userReview.rating);
                setComment(userReview.comment);
                setShowForm(true);
              }}>Sửa</button>
              <button className="delete-btn" onClick={() => handleDeleteReview(userReview._id)}>Xóa</button>
            </div>
          )}
        </div>
      </div>
      
      {showForm && (
        <div className="review-form">
          <h3>{editingId ? 'Sửa đánh giá' : 'Viết đánh giá của bạn'}</h3>
          <form onSubmit={editingId ? handleEditReview : handleAddReview}>
            <div className="rating-input">
              <label>Đánh giá của bạn:</label>
              <div className="star-rating">
                {[1,2,3,4,5].map(star => (
                  <span key={star} className={`star ${star <= rating ? 'selected' : ''}`} onClick={() => setRating(star)}>★</span>
                ))}
              </div>
            </div>
            <div className="comment-input">
              <textarea placeholder="Chia sẻ trải nghiệm của bạn về món ăn này..." value={comment} onChange={(e) => setComment(e.target.value)} rows="4" required />
            </div>
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => { setShowForm(false); setEditingId(null); setRating(5); setComment(''); }}>Hủy</button>
              <button type="submit" className="submit-btn" disabled={isSubmitting}>{isSubmitting ? 'Đang xử lý...' : editingId ? 'Cập nhật' : 'Gửi đánh giá'}</button>
            </div>
          </form>
        </div>
      )}
      
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <div className="empty-icon">📝</div>
            <p>Chưa có đánh giá nào cho món ăn này.</p>
            <p>Hãy là người đầu tiên đánh giá!</p>
          </div>
        ) : (
          reviews.map((review) => {
            const avatarUrl = getAvatarUrl(review.userId?.image);
            return (
              <div key={review._id} className="review-item">
                <div className="review-avatar">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt={review.userId?.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const placeholder = e.target.parentElement?.querySelector('.avatar-placeholder');
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="avatar-placeholder" style={{ display: avatarUrl ? 'none' : 'flex' }}>
                    {review.userId?.name?.charAt(0) || 'U'}
                  </div>
                </div>
                <div className="review-content">
                  <div className="review-info">
                    <span className="reviewer-name">{review.userId?.name || 'Người dùng'}</span>
                    <div className="review-stars">{renderStars(review.rating)}</div>
                    <span className="review-date">{formatDate(review.createdAt)}</span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  {review.reply && (
                    <div className="review-reply">
                      <strong>📌 Phản hồi từ Flash Food:</strong>
                      <p>{review.reply}</p>
                    </div>
                  )}
                  {isAuthenticated && review.userId?._id === userId && !showForm && (
                    <div className="review-actions">
                      <button className="edit-action" onClick={() => {
                        setEditingId(review._id);
                        setRating(review.rating);
                        setComment(review.comment);
                        setShowForm(true);
                      }}>✏️ Sửa</button>
                      <button className="delete-action" onClick={() => handleDeleteReview(review._id)}>🗑️ Xóa</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ReviewList;