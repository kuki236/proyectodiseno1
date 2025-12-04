import React from 'react'

const ErrorMessage = ({ message, onRetry, onDismiss }) => {
  return (
    <div style={{
      padding: '1rem',
      margin: '1rem 0',
      backgroundColor: 'rgba(var(--color-error-rgb), 0.1)',
      border: '1px solid var(--color-error)',
      borderRadius: 'var(--radius-base)',
      color: 'var(--color-error)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <span>{message}</span>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {onRetry && (
          <button 
            className="btn-secondary"
            onClick={onRetry}
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
          >
            Reintentar
          </button>
        )}
        {onDismiss && (
          <button 
            className="btn-secondary"
            onClick={onDismiss}
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

export default ErrorMessage

