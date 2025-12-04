/**
 * Servicio para gestión de reclutamiento y selección
 * Implementa IServicioReclutamiento según diagrama UML
 */
import apiClient from './client'
import { PostulanteProceso, FiltrarCandidatosDTO, EtapaProceso, EstadoPostulante } from '../../types'

class ReclutamientoService {
  /**
   * Vincular candidato a una vacante
   */
  async vincularCandidatoVacante(idCandidato, idVacante) {
    try {
      const data = await apiClient.post('/reclutamiento/vincular', {
        idCandidato,
        idVacante
      })
      return new PostulanteProceso(data)
    } catch (error) {
      console.error('Error al vincular candidato:', error)
      throw error
    }
  }

  /**
   * Filtrar y calificar candidatos según criterios
   */
  async filtrarCandidatos(filtroDTO) {
    try {
      const data = await apiClient.post('/reclutamiento/filtrar', filtroDTO)
      return Array.isArray(data) ? data.map(c => new PostulanteProceso(c)) : []
    } catch (error) {
      console.error('Error al filtrar candidatos:', error)
      throw error
    }
  }

  /**
   * Evaluar un candidato
   */
  async evaluarCandidato(idCandidato, idProceso, evaluacion) {
    try {
      const data = await apiClient.post('/reclutamiento/evaluar', {
        idCandidato,
        idProceso,
        ...evaluacion
      })
      return data
    } catch (error) {
      console.error('Error al evaluar candidato:', error)
      throw error
    }
  }

  /**
   * Mover candidato entre etapas del proceso
   */
  async moverCandidatoEtapa(idPostulanteProceso, nuevaEtapa) {
    try {
      const data = await apiClient.patch(`/reclutamiento/${idPostulanteProceso}/etapa`, {
        etapa: nuevaEtapa
      })
      return new PostulanteProceso(data)
    } catch (error) {
      console.error('Error al mover candidato de etapa:', error)
      throw error
    }
  }

  /**
   * Obtener candidatos por etapa
   */
  async obtenerCandidatosPorEtapa(idProceso, etapa) {
    try {
      const data = await apiClient.get(`/reclutamiento/proceso/${idProceso}/etapa/${etapa}`)
      return Array.isArray(data) ? data.map(c => new PostulanteProceso(c)) : []
    } catch (error) {
      console.error('Error al obtener candidatos por etapa:', error)
      throw error
    }
  }

  /**
   * Calcular compatibilidad de candidato con vacante
   */
  async calcularCompatibilidad(idCandidato, idVacante) {
    try {
      const data = await apiClient.get(`/reclutamiento/compatibilidad`, {
        idCandidato,
        idVacante
      })
      return data
    } catch (error) {
      console.error('Error al calcular compatibilidad:', error)
      throw error
    }
  }

  /**
   * Obtener proceso de selección por vacante
   */
  async obtenerProcesoPorVacante(idVacante) {
    try {
      const data = await apiClient.get(`/reclutamiento/proceso/vacante/${idVacante}`)
      return data
    } catch (error) {
      console.error('Error al obtener proceso:', error)
      throw error
    }
  }

  /**
   * Obtener todos los candidatos de una vacante
   */
  async obtenerCandidatosPorVacante(idVacante) {
    try {
      const data = await apiClient.get(`/reclutamiento/vacante/${idVacante}/candidatos`)
      if (!Array.isArray(data)) {
        console.warn(`obtenerCandidatosPorVacante(${idVacante}) devolvió datos no válidos:`, data)
        return []
      }
      const procesos = data.map(c => {
        const proceso = new PostulanteProceso(c)
        // Validar que tenga idPostulante
        if (!proceso.idPostulante) {
          console.warn('PostulanteProceso sin idPostulante:', proceso)
        }
        return proceso
      })
      return procesos
    } catch (error) {
      console.error(`Error al obtener candidatos por vacante ${idVacante}:`, error)
      // No lanzar el error, devolver array vacío para que no rompa el flujo
      return []
    }
  }

  /**
   * Rechazar candidato
   */
  async rechazarCandidato(idPostulanteProceso, motivo) {
    try {
      const data = await apiClient.patch(`/reclutamiento/${idPostulanteProceso}/rechazar`, {
        motivo,
        estado: EstadoPostulante.DESCARTADO
      })
      return new PostulanteProceso(data)
    } catch (error) {
      console.error('Error al rechazar candidato:', error)
      throw error
    }
  }
}

export default new ReclutamientoService()

