import React from 'react';
import './Loading.scss';

// Skeleton Loader cho cards
export const SkeletonCard = ({ count = 1 }) => (
  <div className="skeleton-container">
    {[...Array(count)].map((_, index) => (
      <div key={index} className="skeleton-card">
        <div className="skeleton-header">
          <div className="skeleton-avatar"></div>
          <div className="skeleton-info">
            <div className="skeleton-line title"></div>
            <div className="skeleton-line subtitle"></div>
          </div>
        </div>
        <div className="skeleton-content">
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
        </div>
      </div>
    ))}
  </div>
);

// Skeleton Loader cho table
export const SkeletonTable = ({ rows = 5, columns = 7 }) => (
  <div className="skeleton-table">
    <div className="skeleton-table-header">
      {[...Array(columns)].map((_, index) => (
        <div key={index} className="skeleton-header-cell"></div>
      ))}
    </div>
    {[...Array(rows)].map((_, rowIndex) => (
      <div key={rowIndex} className="skeleton-table-row">
        {[...Array(columns)].map((_, colIndex) => (
          <div key={colIndex} className="skeleton-cell">
            {colIndex === 0 && <div className="skeleton-avatar small"></div>}
            {colIndex !== 0 && <div className="skeleton-line"></div>}
          </div>
        ))}
      </div>
    ))}
  </div>
);

// Skeleton Loader cho dashboard stats
export const SkeletonStats = ({ count = 4 }) => (
  <div className="skeleton-stats">
    {[...Array(count)].map((_, index) => (
      <div key={index} className="skeleton-stat-card">
        <div className="skeleton-icon"></div>
        <div className="skeleton-content">
          <div className="skeleton-line title"></div>
          <div className="skeleton-line value"></div>
          <div className="skeleton-line label"></div>
        </div>
      </div>
    ))}
  </div>
);

// Spinner loading component
export const Spinner = ({ size = 'medium', text = 'Đang tải...' }) => (
  <div className="spinner-container">
    <div className={`spinner ${size}`}>
      <div className="spinner-circle"></div>
    </div>
    {text && <p className="spinner-text">{text}</p>}
  </div>
);

// Loading overlay
export const LoadingOverlay = ({ show, text = 'Đang xử lý...' }) => {
  if (!show) return null;
  
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <Spinner size="large" text={text} />
      </div>
    </div>
  );
};

// Progress bar loader
export const ProgressBar = ({ progress = 0, showPercentage = true }) => (
  <div className="progress-container">
    <div className="progress-bar">
      <div 
        className="progress-fill" 
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      ></div>
    </div>
    {showPercentage && (
      <span className="progress-text">{Math.round(progress)}%</span>
    )}
  </div>
);

// Pulse animation component
export const Pulse = ({ children }) => (
  <div className="pulse-wrapper">
    {children}
  </div>
);

export default {
  SkeletonCard,
  SkeletonTable,
  SkeletonStats,
  Spinner,
  LoadingOverlay,
  ProgressBar,
  Pulse
};
