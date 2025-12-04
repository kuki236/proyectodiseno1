import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { 
  vacanteService, 
  candidatoService, 
  reclutamientoService 
} from '../services'
import { 
  mapearEstadoFrontend, 
  mapearEstadoBackend,
  CrearVacanteDTO,
  EtapaProceso
} from '../types'
import { useNotification } from '../components/common/NotificationProvider'

const RRHHContext = createContext()

export const useRRHH = () => {
  const context = useContext(RRHHContext)
  if (!context) {
    throw new Error('useRRHH debe usarse dentro de RRHHProvider')
  }
  return context
}

export const RRHHProvider = ({ children }) => {
  const { success, error: showError, info } = useNotification()
  
  // ========== ESTADOS ==========
  const [candidatesData, setCandidatesData] = useState([])
  const [positionsData, setPositionsData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredCandidates, setFilteredCandidates] = useState([])
  const [editingPositionId, setEditingPositionId] = useState(null)
  
  // Estados de carga y errores
  const [loading, setLoading] = useState({
    candidates: false,
    positions: false,
    pipeline: false
  })
  const [error, setError] = useState(null)

  const itemsPerPage = 5
  const pipelineStages = ["Nuevo", "En Entrevista", "Prueba Técnica", "Entrevista Final", "Oferta", "Contratado", "Rechazado"]

  const departamentos = [
    "Operaciones",
    "Comercial",
    "Infraestructura",
    "Soporte",
    "Marketing",
    "Recursos Humanos",
    "Administración",
    "Finanzas",
    "Atención al Cliente"
  ]

  const puestosPorDepartamento = {
    "Operaciones": [
      "Técnico de Soporte",
      "Técnico de Instalaciones",
      "Coordinador de Operaciones"
    ],
    "Comercial": [
      "Ejecutivo de Ventas",
      "Representante Comercial",
      "Analista de Precios"
    ],
    "Infraestructura": [
      "Ingeniero de Red",
      "Especialista en Servidores",
      "Administrador de Sistemas"
    ],
    "Soporte": [
      "Especialista en Telecomunicaciones",
      "Analista de Soporte",
      "Help Desk"
    ],
    "Marketing": [
      "Especialista SEO",
      "Diseñador Gráfico",
      "Coordinador de Marketing"
    ],
    "Recursos Humanos": [
      "Asistente de Reclutamiento",
      "Analista de Selección",
      "Coordinador de RRHH"
    ],
    "Administración": [
      "Asistente Administrativo",
      "Jefe de Administración"
    ],
    "Finanzas": [
      "Analista Financiero",
      "Contador"
    ],
    "Atención al Cliente": [
      "Agente de Call Center",
      "Supervisor de Atención"
    ]
  }

  // ========== FUNCIONES PARA CANDIDATOS ==========
  
  /**
   * Cargar candidatos desde el backend
   */
  const loadCandidates = useCallback(async () => {
    setLoading(prev => ({ ...prev, candidates: true }))
    setError(null)
    
    try {
      const candidatos = await candidatoService.obtenerCandidatos()
      
      // Obtener todas las vacantes para mapear puestos
      const vacantes = await vacanteService.obtenerVacantes()
      const vacantesMap = new Map(vacantes.map(v => [v.idVacante, v.nombre]))
      
      // Obtener todos los PostulanteProceso para tener la información de etapas y vacantes
      const postulantesProcesoMap = new Map()
      try {
        // Obtener procesos de todas las vacantes en paralelo para mejor rendimiento
        const procesosPromises = vacantes.map(async (vacante) => {
          try {
            const procesos = await reclutamientoService.obtenerCandidatosPorVacante(vacante.idVacante)
            return { vacante, procesos }
          } catch (err) {
            console.warn(`Error al obtener candidatos de vacante ${vacante.idVacante} (${vacante.nombre}):`, err)
            return { vacante, procesos: [] }
          }
        })
        
        const resultados = await Promise.all(procesosPromises)
        
        // Mapear todos los procesos a un Map
        resultados.forEach(({ vacante, procesos }) => {
          if (procesos && Array.isArray(procesos)) {
            procesos.forEach(pp => {
              if (pp && pp.idPostulante) {
                // Si ya existe un proceso para este postulante, mantener el primero (o el más reciente)
                const existente = postulantesProcesoMap.get(pp.idPostulante)
                if (!existente) {
                  postulantesProcesoMap.set(pp.idPostulante, {
                    etapa: pp.etapaActual || EtapaProceso.REVISION_CV,
                    idVacante: vacante.idVacante,
                    nombreVacante: vacante.nombre
                  })
                }
              }
            })
          }
        })
        
        console.log(`Mapeados ${postulantesProcesoMap.size} postulantes con procesos de ${vacantes.length} vacantes`)
      } catch (err) {
        console.error('Error al obtener procesos de selección:', err)
      }
      
      // Mapear datos del backend al formato del frontend
      const mappedCandidates = candidatos.map(c => {
        const procesoInfo = postulantesProcesoMap.get(c.idPostulante)
        const etapa = procesoInfo?.etapa || EtapaProceso.REVISION_CV
        const nombreVacante = procesoInfo?.nombreVacante || 'No especificado'
        
        // Log para debug si no se encuentra el puesto
        if (!procesoInfo) {
          console.warn(`No se encontró proceso para candidato ${c.idPostulante} (${c.nombreCompleto})`)
        }
        
        return {
          id: c.idPostulante,
          name: c.nombreCompleto,
          email: c.email,
          phone: c.telefono,
          birthDate: c.fechaNacimiento,
          gender: c.genero || 'No especificado',
          maritalStatus: c.estadoCivil || 'No especificado',
          education: c.educacion || 'No especificado',
          institution: c.institucion || 'No especificado',
          career: c.carrera || 'No especificado',
          graduationYear: c.anioGraduacion || null,
          position: nombreVacante,
          status: mapearEstadoFrontend(etapa),
          etapa: etapa,
          experience: c.experiencias || [],
          techSkills: c.habilidades?.filter(h => h.tipo === 'TECNICA').map(h => h.nombreHabilidad) || [],
          softSkills: c.habilidades?.filter(h => h.tipo === 'BLANDA').map(h => h.nombreHabilidad) || [],
          certifications: c.certificaciones || []
        }
      })
      
      setCandidatesData(mappedCandidates)
      setFilteredCandidates(mappedCandidates)
    } catch (err) {
      console.error('Error al cargar candidatos:', err)
      const errorMsg = err.message || 'Error al cargar candidatos'
      setError(errorMsg)
      showError('No se pudieron cargar los candidatos. Verificando conexión con el servidor...')
    } finally {
      setLoading(prev => ({ ...prev, candidates: false }))
    }
  }, [])

  /**
   * Actualizar estado de candidato
   */
  const updateCandidateStatus = useCallback(async (candidateId, newStatus) => {
    try {
      const estadoBackend = mapearEstadoBackend(newStatus)
      
      // Actualizar en backend
      await reclutamientoService.moverCandidatoEtapa(candidateId, estadoBackend)
      
      // Actualizar estado local
      setCandidatesData(prev => 
        prev.map(c => c.id === candidateId ? { ...c, status: newStatus } : c)
      )
      setFilteredCandidates(prev =>
        prev.map(c => c.id === candidateId ? { ...c, status: newStatus } : c)
      )
    } catch (err) {
      console.error('Error al actualizar estado:', err)
      const errorMsg = err.message || 'Error al actualizar estado del candidato'
      setError(errorMsg)
      showError('No se pudo actualizar el estado del candidato')
      throw err
    }
  }, [])

  // ========== FUNCIONES PARA POSICIONES ==========
  
  /**
   * Cargar posiciones desde el backend
   */
  const loadPositions = useCallback(async () => {
    setLoading(prev => ({ ...prev, positions: true }))
    setError(null)
    
    try {
      const vacantes = await vacanteService.obtenerVacantes()
      
      // Obtener estadísticas para cada vacante
      const positionsWithStats = await Promise.all(
        vacantes.map(async (vacante) => {
          try {
            const stats = await vacanteService.obtenerEstadisticas(vacante.idVacante)
            return {
              id: vacante.idVacante,
              name: vacante.nombre,
              department: vacante.departamento,
              description: vacante.descripcion,
              priority: vacante.prioridad || 'Media',
              modalidad: vacante.modalidad,
              tipoContrato: vacante.tipoContrato,
              candidates: stats?.totalCandidatos || 0,
              selected: stats?.candidatosSeleccionados || 0,
              interviews: stats?.entrevistasProgramadas || 0
            }
          } catch (err) {
            console.error(`Error al obtener stats de vacante ${vacante.idVacante}:`, err)
            return {
              id: vacante.idVacante,
              name: vacante.nombre,
              department: vacante.departamento,
              description: vacante.descripcion,
              priority: vacante.prioridad || 'Media',
              modalidad: vacante.modalidad,
              tipoContrato: vacante.tipoContrato,
              candidates: 0,
              selected: 0,
              interviews: 0
            }
          }
        })
      )
      
      setPositionsData(positionsWithStats)
    } catch (err) {
      console.error('Error al cargar posiciones:', err)
      const errorMsg = err.message || 'Error al cargar posiciones'
      setError(errorMsg)
      showError('No se pudieron cargar las posiciones. Verificando conexión con el servidor...')
    } finally {
      setLoading(prev => ({ ...prev, positions: false }))
    }
  }, [])

  /**
   * Agregar nueva posición
   */
  const addPosition = useCallback(async (positionData) => {
    try {
      const vacanteDTO = new CrearVacanteDTO({
        nombre: positionData.name,
        departamento: positionData.department,
        descripcion: positionData.description,
        prioridad: positionData.priority,
        modalidad: positionData.modalidad,
        tipoContrato: positionData.tipoContrato,
        requisitos: positionData.requisitos || '',
        rangoSalarial: positionData.rangoSalarial || ''
      })
      
      const nuevaVacante = await vacanteService.crearVacante(vacanteDTO)
      
      // Intentar publicar automáticamente (no bloquear si falla)
      try {
        await vacanteService.publicarVacante(nuevaVacante.idVacante)
        success('Oportunidad de trabajo creada y publicada exitosamente')
      } catch (pubError) {
        console.warn('No se pudo publicar automáticamente, pero la vacante fue creada:', pubError)
        success('Oportunidad de trabajo creada exitosamente')
      }
      
      // Recargar posiciones
      await loadPositions()
      
      return nuevaVacante
    } catch (err) {
      console.error('Error al agregar posición:', err)
      const errorMsg = err.message || 'Error al crear la oportunidad de trabajo'
      setError(errorMsg)
      showError('No se pudo crear la oportunidad de trabajo. Verifica que todos los campos sean válidos.')
      throw err
    }
  }, [loadPositions])

  /**
   * Actualizar posición
   */
  const updatePosition = useCallback(async (id, positionData) => {
    try {
      const vacanteDTO = new CrearVacanteDTO({
        nombre: positionData.name,
        departamento: positionData.department,
        descripcion: positionData.description,
        prioridad: positionData.priority,
        modalidad: positionData.modalidad,
        tipoContrato: positionData.tipoContrato
      })
      
      await vacanteService.actualizarVacante(id, vacanteDTO)
      
      // Recargar posiciones
      await loadPositions()
      success('Posición actualizada exitosamente')
    } catch (err) {
      console.error('Error al actualizar posición:', err)
      const errorMsg = err.message || 'Error al actualizar la posición'
      setError(errorMsg)
      showError('No se pudo actualizar la posición')
      throw err
    }
  }, [loadPositions])

  /**
   * Eliminar posición
   */
  const deletePosition = useCallback(async (id) => {
    try {
      await vacanteService.eliminarVacante(id)
      
      // Recargar posiciones
      await loadPositions()
      info('Posición eliminada exitosamente')
    } catch (err) {
      console.error('Error al eliminar posición:', err)
      const errorMsg = err.message || 'Error al eliminar la posición'
      setError(errorMsg)
      showError('No se pudo eliminar la posición. Verifica que no tenga candidatos asociados.')
      throw err
    }
  }, [loadPositions])

  // ========== EFECTOS ==========
  
  /**
   * Cargar datos iniciales
   */
  useEffect(() => {
    loadCandidates()
    loadPositions()
  }, [loadCandidates, loadPositions])

  // ========== VALOR DEL CONTEXT ==========
  
  const value = {
    // Estado
    candidatesData,
    positionsData,
    currentPage,
    itemsPerPage,
    filteredCandidates,
    editingPositionId,
    pipelineStages,
    departamentos,
    puestosPorDepartamento,
    loading,
    error,
    
    // Setters
    setCandidatesData,
    setPositionsData,
    setCurrentPage,
    setFilteredCandidates,
    setEditingPositionId,
    setError,
    
    // Funciones
    updateCandidateStatus,
    addPosition,
    updatePosition,
    deletePosition,
    loadCandidates,
    loadPositions
  }

  return (
    <RRHHContext.Provider value={value}>
      {children}
    </RRHHContext.Provider>
  )
}
