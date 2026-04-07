import React, { useState } from 'react';
import './DataExport.scss';

// Export Wizard Component
export const ExportWizard = ({ 
    data, 
    filename = 'export', 
    onClose,
    onExport 
}) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [exportConfig, setExportConfig] = useState({
        format: 'csv',
        includeHeaders: true,
        dateFormat: 'dd/mm/yyyy',
        encoding: 'utf-8',
        compression: false,
        selectedFields: [],
        filters: {
            dateRange: 'all',
            status: 'all'
        }
    });

    const totalSteps = 4;

    // Get available fields from data
    const getAvailableFields = () => {
        if (!data || data.length === 0) return [];
        return Object.keys(data[0]);
    };

    // Format data for export
    const formatData = (data, format) => {
        if (!data || data.length === 0) return '';

        // Apply field selection
        let filteredData = data;
        if (exportConfig.selectedFields.length > 0) {
            filteredData = data.map(item => {
                const filtered = {};
                exportConfig.selectedFields.forEach(field => {
                    filtered[field] = item[field];
                });
                return filtered;
            });
        }

        switch (format) {
            case 'csv':
                return formatToCSV(filteredData);
            case 'excel':
                return formatToExcel(filteredData);
            case 'json':
                return formatToJSON(filteredData);
            case 'pdf':
                return formatToPDF(filteredData);
            default:
                return formatToCSV(filteredData);
        }
    };

    // CSV Format
    const formatToCSV = (data) => {
        if (!exportConfig.includeHeaders) {
            return data.map(row => Object.values(row).join(',')).join('\n');
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header];
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value || '';
            }).join(','))
        ].join('\n');

        return csvContent;
    };

    // Excel Format
    const formatToExcel = (data) => {
        return formatToCSV(data);
    };

    // JSON Format
    const formatToJSON = (data) => {
        return JSON.stringify(data, null, 2);
    };

    // PDF Format
    const formatToPDF = (data) => {
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
    };

    // Handle export
    const handleExport = () => {
        const content = formatData(data, exportConfig.format);
        downloadFile(content, exportConfig.format);

        if (onExport) {
            onExport({
                format: exportConfig.format,
                filename: `${filename}_${new Date().toISOString().split('T')[0]}`,
                recordCount: data.length,
                config: exportConfig
            });
        }

        onClose();
    };

    // Step navigation
    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Render step content
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="wizard-step">
                        <h3>Chọn Định Dạng Xuất</h3>
                        <div className="format-options">
                            {[
                                { value: 'csv', label: 'CSV', desc: 'Tệp văn bản phân cách bằng dấu phẩy', icon: '📊' },
                                { value: 'excel', label: 'Excel', desc: 'Tệp Microsoft Excel', icon: '📈' },
                                { value: 'json', label: 'JSON', desc: 'Tệp JavaScript Object Notation', icon: '📄' },
                                { value: 'pdf', label: 'PDF', desc: 'Tệp Portable Document Format', icon: '📋' }
                            ].map(format => (
                                <div
                                    key={format.value}
                                    className={`format-option ${exportConfig.format === format.value ? 'selected' : ''}`}
                                    onClick={() => setExportConfig(prev => ({ ...prev, format: format.value }))}
                                >
                                    <div className="format-icon">{format.icon}</div>
                                    <div className="format-info">
                                        <h4>{format.label}</h4>
                                        <p>{format.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="wizard-step">
                        <h3>Chọn Trường Dữ Liệu</h3>
                        <div className="fields-selection">
                            <div className="field-actions">
                                <button 
                                    className="select-all-btn"
                                    onClick={() => setExportConfig(prev => ({ 
                                        ...prev, 
                                        selectedFields: getAvailableFields() 
                                    }))}
                                >
                                    Chọn tất cả
                                </button>
                                <button 
                                    className="clear-btn"
                                    onClick={() => setExportConfig(prev => ({ 
                                        ...prev, 
                                        selectedFields: [] 
                                    }))}
                                >
                                    Bỏ chọn
                                </button>
                            </div>
                            <div className="fields-grid">
                                {getAvailableFields().map(field => (
                                    <label key={field} className="field-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={exportConfig.selectedFields.includes(field)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setExportConfig(prev => ({
                                                        ...prev,
                                                        selectedFields: [...prev.selectedFields, field]
                                                    }));
                                                } else {
                                                    setExportConfig(prev => ({
                                                        ...prev,
                                                        selectedFields: prev.selectedFields.filter(f => f !== field)
                                                    }));
                                                }
                                            }}
                                        />
                                        <span>{field}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="wizard-step">
                        <h3>Tùy Chọn Nâng Cao</h3>
                        <div className="advanced-options">
                            <div className="option-group">
                                <label className="option-item">
                                    <input
                                        type="checkbox"
                                        checked={exportConfig.includeHeaders}
                                        onChange={(e) => setExportConfig(prev => ({
                                            ...prev,
                                            includeHeaders: e.target.checked
                                        }))}
                                    />
                                    <span>Bao gồm tiêu đề</span>
                                </label>

                                <div className="option-item">
                                    <label>Định dạng ngày</label>
                                    <select
                                        value={exportConfig.dateFormat}
                                        onChange={(e) => setExportConfig(prev => ({
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
                                        value={exportConfig.encoding}
                                        onChange={(e) => setExportConfig(prev => ({
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
                                        checked={exportConfig.compression}
                                        onChange={(e) => setExportConfig(prev => ({
                                            ...prev,
                                            compression: e.target.checked
                                        }))}
                                    />
                                    <span>Nén tệp</span>
                                </label>
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="wizard-step">
                        <h3>Xác Nhận Xuất Dữ Liệu</h3>
                        <div className="export-summary">
                            <div className="summary-item">
                                <span className="label">Định dạng:</span>
                                <span className="value">{exportConfig.format.toUpperCase()}</span>
                            </div>
                            <div className="summary-item">
                                <span className="label">Số lượng bản ghi:</span>
                                <span className="value">{data?.length || 0}</span>
                            </div>
                            <div className="summary-item">
                                <span className="label">Trường được chọn:</span>
                                <span className="value">
                                    {exportConfig.selectedFields.length > 0 
                                        ? exportConfig.selectedFields.length 
                                        : 'Tất cả'}
                                </span>
                            </div>
                            <div className="summary-item">
                                <span className="label">Kích thước ước tính:</span>
                                <span className="value">
                                    ~{Math.round((formatData(data, exportConfig.format).length / 1024))}KB
                                </span>
                            </div>
                            <div className="summary-item">
                                <span className="label">Tên tệp:</span>
                                <span className="value">
                                    {filename}_{new Date().toISOString().split('T')[0]}.{exportConfig.format}
                                </span>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="export-wizard-overlay">
            <div className="export-wizard">
                <div className="wizard-header">
                    <h2>Wizard Xuất Dữ Liệu</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="wizard-progress">
                    <div className="progress-steps">
                        {[...Array(totalSteps)].map((_, index) => (
                            <div
                                key={index}
                                className={`step ${index + 1 <= currentStep ? 'active' : ''} ${index + 1 === currentStep ? 'current' : ''}`}
                            >
                                <div className="step-number">{index + 1}</div>
                                <div className="step-label">
                                    {index === 0 && 'Định dạng'}
                                    {index === 1 && 'Trường'}
                                    {index === 2 && 'Tùy chọn'}
                                    {index === 3 && 'Xác nhận'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="wizard-content">
                    {renderStepContent()}
                </div>

                <div className="wizard-footer">
                    <div className="footer-info">
                        <span>Bước {currentStep} / {totalSteps}</span>
                    </div>
                    <div className="footer-actions">
                        {currentStep > 1 && (
                            <button className="prev-btn" onClick={prevStep}>
                                ← Quay lại
                            </button>
                        )}
                        {currentStep < totalSteps ? (
                            <button 
                                className="next-btn" 
                                onClick={nextStep}
                                disabled={currentStep === 2 && exportConfig.selectedFields.length === 0}
                            >
                                Tiếp tục →
                            </button>
                        ) : (
                            <button className="export-btn" onClick={handleExport}>
                                📥 Xuất dữ liệu
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExportWizard;
