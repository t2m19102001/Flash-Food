import React, { useState, useEffect } from 'react'
import './Review.scss'
import axios from 'axios'
import { toast } from 'react-toastify'

const Review = ({ url }) => {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterRating, setFilterRating] = useState("all")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 20

    // 🔥 SỬA: fetch reviews với withCredentials
    const fetchReviews = async () => {
        setLoading(true)
        try {
            const response = await axios.get(`${url}/api/review/list`, {
                withCredentials: true
            })
            if (response.data.success) {
                setReviews(response.data.reviews)
            } else {
                toast.error(response.data.message || "Không thể tải danh sách đánh giá")
            }
        } catch (error) {
            console.error("Error fetching reviews:", error)
            if (error.response?.status === 401) {
                toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!")
            } else {
                toast.error("Lỗi khi tải danh sách đánh giá")
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchReviews()
    }, [])

    // 🔥 SỬA: delete review với withCredentials
    const handleDelete = async (reviewId) => {
        if (!window.confirm("Bạn có chắc muốn xóa đánh giá này?")) return

        try {
            const response = await axios.post(`${url}/api/review/delete`, { reviewId }, {
                withCredentials: true
            })
            if (response.data.success) {
                toast.success("✅ Đã xóa đánh giá thành công")
                fetchReviews()
            } else {
                toast.error(response.data.message || "Không thể xóa đánh giá")
            }
        } catch (error) {
            console.error("Error deleting review:", error)
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
            <span key={i} className={i < count ? 'star-filled' : 'star-empty'}>★</span>
        ))
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A'
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
    }

    // Stats
    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : 0
    const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length
    }))

    if (loading) {
        return (
            <div className="review-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Đang tải đánh giá...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="review-page">
            <div className="review-header">
                <div>
                    <h2>⭐ Quản lý đánh giá</h2>
                    <p className="subtitle">Tổng cộng <strong>{reviews.length}</strong> đánh giá từ khách hàng</p>
                </div>
                <button className="refresh-btn" onClick={fetchReviews} title="Làm mới">🔄 Làm mới</button>
            </div>

            {/* Stats Section */}
            <div className="review-stats">
                <div className="stat-card stat-avg">
                    <div className="stat-number">{avgRating}</div>
                    <div className="stat-stars">{renderStars(Math.round(avgRating))}</div>
                    <div className="stat-label">Trung bình</div>
                </div>
                {ratingCounts.map(({ star, count }) => (
                    <div key={star} className="stat-card stat-bar-card">
                        <div className="stat-bar-row">
                            <span className="star-label">{star} ★</span>
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

            {/* Filters */}
            <div className="review-filters">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Tìm theo tên, email, món ăn, nội dung..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>
                <select className="filter-select" value={filterRating} onChange={(e) => { setFilterRating(e.target.value); setCurrentPage(1); }}>
                    <option value="all">📋 Tất cả sao</option>
                    <option value="5">⭐⭐⭐⭐⭐ 5 sao</option>
                    <option value="4">⭐⭐⭐⭐ 4 sao</option>
                    <option value="3">⭐⭐⭐ 3 sao</option>
                    <option value="2">⭐⭐ 2 sao</option>
                    <option value="1">⭐ 1 sao</option>
                </select>
            </div>

            {/* Review Table */}
            <div className="review-table">
                <div className="review-table-header">
                    <span>👤 Khách hàng</span>
                    <span>🍽️ Món ăn</span>
                    <span>⭐ Đánh giá</span>
                    <span>💬 Nội dung</span>
                    <span>📅 Ngày</span>
                    <span>⚙️ Thao tác</span>
                </div>
                {currentReviews.length === 0 ? (
                    <div className="review-empty">
                        <div className="empty-icon">📭</div>
                        <p>Không có đánh giá nào</p>
                        {searchTerm && <button onClick={() => { setSearchTerm(""); setFilterRating("all"); }}>Xóa bộ lọc</button>}
                    </div>
                ) : (
                    currentReviews.map((review) => (
                        <div key={review._id} className="review-table-row">
                            <div className="cell-user">
                                <span className="user-name">{review.userId?.name || "👤 Đã xóa"}</span>
                                <span className="user-email">{review.userId?.email || ""}</span>
                            </div>
                            <span className="cell-food">{review.foodId?.name || "🍽️ Đã xóa"}</span>
                            <div className="cell-rating">{renderStars(review.rating)}</div>
                            <div className="cell-comment">
                                <p>{review.comment || "—"}</p>
                            </div>
                            <span className="cell-date">{formatDate(review.date)}</span>
                            <div className="cell-action">
                                <button className="delete-btn" onClick={() => handleDelete(review._id)} title="Xóa đánh giá">
                                    🗑️ Xóa
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="review-pagination">
                    <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                        ◀ Trước
                    </button>
                    <span className="page-info">Trang {currentPage} / {totalPages}</span>
                    <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                        Tiếp ▶
                    </button>
                </div>
            )}
        </div>
    )
}

export default Review