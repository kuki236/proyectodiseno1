/**
 * Servicio para gestión de candidatos/postulantes
 * Implementa IRepositorioCandidato según diagrama UML
 */
import apiClient from './client'
import { Postulante } from '../../types'

class CandidatoService {
  /**
   * Obtener todos los candidatos
   */
  async obtenerCandidatos(filtros = {}) {
    try {
      const data = await apiClient.get('/candidatos', filtros)
      return Array.isArray(data) ? data.map(c => new Postulante(c)) : []
    } catch (error) {
      console.error('Error al obtener candidatos:', error)
      throw error
    }
  }

  /**
   * Obtener candidato por ID
   */
  async obtenerCandidatoPorId(idCandidato) {
    try {
      const data = await apiClient.get(`/candidatos/${idCandidato}`)
      return new Postulante(data)
    } catch (error) {
      console.error('Error al obtener candidato:', error)
      throw error
    }
  }

  /**
   * Crear nuevo candidato
   */
  async crearCandidato(candidatoData) {
    try {
      const data = await apiClient.post('/candidatos', candidatoData)
      return new Postulante(data)
    } catch (error) {
      console.error('Error al crear candidato:', error)
      throw error
    }
  }

  /**
   * Actualizar datos de candidato
   */
  async actualizarCandidato(idCandidato, candidatoData) {
    try {
      const data = await apiClient.put(`/candidatos/${idCandidato}`, candidatoData)
      return new Postulante(data)
    } catch (error) {
      console.error('Error al actualizar candidato:', error)
      throw error
    }
  }

  /**
   * Obtener habilidades de un candidato
   */
  async obtenerHabilidades(idCandidato) {
    try {
      const data = await apiClient.get(`/candidatos/${idCandidato}/habilidades`)
      return data
    } catch (error) {
      console.error('Error al obtener habilidades:', error)
      throw error
    }
  }

  /**
   * Obtener CV de un candidato
   */
  async obtenerCV(idCandidato) {
    try {
      const data = await apiClient.get(`/candidatos/${idCandidato}/cv`)
      return data
    } catch (error) {
      console.error('Error al obtener CV:', error)
      throw error
    }
  }

  /**
   * Buscar candidatos por criterios
   */
  async buscarCandidatos(criterios) {
    try {
      const data = await apiClient.post('/candidatos/buscar', criterios)
      return Array.isArray(data) ? data.map(c => new Postulante(c)) : []
    } catch (error) {
      console.error('Error al buscar candidatos:', error)
      throw error
    }
  }
}

export default new CandidatoService()

