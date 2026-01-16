import React, { useEffect } from 'react';

/**
 * ApiKeyHelpModal - A lightweight help panel showing instructions on how to get a TMDB API Key.
 * 
 * @param {Object} props
 * @param {Function} props.onClose - Function to close the modal
 */
export default function ApiKeyHelpModal({ onClose }) {
    // Handle ESC key to close
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.keyCode === 27) onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div
            className="modal-backdrop"
            onClick={onClose}
            style={{
                zIndex: 2000,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(2px)'
            }}
        >
            <div
                className="modal"
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '380px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                    position: 'relative'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontSize: 18, color: 'var(--text-main)' }}>
                        How to get a TMDB API Key
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '50%'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="12"></line>
                        </svg>
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                        { step: 1, text: 'Go to ', link: 'https://www.themoviedb.org', linkText: 'themoviedb.org' },
                        { step: 2, text: 'Create a free account or log in', image: 'C:/Users/SER/.gemini/antigravity/brain/905119d4-b2b4-430a-b9e6-ddbead0b3ca6/tmdb_login_screenshot_1768536205714.png' },
                        { step: 3, text: 'Open Profile → Settings' },
                        { step: 4, text: 'Navigate to API section' },
                        { step: 5, text: 'Apply for a v3 API Key (Developer/Personal)', image: 'C:/Users/SER/.gemini/antigravity/brain/905119d4-b2b4-430a-b9e6-ddbead0b3ca6/tmdb_api_page_screenshot_1768536222585.png' },
                        { step: 6, text: 'Copy the generated API key' },
                        { step: 7, text: 'Paste it into the app and click Save' }
                    ].map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: '22px',
                                    height: '22px',
                                    backgroundColor: 'rgba(79, 124, 255, 0.15)',
                                    color: 'var(--accent)',
                                    borderRadius: '50%',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    marginTop: '1px'
                                }}>
                                    {item.step}
                                </span>
                                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', color: 'var(--text-main)' }}>
                                    {item.text}
                                    {item.link && (
                                        <a
                                            href={item.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                color: 'var(--accent)',
                                                textDecoration: 'none',
                                                fontWeight: '500',
                                                borderBottom: '1px solid rgba(79, 124, 255, 0.3)'
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = 'var(--accent)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = 'rgba(79, 124, 255, 0.3)')}
                                        >
                                            {item.linkText}
                                        </a>
                                    )}
                                </p>
                            </div>
                            {item.image && (
                                <div style={{ paddingLeft: '34px' }}>
                                    <img
                                        src={`file:///${item.image}`}
                                        alt={`Step ${item.step} illustration`}
                                        style={{
                                            width: '100%',
                                            maxWidth: '280px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            marginTop: '4px'
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div style={{
                    marginTop: '20px',
                    padding: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#10b981' }}>
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                        TMDB API keys are free and safe for personal use.
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#f59e0b' }}>
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        Do not share your key publicly.
                    </div>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={onClose}
                    style={{ width: '100%', marginTop: '16px' }}
                >
                    Got it
                </button>
            </div>
        </div>
    );
}
