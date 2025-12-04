import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/api/authService'
import { useNotification } from '../components/common/NotificationProvider'
import './Login.css'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { error: showErrorNotification, success: showSuccessNotification } = useNotification()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!username || !password) {
      const msg = 'Por favor completa todos los campos'
      setError(msg)
      showErrorNotification(msg)
      return
    }

    setLoading(true)
    try {
      await authService.login(username, password)
      showSuccessNotification('Inicio de sesión exitoso')
      navigate('/posiciones')
    } catch (err) {
      let errorMessage = 'Error al iniciar sesión'
      if (err.data?.message) {
        errorMessage = err.data.message
      } else if (err.message) {
        errorMessage = err.message
      }
      setError(errorMessage)
      showErrorNotification(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo"></div>
          <h1 className="login-title">Sistema de Recursos Humanos</h1>
          <p className="login-subtitle">Ingrese sus credenciales para acceder</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese su nombre de usuario"
              className="form-input"
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              className="form-input"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-info">
          <div className="login-info-title">
            Credenciales de Prueba
          </div>
          <div className="login-info-content">
            <div className="login-info-row">
              <strong>Usuario:</strong> admin
            </div>
            <div className="login-info-row">
              <strong>Contraseña:</strong> admin123
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

