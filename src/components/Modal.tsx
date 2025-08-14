import React, { useEffect } from 'react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  title?: string;
  message?: React.ReactNode;
  icon?: React.ReactNode;
  confirmText?: string; // defaults to OK
  cancelText?: string; // if provided, shows cancel button
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void; // fallback close handler
  dangerous?: boolean; // styles the confirm as danger
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  message,
  icon,
  confirmText = 'OK',
  cancelText,
  onConfirm,
  onCancel,
  onClose,
  dangerous,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        (onCancel || onClose)?.();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onCancel, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    (onCancel || onClose)?.();
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <div className="modal" onClick={stop}>
        {(title || icon) && (
          <div className="modal-header">
            {icon && <span className="modal-icon" aria-hidden>{icon}</span>}
            {title && <h3 className="modal-title">{title}</h3>}
          </div>
        )}
        {message && <div className="modal-body">{typeof message === 'string' ? <p>{message}</p> : message}</div>}
        <div className="modal-footer">
          {cancelText && (
            <button className="btn" onClick={onCancel || onClose}>{cancelText}</button>
          )}
          <button
            className={`btn ${dangerous ? 'danger' : 'primary'}`}
            onClick={onConfirm || onClose}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
