/**
 * Servicio para gestión de entrevistas
 * Implementa IServicioEntrevista según diagrama UML
 */
import apiClient from './client'
import { Entrevista, ProgramarEntrevistaDTO } from '../../types'

class EntrevistaService {
  /**
   * Programar una entrevista
   */
  async programarEntrevista(entrevistaDTO) {
    try {
      const data = await apiClient.post('/entrevistas', entrevistaDTO)
      return new Entrevista(data)
    } catch (error) {
      console.error('Error al programar entrevista:', error)
      throw error
    }
  }

  /**
   * Reprogramar una entrevista
   */
  async reprogramarEntrevista(idEntrevista, nuevaFecha, nuevaHora) {
    try {
      const data = await apiClient.patch(`/entrevistas/${idEntrevista}/reprogramar`, {
        fecha: nuevaFecha,
        hora: nuevaHora
      })
      return new Entrevista(data)
    } catch (error) {
      console.error('Error al reprogramar entrevista:', error)
      throw error
    }
  }

  /**
   * Registrar resultados de una entrevista
   */
  async registrarResultados(idEntrevista, resultados) {
    try {
      const data = await apiClient.patch(`/entrevistas/${idEntrevista}/resultados`, {
        calificacion: resultados.calificacion,
        observaciones: resultados.observaciones,
        estado: resultados.estado || 'COMPLETADA'
      })
      return new Entrevista(data)
    } catch (error) {
      console.error('Error al registrar resultados:', error)
      throw error
    }
  }

  /**
   * Verificar disponibilidad para entrevista
   */
  async verificarDisponibilidad(fecha, hora, entrevistador) {
    try {
      const data = await apiClient.post('/entrevistas/disponibilidad', {
        fecha,
        hora,
        entrevistador
      })
      return data
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error)
      throw error
    }
  }

  /**
   * Obtener entrevistas pendientes
   */
  async obtenerEntrevistasPendientes(filtros = {}) {
    try {
      const params = {
        estado: 'PENDIENTE',
        ...filtros
      }
      const data = await apiClient.get('/entrevistas', params)
      return Array.isArray(data) ? data.map(e => new Entrevista(e)) : []
    } catch (error) {
      console.error('Error al obtener entrevistas pendientes:', error)
      throw error
    }
  }

  /**
   * Obtener entrevista por ID
   */
  async obtenerEntrevistaPorId(idEntrevista) {
    try {
      const data = await apiClient.get(`/entrevistas/${idEntrevista}`)
      return new Entrevista(data)
    } catch (error) {
      console.error('Error al obtener entrevista:', error)
      throw error
    }
  }

  /**
   * Obtener entrevistas de un candidato
   */
  async obtenerEntrevistasPorCandidato(idCandidato) {
    try {
      const data = await apiClient.get(`/entrevistas/candidato/${idCandidato}`)
      return Array.isArray(data) ? data.map(e => new Entrevista(e)) : []
    } catch (error) {
      console.error('Error al obtener entrevistas del candidato:', error)
      throw error
    }
  }

  /**
   * Cancelar una entrevista
   */
  async cancelarEntrevista(idEntrevista, motivo) {
    try {
      const data = await apiClient.patch(`/entrevistas/${idEntrevista}/cancelar`, {
        motivo,
        estado: 'CANCELADA'
      })
      return new Entrevista(data)
    } catch (error) {
      console.error('Error al cancelar entrevista:', error)
      throw error
    }
  }
}

export default new EntrevistaService()

