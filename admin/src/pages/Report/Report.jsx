import React, { useState } from "react";
import "./Report.scss";
import axios from "axios";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Report = ({ url }) => {
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [reportData, setReportData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState("orders");

  const fetchReport = async () => {
    if (!dateRange.start || !dateRange.end) {
      toast.error("📅 Vui lòng chọn khoảng thời gian");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/report/${reportType}`, {
        params: { start: dateRange.start, end: dateRange.end },
        withCredentials: true,
      });
      if (response.data.success) {
        setReportData(response.data.data);
        setStats(response.data.stats);
        toast.success("✅ Tải báo cáo thành công");
      } else {
        toast.error(response.data.message || "Lỗi tải báo cáo");
      }
    } catch (error) {
      console.error("Report error:", error);
      if (error.response?.status === 401) {
        toast.error("🔐 Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
      } else if (error.response?.status === 404) {
        toast.error("🔍 Không tìm thấy dữ liệu báo cáo");
      } else {
        toast.error("❌ Lỗi tải báo cáo, vui lòng thử lại");
      }
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!reportData || reportData.length === 0) {
      toast.error("Không có dữ liệu để xuất");
      return;
    }
    try {
      const ws = XLSX.utils.json_to_sheet(reportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      XLSX.writeFile(
        wb,
        `report_${reportType}_${new Date().toISOString().slice(0, 19)}.xlsx`
      );
      toast.success("📊 Xuất Excel thành công");
    } catch (error) {
      console.error("Excel error:", error);
      toast.error("Lỗi khi xuất Excel");
    }
  };

  const exportToPDF = () => {
    if (!reportData || reportData.length === 0) {
      toast.error("Không có dữ liệu để xuất");
      return;
    }
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`Báo cáo ${getReportTitle()}`, 14, 15);
      doc.setFontSize(10);
      doc.text(`Ngày xuất: ${new Date().toLocaleString("vi-VN")}`, 14, 25);
      doc.text(`Khoảng thời gian: ${dateRange.start} - ${dateRange.end}`, 14, 32);

      const headers = Object.keys(reportData[0] || {});
      const data = reportData.map((row) => Object.values(row));

      doc.autoTable({
        head: [headers],
        body: data,
        startY: 40,
        theme: "striped",
        headStyles: { fillColor: [255, 107, 74], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      doc.save(`report_${reportType}_${new Date().toISOString().slice(0, 19)}.pdf`);
      toast.success("📄 Xuất PDF thành công");
    } catch (error) {
      console.error("PDF error:", error);
      toast.error("Lỗi khi xuất PDF");
    }
  };

  const formatNumber = (num) => {
    if (num === undefined || num === null) return "0";
    return num.toLocaleString("vi-VN");
  };

  const getReportTitle = () => {
    const titles = {
      orders: "Đơn hàng",
      revenue: "Doanh thu",
      products: "Sản phẩm",
      users: "Người dùng",
    };
    return titles[reportType] || "Báo cáo";
  };

  const getColumnLabel = (key) => {
    const labels = {
      _id: "ID",
      code: "Mã đơn",
      name: "Tên",
      customer: "Khách hàng",
      phone: "SĐT",
      email: "Email",
      amount: "Tiền",
      status: "Trạng thái",
      paymentStatus: "TT toán",
      date: "Ngày",
      quantity: "SL",
      revenue: "Doanh thu",
      role: "Vai trò",
      createdAt: "Ngày tạo",
      price: "Giá",
      description: "Mô tả"
    };
    return labels[key] || key;
  };

  const formatValue = (key, value) => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "object") return JSON.stringify(value);
    if (typeof value === "number") {
      if (key === "amount" || key === "revenue" || key === "price") {
        return formatNumber(value) + "đ";
      }
      return formatNumber(value);
    }
    if (key === "date" || key === "createdAt") {
      return new Date(value).toLocaleDateString("vi-VN");
    }
    return String(value);
  };

  return (
    <div className="report-page">
      <div className="page-header">
        <div>
          <h2>📊 Báo cáo & Thống kê</h2>
          <p>Tổng quan hoạt động kinh doanh</p>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="kpi-grid">
          {reportType === "orders" && (
            <>
              <div className="kpi-card">
                <div className="kpi-icon orders">📦</div>
                <div className="kpi-info">
                  <div className="kpi-label">Tổng đơn hàng</div>
                  <div className="kpi-value">{formatNumber(stats.total)}</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon success">✅</div>
                <div className="kpi-info">
                  <div className="kpi-label">Đã giao</div>
                  <div className="kpi-value">{formatNumber(stats.delivered || 0)}</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon warning">⏳</div>
                <div className="kpi-info">
                  <div className="kpi-label">Đang xử lý</div>
                  <div className="kpi-value">{formatNumber(stats.pending || 0)}</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon danger">❌</div>
                <div className="kpi-info">
                  <div className="kpi-label">Đã hủy</div>
                  <div className="kpi-value">{formatNumber(stats.cancelled || 0)}</div>
                </div>
              </div>
            </>
          )}
          {reportType === "revenue" && stats && (
            <>
              <div className="kpi-card">
                <div className="kpi-icon revenue">💰</div>
                <div className="kpi-info">
                  <div className="kpi-label">Tổng doanh thu</div>
                  <div className="kpi-value">{formatNumber(stats.totalRevenue || 0)}đ</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon">📊</div>
                <div className="kpi-info">
                  <div className="kpi-label">Số đơn hàng</div>
                  <div className="kpi-value">{formatNumber(stats.orderCount || 0)}</div>
                </div>
              </div>
            </>
          )}
          {reportType === "users" && stats && (
            <>
              <div className="kpi-card">
                <div className="kpi-icon users">👥</div>
                <div className="kpi-info">
                  <div className="kpi-label">Tổng người dùng</div>
                  <div className="kpi-value">{formatNumber(stats.total || 0)}</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon success">✅</div>
                <div className="kpi-info">
                  <div className="kpi-label">Hoạt động</div>
                  <div className="kpi-value">{formatNumber(stats.active || 0)}</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon danger">🔒</div>
                <div className="kpi-info">
                  <div className="kpi-label">Bị khóa</div>
                  <div className="kpi-value">{formatNumber(stats.inactive || 0)}</div>
                </div>
              </div>
            </>
          )}
          {reportType === "products" && (
            <div className="kpi-card">
              <div className="kpi-icon products">🍽️</div>
              <div className="kpi-info">
                <div className="kpi-label">Số sản phẩm</div>
                <div className="kpi-value">{formatNumber(reportData?.length || 0)}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="report-filters">
        <div className="filter-group">
          <label>📅 Từ ngày</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <label>📅 Đến ngày</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <label>📋 Loại báo cáo</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="orders">📦 Đơn hàng</option>
            <option value="revenue">💰 Doanh thu</option>
            <option value="products">🍽️ Sản phẩm</option>
            <option value="users">👥 Người dùng</option>
          </select>
        </div>
        <button className="fetch-btn" onClick={fetchReport} disabled={loading}>
          {loading ? <div className="spinner"></div> : "📈 Xem báo cáo"}
        </button>
      </div>

      {/* Export Buttons */}
      {reportData && reportData.length > 0 && (
        <div className="report-actions">
          <button className="export-excel" onClick={exportToExcel}>
            📊 Xuất Excel
          </button>
          <button className="export-pdf" onClick={exportToPDF}>
            📄 Xuất PDF
          </button>
        </div>
      )}

      {/* Report Table */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : reportData && reportData.length > 0 ? (
        <div className="report-table-container">
          <div className="report-table">
            <div className="table-header">
              {Object.keys(reportData[0]).map((key) => (
                <span key={key}>{getColumnLabel(key)}</span>
              ))}
            </div>
            {reportData.map((row, idx) => (
              <div key={idx} className="table-row">
                {Object.entries(row).map(([key, val], i) => (
                  <span key={i}>{formatValue(key, val)}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : reportData && reportData.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>Không có dữ liệu</h3>
          <p>Không tìm thấy dữ liệu trong khoảng thời gian đã chọn</p>
        </div>
      ) : null}
    </div>
  );
};

export default Report;