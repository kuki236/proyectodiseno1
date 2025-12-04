/**
 * Servicio para gestión de ofertas laborales
 * Implementa IServicioOferta según diagrama UML
 */
import apiClient from './client'
import { Oferta, EmitirOfertaDTO, EstadoOferta } from '../../types'

class OfertaService {
  /**
   * Emitir una oferta laboral
   */
  async emitirOferta(ofertaDTO) {
    try {
      const data = await apiClient.post('/ofertas', ofertaDTO)
      return new Oferta(data)
    } catch (error) {
      console.error('Error al emitir oferta:', error)
      throw error
    }
  }

  /**
   * Registrar respuesta de oferta (aceptar/rechazar)
   */
  async registrarRespuestaOferta(idOferta, aceptada, motivo = null) {
    try {
      const data = await apiClient.patch(`/ofertas/${idOferta}/respuesta`, {
        aceptada: aceptada,
        motivo: motivo
      })
      return new Oferta(data)
    } catch (error) {
      console.error('Error al registrar respuesta de oferta:', error)
      throw error
    }
  }

  /**
   * Obtener ofertas pendientes
   */
  async obtenerOfertasPendientes(filtros = {}) {
    try {
      const params = {
        estado: EstadoOferta.PENDIENTE,
        ...filtros
      }
      const data = await apiClient.get('/ofertas', params)
      return Array.isArray(data) ? data.map(o => new Oferta(o)) : []
    } catch (error) {
      console.error('Error al obtener ofertas pendientes:', error)
      throw error
    }
  }

  /**
   * Generar documento de oferta (PDF)
   */
  async generarDocumentoOferta(idOferta) {
    try {
      const response = await fetch(`${apiClient.baseURL}/ofertas/${idOferta}/documento`, {
        method: 'GET',
        headers: apiClient.getHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Error al generar documento')
      }

      const blob = await response.blob()
      return blob
    } catch (error) {
      console.error('Error al generar documento de oferta:', error)
      throw error
    }
  }

  /**
   * Obtener oferta por ID
   */
  async obtenerOfertaPorId(idOferta) {
    try {
      const data = await apiClient.get(`/ofertas/${idOferta}`)
      return new Oferta(data)
    } catch (error) {
      console.error('Error al obtener oferta:', error)
      throw error
    }
  }

  /**
   * Obtener ofertas de un candidato
   */
  async obtenerOfertasPorCandidato(idCandidato) {
    try {
      const data = await apiClient.get(`/ofertas/candidato/${idCandidato}`)
      return Array.isArray(data) ? data.map(o => new Oferta(o)) : []
    } catch (error) {
      console.error('Error al obtener ofertas del candidato:', error)
      throw error
    }
  }

  /**
   * Cancelar una oferta
   */
  async cancelarOferta(idOferta, motivo) {
    try {
      const data = await apiClient.patch(`/ofertas/${idOferta}/cancelar`, {
        motivo,
        estado: EstadoOferta.CANCELADA
      })
      return new Oferta(data)
    } catch (error) {
      console.error('Error al cancelar oferta:', error)
      throw error
    }
  }
}

export default new OfertaService()

