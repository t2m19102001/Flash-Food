import React, { useState, useEffect } from "react";
import "./Dashboard.scss";
import axios from "axios";
import { toast } from "react-toastify";
import { SkeletonStats, SkeletonCard } from "../Loading/Loading";

const Dashboard = ({ url }) => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0,
        todayRevenue: 0,
        todayOrders: 0,
        recentOrders: [],
        ordersByStatus: {
            Processing: 0,
            "Food Preparing": 0,
            "Out for Delivery": 0,
            Delivered: 0,
            Cancelled: 0
        },
        topProducts: [],
        revenueByDate: [],
        monthlyGrowth: 0,
        avgOrderValue: 0,
        activeUsers: 0,
        conversionRate: 0
    });
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState("7days");
    const [selectedMetric, setSelectedMetric] = useState("revenue");
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(30000);

    useEffect(() => {
        fetchStatistics();
    }, [dateRange]);

    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(fetchStatistics, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [autoRefresh, refreshInterval]);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            console.log("🟢 Bắt đầu fetch thống kê...");

            // 🔥 DÙNG withCredentials THAY VÌ HEADER TOKEN
            const [statsRes, ordersRes, productsRes, usersRes] = await Promise.all([
                axios.get(`${url}/api/admin/stats`, { withCredentials: true }).catch(err => {
                    console.error("Stats API error:", err.response?.status || err.message);
                    return { data: { success: false } };
                }),
                axios.get(`${url}/api/order/list`, { withCredentials: true }).catch(err => {
                    console.error("Orders API error:", err.response?.status || err.message);
                    return { data: { orders: [] } };
                }),
                axios.get(`${url}/api/food/list`, { withCredentials: true }).catch(err => {
                    console.error("Products API error:", err.response?.status || err.message);
                    return { data: { foods: [] } };
                }),
                axios.get(`${url}/api/user/list`, { withCredentials: true }).catch(err => {
                    console.error("Users API error:", err.response?.status || err.message);
                    return { data: { users: [] } };
                })
            ]);

            console.log("📥 Stats response:", statsRes.data);
            console.log("📥 Orders count:", ordersRes.data.orders?.length || 0);
            console.log("📥 Products count:", productsRes.data.foods?.length || 0);
            console.log("📥 Users count:", usersRes.data.users?.length || 0);

            const orders = ordersRes.data.orders || [];
            const products = productsRes.data.foods || [];
            const users = usersRes.data.users || [];

            // Calculate revenue
            const totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);

            // Today's stats
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayOrders = orders.filter(order => new Date(order.date) >= today);
            const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.amount || 0), 0);

            // Orders by status
            const ordersByStatus = orders.reduce((acc, order) => {
                const status = order.status || "Pending";
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {
                pending: 0,
                pending_payment: 0,
                confirmed: 0,
                processing: 0,
                shipped: 0,
                delivered: 0,
                cancelled: 0,
                payment_failed: 0
            });

            // Top products (from delivered orders)
            const productSales = {};
            orders.filter(o => o.status === "delivered").forEach(order => {
                order.items?.forEach(item => {
                    if (!productSales[item.name]) {
                        productSales[item.name] = {
                            name: item.name,
                            quantity: 0,
                            revenue: 0,
                            image: item.image
                        };
                    }
                    productSales[item.name].quantity += item.quantity;
                    productSales[item.name].revenue += (item.price || 0) * item.quantity;
                });
            });

            const topProducts = Object.values(productSales)
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5);

            // Revenue by date (last N days)
            const days = dateRange === "3days" ? 3 : dateRange === "7days" ? 7 : dateRange === "30days" ? 30 : 90;
            const revenueByDate = [];

            for (let i = days - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                date.setHours(0, 0, 0, 0);

                const nextDate = new Date(date);
                nextDate.setDate(nextDate.getDate() + 1);

                const dayOrders = orders.filter(order => {
                    const orderDate = new Date(order.date);
                    return orderDate >= date && orderDate < nextDate;
                });

                const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.amount || 0), 0);

                revenueByDate.push({
                    date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                    revenue: dayRevenue,
                    orders: dayOrders.length
                });
            }

            // Calculate additional metrics
            const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

            // Monthly growth
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            const lastMonthOrders = orders.filter(order => new Date(order.date) >= lastMonth);
            const thisMonthOrders = orders.filter(order => new Date(order.date) >= new Date(new Date().setDate(1)));
            const monthlyGrowth = lastMonthOrders.length > 0
                ? ((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100
                : 0;

            // Active users
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const activeUsers = new Set(
                orders
                    .filter(order => new Date(order.date) >= thirtyDaysAgo)
                    .map(order => order.userId?._id || order.userId)
            ).size;

            // Conversion rate
            const conversionRate = users.length > 0 ? (activeUsers / users.length) * 100 : 0;

            setStats({
                totalProducts: products.length,
                totalOrders: orders.length,
                totalUsers: users.length,
                totalRevenue,
                todayRevenue,
                todayOrders: todayOrders.length,
                recentOrders: orders.slice(-10).reverse(),
                ordersByStatus,
                topProducts,
                revenueByDate,
                monthlyGrowth,
                avgOrderValue,
                activeUsers,
                conversionRate
            });
        } catch (error) {
            console.error("❌ Error fetching statistics:", error);
            if (error.response?.status === 401) {
                toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
            } else {
                toast.error("Lỗi khi tải thống kê. Vui lòng thử lại!");
            }
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: "#ffc107",
            pending_payment: "#ff9800",
            confirmed: "#2196f3",
            processing: "#4caf50",
            shipped: "#00bcd4",
            delivered: "#155724",
            cancelled: "#dc3545",
            payment_failed: "#f44336"
        };
        return colors[status] || "#666";
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: "Chờ xử lý",
            pending_payment: "Chờ thanh toán",
            confirmed: "Đã xác nhận",
            processing: "Đang xử lý",
            shipped: "Đang giao",
            delivered: "Đã giao",
            cancelled: "Đã hủy",
            payment_failed: "TT thất bại"
        };
        return labels[status] || status;
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h2>📊 Dashboard & Thống Kê</h2>
                    <p className="subtitle">Tổng quan hoạt động kinh doanh</p>
                </div>
                <div className="header-controls">
                    <div className="auto-refresh-toggle">
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={autoRefresh}
                                onChange={(e) => setAutoRefresh(e.target.checked)}
                            />
                            <span className="slider"></span>
                        </label>
                        <span className="toggle-label">Auto Refresh</span>
                    </div>
                    <select
                        className="refresh-interval"
                        value={refreshInterval / 1000}
                        onChange={(e) => setRefreshInterval(parseInt(e.target.value) * 1000)}
                        disabled={!autoRefresh}
                    >
                        <option value="30">30s</option>
                        <option value="60">1m</option>
                        <option value="300">5m</option>
                    </select>
                    <button className="refresh-btn" onClick={fetchStatistics} disabled={loading}>
                        {loading ? "Đang tải..." : "🔄 Làm mới"}
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                {loading ? (
                    <SkeletonStats count={6} />
                ) : (
                    <>
                        <div className="kpi-card revenue">
                            <div className="kpi-icon">💰</div>
                            <div className="kpi-content">
                                <h3>Tổng Doanh Thu</h3>
                                <p className="kpi-value">{formatCurrency(stats.totalRevenue)}</p>
                                <span className="kpi-label">Từ {stats.totalOrders} đơn hàng</span>
                            </div>
                        </div>

                        <div className="kpi-card today">
                            <div className="kpi-icon">📅</div>
                            <div className="kpi-content">
                                <h3>Hôm Nay</h3>
                                <p className="kpi-value">{formatCurrency(stats.todayRevenue)}</p>
                                <span className="kpi-label">{stats.todayOrders} đơn hàng</span>
                            </div>
                        </div>

                        <div className="kpi-card orders">
                            <div className="kpi-icon">📦</div>
                            <div className="kpi-content">
                                <h3>Đơn Hàng</h3>
                                <p className="kpi-value">{stats.totalOrders}</p>
                                <span className="kpi-label">Tổng số đơn</span>
                            </div>
                        </div>

                        <div className="kpi-card users">
                            <div className="kpi-icon">👥</div>
                            <div className="kpi-content">
                                <h3>Khách Hàng</h3>
                                <p className="kpi-value">{stats.totalUsers}</p>
                                <span className="kpi-label">Người dùng</span>
                            </div>
                        </div>

                        <div className="kpi-card growth">
                            <div className="kpi-icon">📈</div>
                            <div className="kpi-content">
                                <h3>Tăng Trưởng Tháng</h3>
                                <p className="kpi-value">{stats.monthlyGrowth.toFixed(1)}%</p>
                                <span className={`kpi-label ${stats.monthlyGrowth >= 0 ? 'positive' : 'negative'}`}>
                                    {stats.monthlyGrowth >= 0 ? '📈 Tăng' : '📉 Giảm'} so với tháng trước
                                </span>
                            </div>
                        </div>

                        <div className="kpi-card avg-order">
                            <div className="kpi-icon">💳</div>
                            <div className="kpi-content">
                                <h3>Giá Trị TB Đơn</h3>
                                <p className="kpi-value">{formatCurrency(stats.avgOrderValue)}</p>
                                <span className="kpi-label">Trung bình/đơn hàng</span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Charts Section */}
            <div className="dashboard-grid">
                <div className="dashboard-section chart-section">
                    <div className="section-header">
                        <h3>📈 Doanh Thu Theo Ngày</h3>
                        <select
                            className="date-range-selector"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <option value="3days">3 ngày</option>
                            <option value="7days">7 ngày</option>
                            <option value="30days">30 ngày</option>
                            <option value="90days">90 ngày</option>
                        </select>
                    </div>

                    <div className="chart-container">
                        {loading ? (
                            <div className="loading-placeholder">
                                <SkeletonCard count={3} />
                            </div>
                        ) : (
                            <div className="bar-chart">
                                {(() => {
                                    const maxRevenue = Math.max(...stats.revenueByDate.map(d => d.revenue), 1);
                                    return stats.revenueByDate.map((item, index) => {
                                        const heightPercent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 10;

                                        return (
                                            <div key={index} className="bar-item">
                                                <div className="bar-tooltip">
                                                    <strong>{item.date}</strong>
                                                    <p>{formatCurrency(item.revenue)}</p>
                                                    <span>{item.orders} đơn</span>
                                                </div>
                                                <div
                                                    className="bar"
                                                    style={{ height: `${heightPercent}%` }}
                                                />
                                                <div className="bar-label">{item.date}</div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        )}
                    </div>
                </div>

                <div className="dashboard-section status-section">
                    <div className="section-header">
                        <h3>📊 Trạng Thái Đơn Hàng</h3>
                    </div>

                    <div className="status-list">
                        {Object.entries(stats.ordersByStatus).map(([status, count]) => {
                            const percentage = stats.totalOrders > 0
                                ? (count / stats.totalOrders * 100).toFixed(1)
                                : 0;

                            return (
                                <div key={status} className="status-item">
                                    <div className="status-info">
                                        <span className="status-name">{getStatusLabel(status)}</span>
                                        <span className="status-count">{count} đơn ({percentage}%)</span>
                                    </div>
                                    <div className="status-bar">
                                        <div
                                            className="status-bar-fill"
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor: getStatusColor(status)
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Top Products */}
            <div className="dashboard-section top-products-section">
                <div className="section-header">
                    <h3>🏆 Top 5 Sản Phẩm Bán Chạy</h3>
                </div>

                <div className="top-products-grid">
                    {loading ? (
                        <SkeletonCard count={5} />
                    ) : stats.topProducts.length > 0 ? (
                        stats.topProducts.map((product, index) => (
                            <div key={index} className="product-card">
                                <div className="product-rank">#{index + 1}</div>
                                <div className="product-image">
                                    {product.image ? (
                                        <img src={`${url}/images/${product.image}`} alt={product.name} />
                                    ) : (
                                        <div className="placeholder">🍽️</div>
                                    )}
                                </div>
                                <div className="product-info">
                                    <h4>{product.name}</h4>
                                    <p className="product-sales">Đã bán: <strong>{product.quantity}</strong> món</p>
                                    <p className="product-revenue">Doanh thu: <strong>{formatCurrency(product.revenue)}</strong></p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">Chưa có dữ liệu bán hàng</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;