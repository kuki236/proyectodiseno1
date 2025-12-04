/**
 * Servicio para autenticación
 */
import apiClient from './client'

class AuthService {
  /**
   * Iniciar sesión
   */
  async login(username, password) {
    try {
      const data = await apiClient.post('/auth/login', {
        username,
        password
      })
      
      // Guardar token en localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('user', JSON.stringify({
          idUsuario: data.idUsuario,
          username: data.username,
          nombreCompleto: data.nombreCompleto,
          email: data.email,
          idReclutador: data.idReclutador,
          tipoUsuario: data.tipoUsuario
        }))
      }
      if (data.token) {  
  console.log('Datos del usuario que inicia sesión:', data);  
  console.log('Tipo de usuario:', data.tipoUsuario);  
  console.log('¿Es administrador?', data.tipoUsuario === 'ADMINISTRADOR');  
    
  localStorage.setItem('authToken', data.token)  
  localStorage.setItem('user', JSON.stringify({  
    idUsuario: data.idUsuario,  
    username: data.username,  
    nombreCompleto: data.nombreCompleto,  
    email: data.email,  
    idReclutador: data.idReclutador,  
    tipoUsuario: data.tipoUsuario  
  }))  
}
      return data
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      throw error
    }
  }

  /**
   * Cerrar sesión
   */
  async logout() {
    try {
      // El token ya se envía automáticamente por el cliente API
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    }
  }

  /**
   * Validar token
   */
  async validateToken() {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        return false
      }
      
      // El token ya se envía automáticamente por el cliente API
      const data = await apiClient.get('/auth/validate')
      
      return data.valid === true
    } catch (error) {
      console.error('Error al validar token:', error)
      return false
    }
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch (e) {
        return null
      }
    }
    return null
  }

  /**
   * Obtener token
   */
  getToken() {
    return localStorage.getItem('authToken')
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated() {
    return !!localStorage.getItem('authToken')
  }
}

export default new AuthService()

