import React, { useState, useEffect, useMemo } from 'react';
import './SearchComponents.scss';

// Advanced Search Component
export const AdvancedSearch = ({ 
    onSearch, 
    placeholder = 'Tìm kiếm...', 
    filters = [], 
    showFilters = true,
    debounceMs = 300 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState({});
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(searchTerm, activeFilters);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [searchTerm, activeFilters, debounceMs, onSearch]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        // Show suggestions for short searches
        if (value.length >= 2 && value.length <= 20) {
            // Generate suggestions (this would normally come from API)
            const mockSuggestions = [
                `${value} - Người dùng`,
                `${value} - Đơn hàng`,
                `${value} - Sản phẩm`
            ].slice(0, 5);
            setSuggestions(mockSuggestions);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleFilterChange = (filterName, value) => {
        setActiveFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    const clearFilters = () => {
        setActiveFilters({});
        setSearchTerm('');
        setShowSuggestions(false);
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion.split(' - ')[0]);
        setShowSuggestions(false);
    };

    return (
        <div className="advanced-search">
            <div className="search-input-wrapper">
                <div className="search-input-container">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder={placeholder}
                        className="search-input"
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    />
                    {searchTerm && (
                        <button 
                            className="clear-search-btn"
                            onClick={() => setSearchTerm('')}
                        >
                            ✕
                        </button>
                    )}
                </div>
                
                {/* Search Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="search-suggestions">
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className="suggestion-item"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                <span className="suggestion-icon">🔍</span>
                                <span className="suggestion-text">{suggestion}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showFilters && (
                <div className="search-controls">
                    <button 
                        className="advanced-toggle-btn"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                        <span className="toggle-icon">⚙️</span>
                        <span>Bộ lọc nâng cao</span>
                        <span className={`arrow ${showAdvanced ? 'up' : 'down'}`}>▼</span>
                    </button>
                    
                    {Object.keys(activeFilters).length > 0 && (
                        <button 
                            className="clear-filters-btn"
                            onClick={clearFilters}
                        >
                            <span>🗑️</span>
                            Xóa bộ lọc
                        </button>
                    )}
                </div>
            )}

            {/* Advanced Filters */}
            {showAdvanced && showFilters && (
                <div className="advanced-filters">
                    <div className="filters-grid">
                        {filters.map((filter) => (
                            <div key={filter.name} className="filter-item">
                                <label className="filter-label">{filter.label}</label>
                                {filter.type === 'select' && (
                                    <select
                                        value={activeFilters[filter.name] || ''}
                                        onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="">{filter.placeholder || 'Tất cả'}</option>
                                        {filter.options?.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                
                                {filter.type === 'date' && (
                                    <input
                                        type="date"
                                        value={activeFilters[filter.name] || ''}
                                        onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                                        className="filter-date"
                                    />
                                )}
                                
                                {filter.type === 'range' && (
                                    <div className="range-filter">
                                        <input
                                            type="number"
                                            placeholder="Từ"
                                            value={activeFilters[`${filter.name}_min`] || ''}
                                            onChange={(e) => handleFilterChange(`${filter.name}_min`, e.target.value)}
                                            className="range-input"
                                        />
                                        <span>-</span>
                                        <input
                                            type="number"
                                            placeholder="Đến"
                                            value={activeFilters[`${filter.name}_max`] || ''}
                                            onChange={(e) => handleFilterChange(`${filter.name}_max`, e.target.value)}
                                            className="range-input"
                                        />
                                    </div>
                                )}
                                
                                {filter.type === 'checkbox' && (
                                    <div className="checkbox-group">
                                        {filter.options?.map((option) => (
                                            <label key={option.value} className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={activeFilters[filter.name]?.includes(option.value) || false}
                                                    onChange={(e) => {
                                                        const currentValues = activeFilters[filter.name] || [];
                                                        if (e.target.checked) {
                                                            handleFilterChange(filter.name, [...currentValues, option.value]);
                                                        } else {
                                                            handleFilterChange(filter.name, currentValues.filter(v => v !== option.value));
                                                        }
                                                    }}
                                                />
                                                <span>{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Filters Display */}
            {Object.keys(activeFilters).length > 0 && (
                <div className="active-filters">
                    <span className="active-filters-label">Đang lọc:</span>
                    <div className="active-filter-tags">
                        {Object.entries(activeFilters).map(([key, value]) => {
                            if (!value || (Array.isArray(value) && value.length === 0)) return null;
                            
                            const filter = filters.find(f => f.name === key || f.name === key.replace('_min', '').replace('_max', ''));
                            const displayValue = Array.isArray(value) ? value.join(', ') : value;
                            
                            return (
                                <span key={key} className="filter-tag">
                                    {filter?.label || key}: {displayValue}
                                    <button 
                                        onClick={() => handleFilterChange(key, '')}
                                        className="remove-filter"
                                    >
                                        ✕
                                    </button>
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

// Search Results Component
export const SearchResults = ({ 
    results, 
    loading, 
    searchTerm, 
    totalResults, 
    renderItem,
    emptyMessage = 'Không tìm thấy kết quả',
    loadingMessage = 'Đang tìm kiếm...'
}) => {
    if (loading) {
        return (
            <div className="search-results loading">
                <div className="loading-spinner">
                    <span className="spinner"></span>
                    <span>{loadingMessage}</span>
                </div>
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="search-results empty">
                <div className="empty-state">
                    <span className="empty-icon">🔍</span>
                    <h3>Không tìm thấy kết quả</h3>
                    <p>
                        {searchTerm 
                            ? `Không tìm thấy kết quả cho "${searchTerm}"`
                            : emptyMessage
                        }
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="search-results">
            <div className="results-header">
                <span className="results-count">
                    Tìm thấy {totalResults} kết quả
                    {searchTerm && ` cho "${searchTerm}"`}
                </span>
            </div>
            <div className="results-list">
                {results.map((result, index) => (
                    <div key={result.id || index} className="result-item">
                        {renderItem(result, index)}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Search Hook for real-time search
export const useSearch = (data, searchKeys = ['name', 'email']) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});

    const filteredData = useMemo(() => {
        if (!searchTerm && Object.keys(filters).length === 0) {
            return data;
        }

        return data.filter(item => {
            // Search term filtering
            const matchesSearch = !searchTerm || searchKeys.some(key => {
                const value = item[key];
                return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });

            // Filter filtering
            const matchesFilters = Object.entries(filters).every(([key, value]) => {
                if (!value || (Array.isArray(value) && value.length === 0)) return true;
                
                const itemValue = item[key];
                if (Array.isArray(value)) {
                    return value.includes(itemValue);
                }
                
                return itemValue === value || 
                    (key.includes('_min') && itemValue >= parseFloat(value)) ||
                    (key.includes('_max') && itemValue <= parseFloat(value));
            });

            return matchesSearch && matchesFilters;
        });
    }, [data, searchTerm, searchKeys, filters]);

    return {
        searchTerm,
        setSearchTerm,
        filters,
        setFilters,
        filteredData,
        resultCount: filteredData.length
    };
};

// Quick Search Component (for inline search)
export const QuickSearch = ({ 
    data, 
    searchKeys, 
    onSelect, 
    placeholder = 'Tìm kiếm nhanh...',
    maxResults = 5 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    
    const { filteredData } = useSearch(data, searchKeys);
    
    const results = filteredData.slice(0, maxResults);

    const handleSelect = (item) => {
        onSelect(item);
        setSearchTerm('');
        setIsOpen(false);
    };

    return (
        <div className="quick-search">
            <div className="quick-search-input">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                />
                {searchTerm && (
                    <button 
                        className="clear-btn"
                        onClick={() => setSearchTerm('')}
                    >
                        ✕
                    </button>
                )}
            </div>
            
            {isOpen && searchTerm && (
                <div className="quick-search-results">
                    {results.length > 0 ? (
                        results.map((item) => (
                            <div
                                key={item.id}
                                className="quick-search-result"
                                onClick={() => handleSelect(item)}
                            >
                                <div className="result-content">
                                    <span className="result-title">
                                        {searchKeys.map(key => item[key]).join(' - ')}
                                    </span>
                                    <span className="result-subtitle">
                                        {item.subtitle || item.description}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-results">
                            <span>Không tìm thấy kết quả</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default {
    AdvancedSearch,
    SearchResults,
    useSearch,
    QuickSearch
};
