import React, { useState, useRef } from 'react';
import './DataExport.scss';

// Data Export Component
export const DataExport = ({ 
    data, 
    filename = 'export', 
    availableFormats = ['csv', 'excel', 'pdf', 'json'],
    onExport,
    loading = false,
    disabled = false 
}) => {
    const [selectedFormat, setSelectedFormat] = useState('csv');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [exportOptions, setExportOptions] = useState({
        includeHeaders: true,
        dateFormat: 'dd/mm/yyyy',
        encoding: 'utf-8',
        compression: false
    });
    const [exportHistory, setExportHistory] = useState([]);
    const fileInputRef = useRef(null);

    // Format data for export
    const formatData = (data, format) => {
        if (!data || data.length === 0) return '';

        switch (format) {
            case 'csv':
                return formatToCSV(data);
            case 'excel':
                return formatToExcel(data);
            case 'json':
                return formatToJSON(data);
            case 'pdf':
                return formatToPDF(data);
            default:
                return formatToCSV(data);
        }
    };

    // CSV Format
    const formatToCSV = (data) => {
        if (!exportOptions.includeHeaders) {
            return data.map(row => Object.values(row).join(',')).join('\n');
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header];
                // Handle commas and quotes in values
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value || '';
            }).join(','))
        ].join('\n');

        return csvContent;
    };

    // Excel Format (simplified - using CSV with Excel MIME type)
    const formatToExcel = (data) => {
        const csvContent = formatToCSV(data);
        return csvContent;
    };

    // JSON Format
    const formatToJSON = (data) => {
        return JSON.stringify(data, null, 2);
    };

    // PDF Format (simplified - would need a library like jsPDF)
    const formatToPDF = (data) => {
        // This is a simplified version
        const headers = Object.keys(data[0]);
        let pdfContent = headers.join('\t') + '\n';
        
        data.forEach(row => {
            pdfContent += headers.map(header => row[header] || '').join('\t') + '\n';
        });

        return pdfContent;
    };

    // Download file
    const downloadFile = (content, format) => {
        const mimeTypes = {
            csv: 'text/csv',
            excel: 'application/vnd.ms-excel',
            json: 'application/json',
            pdf: 'application/pdf'
        };

        const extensions = {
            csv: '.csv',
            excel: '.xlsx',
            json: '.json',
            pdf: '.pdf'
        };

        const blob = new Blob([content], { type: mimeTypes[format] });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}${extensions[format]}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Add to export history
        addToHistory(format, data.length);
    };

    // Add to export history
    const addToHistory = (format, recordCount) => {
        const historyItem = {
            id: Date.now(),
            filename: `${filename}_${new Date().toISOString().split('T')[0]}`,
            format,
            recordCount,
            timestamp: new Date(),
            size: formatData(data, format).length
        };

        setExportHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10 exports
    };

    // Handle export
    const handleExport = () => {
        if (!data || data.length === 0) {
            alert('Không có dữ liệu để xuất');
            return;
        }

        const content = formatData(data, selectedFormat);
        downloadFile(content, selectedFormat);

        if (onExport) {
            onExport({
                format: selectedFormat,
                filename: `${filename}_${new Date().toISOString().split('T')[0]}`,
                recordCount: data.length,
                options: exportOptions
            });
        }
    };

    // Handle scheduled export
    const handleScheduledExport = () => {
        const schedule = {
            frequency: 'daily', // daily, weekly, monthly
            format: selectedFormat,
            options: exportOptions,
            email: 'admin@example.com', // Would come from user settings
            enabled: true
        };

        // This would normally save to backend
        console.log('Scheduled export:', schedule);
        alert('Đã đặt lịch xuất dữ liệu thành công!');
    };

    // Get format info
    const getFormatInfo = (format) => {
        const formatInfo = {
            csv: {
                name: 'CSV',
                description: 'Tệp văn bản phân cách bằng dấu phẩy',
                icon: '📊',
                maxSize: '10MB'
            },
            excel: {
                name: 'Excel',
                description: 'Tệp Microsoft Excel',
                icon: '📈',
                maxSize: '20MB'
            },
            json: {
                name: 'JSON',
                description: 'Tệp JavaScript Object Notation',
                icon: '📄',
                maxSize: '5MB'
            },
            pdf: {
                name: 'PDF',
                description: 'Tệp Portable Document Format',
                icon: '📋',
                maxSize: '15MB'
            }
        };
        return formatInfo[format] || formatInfo.csv;
    };

    return (
        <div className="data-export">
            <div className="export-header">
                <h3>Xuất Dữ Liệu</h3>
                <p>Xuất dữ liệu hiện tại ra các định dạng khác nhau</p>
            </div>

            <div className="export-formats">
                <div className="format-grid">
                    {availableFormats.map(format => {
                        const info = getFormatInfo(format);
                        return (
                            <div
                                key={format}
                                className={`format-card ${selectedFormat === format ? 'selected' : ''}`}
                                onClick={() => setSelectedFormat(format)}
                            >
                                <div className="format-icon">{info.icon}</div>
                                <div className="format-info">
                                    <h4>{info.name}</h4>
                                    <p>{info.description}</p>
                                    <small>Kích thước tối đa: {info.maxSize}</small>
                                </div>
                                <div className="format-radio">
                                    <input
                                        type="radio"
                                        name="format"
                                        value={format}
                                        checked={selectedFormat === format}
                                        onChange={() => setSelectedFormat(format)}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="export-controls">
                <button
                    className="advanced-toggle-btn"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                >
                    <span className="toggle-icon">⚙️</span>
                    <span>Tùy chọn nâng cao</span>
                    <span className={`arrow ${showAdvanced ? 'up' : 'down'}`}>▼</span>
                </button>
            </div>

            {showAdvanced && (
                <div className="advanced-options">
                    <h4>Tùy chọn xuất</h4>
                    <div className="options-grid">
                        <label className="option-item">
                            <input
                                type="checkbox"
                                checked={exportOptions.includeHeaders}
                                onChange={(e) => setExportOptions(prev => ({
                                    ...prev,
                                    includeHeaders: e.target.checked
                                }))}
                            />
                            <span>Bao gồm tiêu đề</span>
                        </label>

                        <div className="option-item">
                            <label>Định dạng ngày</label>
                            <select
                                value={exportOptions.dateFormat}
                                onChange={(e) => setExportOptions(prev => ({
                                    ...prev,
                                    dateFormat: e.target.value
                                }))}
                            >
                                <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                                <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                                <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                            </select>
                        </div>

                        <div className="option-item">
                            <label>Bộ mã</label>
                            <select
                                value={exportOptions.encoding}
                                onChange={(e) => setExportOptions(prev => ({
                                    ...prev,
                                    encoding: e.target.value
                                }))}
                            >
                                <option value="utf-8">UTF-8</option>
                                <option value="utf-16">UTF-16</option>
                                <option value="iso-8859-1">ISO-8859-1</option>
                            </select>
                        </div>

                        <label className="option-item">
                            <input
                                type="checkbox"
                                checked={exportOptions.compression}
                                onChange={(e) => setExportOptions(prev => ({
                                    ...prev,
                                    compression: e.target.checked
                                }))}
                            />
                            <span>Nén tệp</span>
                        </label>
                    </div>

                    <div className="scheduled-export">
                        <h4>Xuất theo lịch</h4>
                        <p>Tự động xuất dữ liệu theo lịch định sẵn</p>
                        <button
                            className="schedule-btn"
                            onClick={handleScheduledExport}
                        >
                            📅 Đặt lịch xuất
                        </button>
                    </div>
                </div>
            )}

            <div className="export-actions">
                <div className="export-info">
                    <span className="record-count">
                        {data?.length || 0} bản ghi
                    </span>
                    <span className="estimated-size">
                        Kích thước ước tính: ~{Math.round((formatData(data, selectedFormat).length / 1024))}KB
                    </span>
                </div>
                <button
                    className="export-btn primary"
                    onClick={handleExport}
                    disabled={disabled || loading || !data || data.length === 0}
                >
                    {loading ? (
                        <>
                            <span className="spinner"></span>
                            Đang xử lý...
                        </>
                    ) : (
                        <>
                            <span>📥</span>
                            Xuất {getFormatInfo(selectedFormat).name}
                        </>
                    )}
                </button>
            </div>

            {/* Export History */}
            {exportHistory.length > 0 && (
                <div className="export-history">
                    <h4>Lịch sử xuất</h4>
                    <div className="history-list">
                        {exportHistory.map(item => (
                            <div key={item.id} className="history-item">
                                <div className="history-info">
                                    <span className="history-filename">{item.filename}</span>
                                    <span className="history-details">
                                        {item.recordCount} bản ghi • {item.format.toUpperCase()} • {Math.round(item.size / 1024)}KB
                                    </span>
                                    <span className="history-time">
                                        {new Date(item.timestamp).toLocaleString('vi-VN')}
                                    </span>
                                </div>
                                <button
                                    className="re-export-btn"
                                    onClick={() => {
                                        setSelectedFormat(item.format);
                                        handleExport();
                                    }}
                                >
                                    📥 Xuất lại
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Export Button Component (for inline use)
export const ExportButton = ({ 
    data, 
    filename, 
    format = 'csv',
    children = 'Xuất dữ liệu',
    className = '',
    ...props 
}) => {
    const handleQuickExport = () => {
        if (!data || data.length === 0) {
            alert('Không có dữ liệu để xuất');
            return;
        }

        const content = format === 'json' 
            ? JSON.stringify(data, null, 2)
            : data.map(row => Object.values(row).join(',')).join('\n');

        const mimeTypes = {
            csv: 'text/csv',
            excel: 'application/vnd.ms-excel',
            json: 'application/json'
        };

        const extensions = {
            csv: '.csv',
            excel: '.xlsx',
            json: '.json'
        };

        const blob = new Blob([content], { type: mimeTypes[format] });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}${extensions[format]}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <button
            className={`export-button ${className}`}
            onClick={handleQuickExport}
            {...props}
        >
            <span>📥</span>
            {children}
        </button>
    );
};

// Export Hook
export const useDataExport = () => {
    const [exportHistory, setExportHistory] = useState([]);
    const [scheduledExports, setScheduledExports] = useState([]);

    const addToHistory = (exportInfo) => {
        const historyItem = {
            id: Date.now(),
            ...exportInfo,
            timestamp: new Date()
        };

        setExportHistory(prev => [historyItem, ...prev.slice(0, 9)]);
    };

    const scheduleExport = (schedule) => {
        const scheduledItem = {
            id: Date.now(),
            ...schedule,
            createdAt: new Date(),
            nextRun: calculateNextRun(schedule.frequency)
        };

        setScheduledExports(prev => [...prev, scheduledItem]);
    };

    const calculateNextRun = (frequency) => {
        const now = new Date();
        switch (frequency) {
            case 'daily':
                return new Date(now.getTime() + 24 * 60 * 60 * 1000);
            case 'weekly':
                return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            case 'monthly':
                return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
            default:
                return now;
        }
    };

    return {
        exportHistory,
        scheduledExports,
        addToHistory,
        scheduleExport
    };
};

export default DataExport;
