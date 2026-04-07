import React, { useState, useEffect } from 'react'
import './Review.scss'
import axios from 'axios'
import { toast } from 'react-toastify'
import { getCookie } from '../../utils/cookieHelper'

const Review = ({ url }) => {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterRating, setFilterRating] = useState("all")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 20

    const fetchReviews = async () => {
        try {
            const token = getCookie("adminToken")
            const response = await axios.get(`${url}/api/review/list`, {
                headers: { token }
            })
            if (response.data.success) {
                setReviews(response.data.reviews)
            }
        } catch (error) {
            toast.error("Lỗi khi tải danh sách đánh giá")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchReviews()
    }, [])

    const handleDelete = async (reviewId) => {
        if (!window.confirm("Bạn có chắc muốn xóa đánh giá này?")) return

        try {
            const token = getCookie("adminToken")
            const response = await axios.post(
                `${url}/api/review/delete`,
                { reviewId },
                { headers: { token } }
            )
            if (response.data.success) {
                toast.success("Đã xóa đánh giá")
                fetchReviews()
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            toast.error("Lỗi khi xóa đánh giá")
        }
    }

    const filteredReviews = reviews.filter(review => {
        const matchesSearch =
            (review.userId?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (review.userId?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (review.foodId?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (review.comment || "").toLowerCase().includes(searchTerm.toLowerCase())

        const matchesRating = filterRating === "all" || review.rating === Number(filterRating)
        return matchesSearch && matchesRating
    })

    const indexOfLast = currentPage * itemsPerPage
    const indexOfFirst = indexOfLast - itemsPerPage
    const currentReviews = filteredReviews.slice(indexOfFirst, indexOfLast)
    const totalPages = Math.ceil(filteredReviews.length / itemsPerPage)

    const renderStars = (count) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} style={{ color: i < count ? '#ffc107' : '#ddd', fontSize: 16 }}>&#9733;</span>
        ))
    }

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
    }

    // Stats
    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0
    const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length
    }))

    if (loading) {
        return <div className="review-page"><p>Đang tải...</p></div>
    }

    return (
        <div className="review-page">
            <div className="review-header">
                <div>
                    <h2>Quản lý đánh giá</h2>
                    <p className="subtitle">Tổng cộng {reviews.length} đánh giá</p>
                </div>
            </div>

            <div className="review-stats">
                <div className="stat-card stat-avg">
                    <span className="stat-number">{avgRating}</span>
                    <div className="stat-stars">{renderStars(Math.round(avgRating))}</div>
                    <span className="stat-label">Trung bình</span>
                </div>
                {ratingCounts.map(({ star, count }) => (
                    <div key={star} className="stat-card">
                        <div className="stat-bar-row">
                            <span>{star} &#9733;</span>
                            <div className="stat-bar">
                                <div
                                    className="stat-bar-fill"
                                    style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : 0 }}
                                />
                            </div>
                            <span className="stat-count">{count}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="review-filters">
                <input
                    type="text"
                    placeholder="Tìm theo tên, email, món ăn, nội dung..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
                <select value={filterRating} onChange={(e) => { setFilterRating(e.target.value); setCurrentPage(1); }}>
                    <option value="all">Tất cả sao</option>
                    <option value="5">5 sao</option>
                    <option value="4">4 sao</option>
                    <option value="3">3 sao</option>
                    <option value="2">2 sao</option>
                    <option value="1">1 sao</option>
                </select>
            </div>

            <div className="review-table">
                <div className="review-table-header">
                    <span>Khách hàng</span>
                    <span>Món ăn</span>
                    <span>Đánh giá</span>
                    <span>Nội dung</span>
                    <span>Ngày</span>
                    <span>Thao tác</span>
                </div>
                {currentReviews.length === 0 ? (
                    <div className="review-empty">Không có đánh giá nào</div>
                ) : (
                    currentReviews.map((review) => (
                        <div key={review._id} className="review-table-row">
                            <div className="cell-user">
                                <span className="user-name">{review.userId?.name || "Đã xóa"}</span>
                                <span className="user-email">{review.userId?.email || ""}</span>
                            </div>
                            <span className="cell-food">{review.foodId?.name || "Đã xóa"}</span>
                            <span className="cell-rating">{renderStars(review.rating)}</span>
                            <span className="cell-comment">{review.comment || "-"}</span>
                            <span className="cell-date">{formatDate(review.date)}</span>
                            <span className="cell-action">
                                <button className="delete-btn" onClick={() => handleDelete(review._id)}>
                                    Xóa
                                </button>
                            </span>
                        </div>
                    ))
                )}
            </div>

            {totalPages > 1 && (
                <div className="review-pagination">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                        &lt; Trước
                    </button>
                    <span>Trang {currentPage} / {totalPages}</span>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                        Tiếp &gt;
                    </button>
                </div>
            )}
        </div>
    )
}

export default Review
