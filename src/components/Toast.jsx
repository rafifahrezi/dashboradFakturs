import React, { useEffect } from 'react';

/**
 * Toast Notification Component
 * @component
 * @param {Object} props - Component props
 * @param {string} props.message - Toast message content
 * @param {('success'|'error'|'warning'|'info')} props.type - Toast type
 * @param {Function} props.onClose - Callback when toast closes
 * @param {number} props.duration - Auto-close duration in ms
 * @returns {JSX.Element}
 */
const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
    // Auto-close timer effect
    useEffect(() => {
        if (duration > 0 && onClose) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [duration, onClose]);

    // Style configuration for each toast type
    const toastStyles = {
        success: 'bg-green-100 border-green-400 text-green-800',
        error: 'bg-red-100 border-red-400 text-red-800',
        warning: 'bg-yellow-100 border-yellow-400 text-yellow-800',
        info: 'bg-blue-100 border-blue-400 text-blue-800',
    };

    // Icon configuration for each toast type
    const toastIcons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
    };

    const backgroundClass = toastStyles[type] || toastStyles.info;
    const icon = toastIcons[type] || toastIcons.info;

    return (
        <div
            className={`fixed bottom-4 right-4 p-4 border-l-4 rounded shadow-lg ${backgroundClass}`}
            role="alert"
            aria-live="polite"
        >
            <div className="flex items-center gap-3">
                {/* Icon */}
                <span className="text-xl font-bold flex-shrink-0">{icon}</span>
                {/* Message */}
                <span className="text-sm font-medium flex-1">{message}</span>
                {/* Close button */}
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="ml-3 font-bold opacity-75 hover:opacity-100 transition-opacity flex-shrink-0"
                        aria-label="Close notification"
                    >
                        ×
                    </button>
                )}
            </div>
        </div>
    );
};

export default Toast;