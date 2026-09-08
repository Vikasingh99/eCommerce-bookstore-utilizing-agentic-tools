'use client';

import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColor = {
    success: '#1a7a4a',
    error: '#c0392b',
    info: '#1a1a2e',
    warning: '#d68910',
  }[type] || '#1a1a2e';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        minWidth: '280px',
        maxWidth: '420px',
        backgroundColor: bgColor,
        color: '#fff',
        borderRadius: '10px',
        padding: '0.9rem 1.2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        animation: 'slideUp 0.3s ease',
      }}
    >
      <span style={{ fontSize: '1.1rem' }}>
        {type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
      </span>
      <span style={{ flex: 1, fontSize: '0.92rem' }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          opacity: 0.7,
          cursor: 'pointer',
          fontSize: '1rem',
          padding: 0,
        }}
      >
        ✕
      </button>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
