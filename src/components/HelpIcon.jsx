import React from 'react';

/**
 * HelpIcon component - A tiny "?" icon inside a small circular badge.
 * Features a subtle hover effect and cursor pointer.
 * 
 * @param {Object} props
 * @param {Function} props.onClick - Function to call when the icon is clicked
 * @param {Object} props.style - Optional additional styles
 */
export default function HelpIcon({ onClick, style = {} }) {
    return (
        <span
            onClick={onClick}
            title="Click for help"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: '11px',
                fontWeight: 'bold',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                marginLeft: '6px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                userSelect: 'none',
                verticalAlign: 'middle',
                ...style
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(79, 124, 255, 0.2)';
                e.currentTarget.style.color = 'var(--text-main)';
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 0 8px rgba(79, 124, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            ?
        </span>
    );
}
