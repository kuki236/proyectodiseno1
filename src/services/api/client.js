/**
 * Cliente API base para comunicación con el backend
 * Implementa manejo de errores, autenticación y configuración centralizada
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  /**
   * Obtiene el token de autenticación del localStorage
   */
  getAuthToken() {
    return localStorage.getItem('authToken')
  }

  /**
   * Configura los headers con autenticación si existe token
   */
  getHeaders(customHeaders = {}) {
    const headers = { ...this.defaultHeaders, ...customHeaders }
    const token = this.getAuthToken()
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return headers
  }

  /**
   * Maneja errores de respuesta HTTP
   */
  async handleResponse(response) {
    if (!response.ok) {
      let errorMessage = 'Error en la petición'
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch (e) {
        errorMessage = response.statusText || errorMessage
      }

      const error = new Error(errorMessage)
      error.status = response.status
      error.statusText = response.statusText
      error.data = await response.json().catch(() => null)
      
      throw error
    }

    // Si la respuesta está vacía, retornar null
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return null
    }

    return response.json()
  }

  /**
   * Realiza una petición GET
   */
  async get(endpoint, params = {}, options = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`)
    
    // Agregar parámetros de consulta
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.append(key, params[key])
      }
    })

    const headers = options.headers ? { ...this.getHeaders(), ...options.headers } : this.getHeaders()

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: headers
    })

    return this.handleResponse(response)
  }

  /**
   * Realiza una petición POST
   */
  async post(endpoint, data = {}, options = {}) {
    const headers = options.headers ? { ...this.getHeaders(), ...options.headers } : this.getHeaders()
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    })

    return this.handleResponse(response)
  }

  /**
   * Realiza una petición PUT
   */
  async put(endpoint, data = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    })

    return this.handleResponse(response)
  }

  /**
   * Realiza una petición PATCH
   */
  async patch(endpoint, data = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    })

    return this.handleResponse(response)
  }

  /**
   * Realiza una petición DELETE
   */
  async delete(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    })

    return this.handleResponse(response)
  }

  /**
   * Sube un archivo (multipart/form-data)
   */
  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData()
    formData.append('file', file)
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key])
    })

    const headers = { ...this.getHeaders() }
    delete headers['Content-Type'] // Dejar que el navegador establezca el boundary

    const token = this.getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: headers,
      body: formData
    })

    return this.handleResponse(response)
  }
}

// Exportar instancia singleton
export default new ApiClient()

