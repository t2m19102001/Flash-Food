// src/components/ErrorBoundary/ErrorBoundary.jsx
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lỗi component:', error, errorInfo);
    // Gửi log lên server nếu cần
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <p>Đã có lỗi xảy ra. Vui lòng tải lại trang.</p>
          <button onClick={() => window.location.reload()}>Tải lại</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;