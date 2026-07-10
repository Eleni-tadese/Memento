import React from 'react';

const ConfirmModal = ({ isOpen, title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onCancel}
    >
      <div
        className="memento-card rounded-xl p-6 shadow-2xl max-w-sm w-full mx-auto transition-all duration-200 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-gold-light font-display text-lg mb-2">{title}</h2>
        <p className="font-serif text-cream/80 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gold/10 text-cream px-4 py-2 rounded-lg hover:bg-gold/20 transition-colors text-sm font-medium border border-gold/20"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
