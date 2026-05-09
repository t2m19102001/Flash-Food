import React from 'react';
import './ConfirmModal.scss';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Xóa", cancelText = "Hủy" }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div className="confirm-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <div className="confirm-icon">⚠️</div>
          <h3>{title || "Xác nhận xóa"}</h3>
        </div>
        <div className="confirm-modal-body">
          <p>{message || "Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?"}</p>
        </div>
        <div className="confirm-modal-footer">
          <button className="confirm-btn-cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button className="confirm-btn-confirm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;