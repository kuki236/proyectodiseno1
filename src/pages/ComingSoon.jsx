import React from 'react'

const ComingSoon = ({ title = 'Funcionalidad en desarrollo' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '40px',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '64px',
        marginBottom: '20px',
        opacity: 0.3
      }}>
        🚧
      </div>
      <h2 style={{
        fontSize: '28px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '10px'
      }}>
        {title}
      </h2>
      <p style={{
        fontSize: '16px',
        color: '#666',
        maxWidth: '500px'
      }}>
        Esta funcionalidad está en desarrollo y estará disponible próximamente.
      </p>
    </div>
  )
}

export default ComingSoon

