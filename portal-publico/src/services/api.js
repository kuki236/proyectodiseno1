const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`)
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.append(key, params[key])
      }
    })

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`)
    }

    return response.json()
  }

  async post(endpoint, data = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Error: ${response.statusText}`)
    }

    return response.json()
  }

  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData()
    formData.append('archivo', file)
    
    // El backend espera 'datos' como un objeto JSON en un RequestPart
    // Necesitamos crear un Blob con el JSON
    const datosBlob = new Blob([JSON.stringify(additionalData)], {
      type: 'application/json'
    })
    formData.append('datos', datosBlob)

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Error: ${response.statusText}`)
    }

    return response.json()
  }
}

export default new ApiClient()

