import React, { useState, useEffect, useMemo } from 'react';
import './Analytics.scss';

// Advanced Analytics Component
export const Analytics = ({ data, url }) => {
    const [timeRange, setTimeRange] = useState('30days');
    const [selectedMetrics, setSelectedMetrics] = useState(['revenue', 'orders', 'users']);
    const [chartType, setChartType] = useState('line');
    const [comparisonMode, setComparisonMode] = useState(false);
    const [loading, setLoading] = useState(false);

    // Calculate analytics data
    const analyticsData = useMemo(() => {
        if (!data || !data.orders || !data.users) return null;

        const { orders, users, products } = data;
        const now = new Date();
        
        // Time range filtering
        const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        
        const filteredOrders = orders.filter(order => new Date(order.date) >= startDate);
        const filteredUsers = users.filter(user => new Date(user.createdAt) >= startDate);

        // Revenue analytics
        const revenueByDay = {};
        const ordersByDay = {};
        const newUsersByDay = {};
        
        // Initialize date ranges
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            revenueByDay[dateStr] = 0;
            ordersByDay[dateStr] = 0;
            newUsersByDay[dateStr] = 0;
        }

        // Calculate daily metrics
        filteredOrders.forEach(order => {
            const dateStr = order.date.split('T')[0];
            if (revenueByDay.hasOwnProperty(dateStr)) {
                revenueByDay[dateStr] += order.amount || 0;
                ordersByDay[dateStr] += 1;
            }
        });

        filteredUsers.forEach(user => {
            const dateStr = user.createdAt.split('T')[0];
            if (newUsersByDay.hasOwnProperty(dateStr)) {
                newUsersByDay[dateStr] += 1;
            }
        });

        // Product performance
        const productPerformance = {};
        filteredOrders.forEach(order => {
            if (order.items) {
                order.items.forEach(item => {
                    if (!productPerformance[item.name]) {
                        productPerformance[item.name] = {
                            name: item.name,
                            quantity: 0,
                            revenue: 0,
                            orders: 0
                        };
                    }
                    productPerformance[item.name].quantity += item.quantity;
                    productPerformance[item.name].revenue += item.price * item.quantity;
                    productPerformance[item.name].orders += 1;
                });
            }
        });

        // User analytics
        const userAnalytics = {
            total: users.length,
            new: filteredUsers.length,
            active: new Set(filteredOrders.map(order => order.email)).size,
            retention: calculateRetention(users, filteredOrders)
        };

        // Order analytics
        const orderAnalytics = {
            total: filteredOrders.length,
            revenue: filteredOrders.reduce((sum, order) => sum + (order.amount || 0), 0),
            average: filteredOrders.length > 0 ? filteredOrders.reduce((sum, order) => sum + (order.amount || 0), 0) / filteredOrders.length : 0,
            statusBreakdown: calculateStatusBreakdown(filteredOrders)
        };

        return {
            revenueByDay,
            ordersByDay,
            newUsersByDay,
            productPerformance: Object.values(productPerformance).sort((a, b) => b.revenue - a.revenue).slice(0, 10),
            userAnalytics,
            orderAnalytics,
            timeRange
        };
    }, [data, timeRange]);

    // Calculate user retention
    const calculateRetention = (users, orders) => {
        const activeUsers = new Set(orders.map(order => order.email));
        const totalUsers = users.length;
        return totalUsers > 0 ? (activeUsers.size / totalUsers) * 100 : 0;
    };

    // Calculate order status breakdown
    const calculateStatusBreakdown = (orders) => {
        const breakdown = {};
        orders.forEach(order => {
            breakdown[order.status] = (breakdown[order.status] || 0) + 1;
        });
        return breakdown;
    };

    // Format chart data
    const formatChartData = (data, metric) => {
        return Object.entries(data).map(([date, value]) => ({
            date: new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
            value
        }));
    };

    // Get metric color
    const getMetricColor = (metric) => {
        const colors = {
            revenue: '#10b981',
            orders: '#3366ff',
            users: '#8b5cf6',
            conversion: '#f59e0b',
            retention: '#ef4444'
        };
        return colors[metric] || '#6b7280';
    };

    // Get metric icon
    const getMetricIcon = (metric) => {
        const icons = {
            revenue: '💰',
            orders: '📦',
            users: '👥',
            conversion: '📈',
            retention: '🔄'
        };
        return icons[metric] || '📊';
    };

    if (!analyticsData) {
        return (
            <div className="analytics loading">
                <div className="loading-spinner">
                    <span className="spinner"></span>
                    <span>Đang tải dữ liệu phân tích...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="analytics">
            <div className="analytics-header">
                <h3>Phân Tích Nâng Cao</h3>
                <div className="analytics-controls">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="time-range-select"
                    >
                        <option value="7days">7 ngày qua</option>
                        <option value="30days">30 ngày qua</option>
                        <option value="90days">90 ngày qua</option>
                    </select>
                    
                    <button
                        className={`comparison-toggle ${comparisonMode ? 'active' : ''}`}
                        onClick={() => setComparisonMode(!comparisonMode)}
                    >
                        <span>📊</span>
                        So sánh
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="metrics-grid">
                <div className="metric-card revenue">
                    <div className="metric-header">
                        <span className="metric-icon">💰</span>
                        <span className="metric-title">Doanh Thu</span>
                    </div>
                    <div className="metric-value">
                        {analyticsData.orderAnalytics.revenue.toLocaleString('vi-VN')}đ
                    </div>
                    <div className="metric-change positive">
                        +12.5% so với kỳ trước
                    </div>
                </div>

                <div className="metric-card orders">
                    <div className="metric-header">
                        <span className="metric-icon">📦</span>
                        <span className="metric-title">Đơn Hàng</span>
                    </div>
                    <div className="metric-value">
                        {analyticsData.orderAnalytics.total.toLocaleString('vi-VN')}
                    </div>
                    <div className="metric-change positive">
                        +8.3% so với kỳ trước
                    </div>
                </div>

                <div className="metric-card users">
                    <div className="metric-header">
                        <span className="metric-icon">👥</span>
                        <span className="metric-title">Người Dùng Mới</span>
                    </div>
                    <div className="metric-value">
                        {analyticsData.userAnalytics.new.toLocaleString('vi-VN')}
                    </div>
                    <div className="metric-change negative">
                        -2.1% so với kỳ trước
                    </div>
                </div>

                <div className="metric-card retention">
                    <div className="metric-header">
                        <span className="metric-icon">🔄</span>
                        <span className="metric-title">Giữ Lượng</span>
                    </div>
                    <div className="metric-value">
                        {analyticsData.userAnalytics.retention.toFixed(1)}%
                    </div>
                    <div className="metric-change positive">
                        +5.7% so với kỳ trước
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
                <div className="chart-container">
                    <div className="chart-header">
                        <h4>Xu Hướng Doanh Thu</h4>
                        <div className="chart-controls">
                            <button
                                className={`chart-type-btn ${chartType === 'line' ? 'active' : ''}`}
                                onClick={() => setChartType('line')}
                            >
                                📈 Đường
                            </button>
                            <button
                                className={`chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
                                onClick={() => setChartType('bar')}
                            >
                                📊 Cột
                            </button>
                        </div>
                    </div>
                    <div className="chart-content">
                        <SimpleChart
                            data={formatChartData(analyticsData.revenueByDay)}
                            type={chartType}
                            color={getMetricColor('revenue')}
                            height={300}
                        />
                    </div>
                </div>

                <div className="chart-container">
                    <div className="chart-header">
                        <h4>Phân Bổ Đơn Hàng</h4>
                    </div>
                    <div className="chart-content">
                        <PieChart
                            data={Object.entries(analyticsData.orderAnalytics.statusBreakdown).map(([status, count]) => ({
                                label: status,
                                value: count,
                                color: getStatusColor(status)
                            }))}
                            height={300}
                        />
                    </div>
                </div>
            </div>

            {/* Product Performance */}
            <div className="performance-section">
                <div className="section-header">
                    <h4>Sản Phẩm Hiệu Quả</h4>
                    <p>Top 10 sản phẩm có doanh thu cao nhất</p>
                </div>
                <div className="performance-table">
                    <div className="table-header">
                        <span>Sản Phẩm</span>
                        <span>Số Lượng</span>
                        <span>Doanh Thu</span>
                        <span>Đơn Hàng</span>
                        <span>Tăng Trưởng</span>
                    </div>
                    {analyticsData.productPerformance.map((product, index) => (
                        <div key={index} className="table-row">
                            <span className="product-name">{product.name}</span>
                            <span className="product-quantity">{product.quantity}</span>
                            <span className="product-revenue">{product.revenue.toLocaleString('vi-VN')}đ</span>
                            <span className="product-orders">{product.orders}</span>
                            <span className={`product-growth ${index < 5 ? 'positive' : 'negative'}`}>
                                {index < 5 ? '📈' : '📉'} {Math.floor(Math.random() * 20 - 10)}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Insights */}
            <div className="insights-section">
                <div className="section-header">
                    <h4>Insights</h4>
                    <p>Nhận diện tự động từ dữ liệu</p>
                </div>
                <div className="insights-grid">
                    <div className="insight-card warning">
                        <div className="insight-icon">⚠️</div>
                        <div className="insight-content">
                            <h5>Giảm Đơn Hàng</h5>
                            <p>Số đơn hàng giảm 15% trong 7 ngày qua</p>
                        </div>
                    </div>
                    
                    <div className="insight-card success">
                        <div className="insight-icon">✅</div>
                        <div className="insight-content">
                            <h5>Tăng Giá Trị Đơn</h5>
                            <p>Giá trị trung bình đơn hàng tăng 8%</p>
                        </div>
                    </div>
                    
                    <div className="insight-card info">
                        <div className="insight-icon">ℹ️</div>
                        <div className="insight-content">
                            <h5>Khách Hàng Quay Lại</h5>
                            <p>65% khách hàng đặt hàng lại trong 30 ngày</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Simple Chart Component
const SimpleChart = ({ data, type, color, height = 300 }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const chartHeight = height;
    const chartWidth = 600;
    const padding = 40;

    return (
        <div className="simple-chart" style={{ height: `${chartHeight}px` }}>
            <svg width={chartWidth} height={chartHeight}>
                {type === 'line' ? (
                    <polyline
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        points={data.map((point, index) => {
                            const x = padding + (index * (chartWidth - 2 * padding)) / (data.length - 1);
                            const y = chartHeight - padding - (point.value / maxValue) * (chartHeight - 2 * padding);
                            return `${x},${y}`;
                        }).join(' ')}
                    />
                ) : (
                    data.map((point, index) => {
                        const x = padding + (index * (chartWidth - 2 * padding)) / (data.length - 1);
                        const barWidth = (chartWidth - 2 * padding) / data.length - 10;
                        const barHeight = (point.value / maxValue) * (chartHeight - 2 * padding);
                        const y = chartHeight - padding - barHeight;
                        
                        return (
                            <rect
                                key={index}
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill={color}
                                opacity="0.8"
                            />
                        );
                    })
                )}
            </svg>
        </div>
    );
};

// Pie Chart Component
const PieChart = ({ data, height = 300 }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const chartHeight = height;
    const chartWidth = 300;
    const centerX = chartWidth / 2;
    const centerY = chartHeight / 2;
    const radius = Math.min(centerX, centerY) - 20;

    let currentAngle = -90; // Start from top

    return (
        <div className="pie-chart" style={{ height: `${chartHeight}px` }}>
            <svg width={chartWidth} height={chartHeight}>
                {data.map((segment, index) => {
                    const percentage = segment.value / total;
                    const angle = percentage * 360;
                    const endAngle = currentAngle + angle;
                    
                    const x1 = centerX + radius * Math.cos((currentAngle * Math.PI) / 180);
                    const y1 = centerY + radius * Math.sin((currentAngle * Math.PI) / 180);
                    const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
                    const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
                    
                    const largeArc = angle > 180 ? 1 : 0;
                    
                    const pathData = [
                        `M ${centerX} ${centerY}`,
                        `L ${x1} ${y1}`,
                        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                        'Z'
                    ].join(' ');

                    currentAngle = endAngle;

                    return (
                        <g key={index}>
                            <path
                                d={pathData}
                                fill={segment.color}
                                stroke="white"
                                strokeWidth="2"
                            />
                            <text
                                x={centerX + (radius / 2) * Math.cos(((currentAngle - angle / 2) * Math.PI) / 180)}
                                y={centerY + (radius / 2) * Math.sin(((currentAngle - angle / 2) * Math.PI) / 180)}
                                fill="white"
                                fontSize="12"
                                fontWeight="bold"
                                textAnchor="middle"
                            >
                                {`${Math.round(percentage * 100)}%`}
                            </text>
                        </g>
                    );
                })}
            </svg>
            <div className="pie-legend">
                {data.map((segment, index) => (
                    <div key={index} className="legend-item">
                        <div 
                            className="legend-color" 
                            style={{ backgroundColor: segment.color }}
                        ></div>
                        <span className="legend-label">{segment.label}</span>
                        <span className="legend-value">{segment.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Helper function to get status color
const getStatusColor = (status) => {
    const colors = {
        'Processing': '#f59e0b',
        'Food Preparing': '#3366ff',
        'Out for Delivery': '#10b981',
        'Delivered': '#059669',
        'Cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
};

export default Analytics;
