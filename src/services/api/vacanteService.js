/**
 * Servicio para gestión de vacantes
 * Implementa IServicioVacante según diagrama UML
 */
import apiClient from './client'
import { Vacante, CrearVacanteDTO, EstadoVacante } from '../../types'

class VacanteService {
  /**
   * Crear una nueva vacante
   */
  async crearVacante(vacanteDTO) {
    try {
      const data = await apiClient.post('/vacantes', vacanteDTO)
      return new Vacante(data)
    } catch (error) {
      console.error('Error al crear vacante:', error)
      throw error
    }
  }

  /**
   * Publicar una vacante (cambiar estado a ABIERTA)
   */
  async publicarVacante(idVacante) {
    try {
      const data = await apiClient.put(`/vacantes/${idVacante}/publicar`)
      return new Vacante(data)
    } catch (error) {
      console.error('Error al publicar vacante:', error)
      throw error
    }
  }

  /**
   * Cerrar una vacante (cambiar estado a CERRADA)
   */
  async cerrarVacante(idVacante) {
    try {
      const data = await apiClient.put(`/vacantes/${idVacante}/cerrar`)
      return new Vacante(data)
    } catch (error) {
      console.error('Error al cerrar vacante:', error)
      throw error
    }
  }

  /**
   * Actualizar estado de una vacante
   */
  async actualizarEstado(idVacante, nuevoEstado) {
    try {
      const data = await apiClient.patch(`/vacantes/${idVacante}/estado`, {
        estado: nuevoEstado
      })
      return new Vacante(data)
    } catch (error) {
      console.error('Error al actualizar estado de vacante:', error)
      throw error
    }
  }

  /**
   * Buscar vacantes activas
   */
  async buscarVacantesActivas(filtros = {}) {
    try {
      const params = {
        estado: EstadoVacante.ABIERTA,
        ...filtros
      }
      const data = await apiClient.get('/vacantes', params)
      return Array.isArray(data) ? data.map(v => new Vacante(v)) : []
    } catch (error) {
      console.error('Error al buscar vacantes activas:', error)
      throw error
    }
  }

  /**
   * Obtener todas las vacantes (con filtros opcionales)
   */
  async obtenerVacantes(filtros = {}) {
    try {
      const data = await apiClient.get('/vacantes', filtros)
      return Array.isArray(data) ? data.map(v => new Vacante(v)) : []
    } catch (error) {
      console.error('Error al obtener vacantes:', error)
      throw error
    }
  }

  /**
   * Obtener una vacante por ID
   */
  async obtenerVacantePorId(idVacante) {
    try {
      const data = await apiClient.get(`/vacantes/${idVacante}`)
      return new Vacante(data)
    } catch (error) {
      console.error('Error al obtener vacante:', error)
      throw error
    }
  }

  /**
   * Actualizar una vacante
   */
  async actualizarVacante(idVacante, vacanteDTO) {
    try {
      const data = await apiClient.put(`/vacantes/${idVacante}`, vacanteDTO)
      return new Vacante(data)
    } catch (error) {
      console.error('Error al actualizar vacante:', error)
      throw error
    }
  }

  /**
   * Eliminar una vacante
   */
  async eliminarVacante(idVacante) {
    try {
      await apiClient.delete(`/vacantes/${idVacante}`)
      return true
    } catch (error) {
      console.error('Error al eliminar vacante:', error)
      throw error
    }
  }

  /**
   * Obtener estadísticas de una vacante
   */
  async obtenerEstadisticas(idVacante) {
    try {
      const data = await apiClient.get(`/vacantes/${idVacante}/estadisticas`)
      return data
    } catch (error) {
      console.error('Error al obtener estadísticas:', error)
      throw error
    }
  }
}

export default new VacanteService()

