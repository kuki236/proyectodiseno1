import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useNotification } from '../../components/common/NotificationProvider'
import reclutamientoService from '../../services/api/reclutamientoService'
import entrevistaService from '../../services/api/entrevistaService'
import ofertaService from '../../services/api/ofertaService'
import candidatoService from '../../services/api/candidatoService'
import vacanteService from '../../services/api/vacanteService'
import { EtapaProceso } from '../../types'
import './ProcesoSeleccion.css'

/**
 * Componente que gestiona todo el flujo del proceso de selección según el diagrama
 * Permite: calificar, mover etapas, registrar entrevistas, evaluaciones, ofertas, etc.
 */
const ProcesoSeleccion = ({ candidatoId, onUpdate }) => {
  const { success, error: showError } = useNotification()
  const [candidato, setCandidato] = useState(null)
  const [procesoInfo, setProcesoInfo] = useState(null)
  const [vacante, setVacante] = useState(null)
  const [etapaActual, setEtapaActual] = useState(null)
  const [calificacion, setCalificacion] = useState(null)
  const [loading, setLoading] = useState(true)

  // Estados para modales
  const [showCalificarModal, setShowCalificarModal] = useState(false)
  const [showEvaluacionModal, setShowEvaluacionModal] = useState(false)
  const [showOfertaModal, setShowOfertaModal] = useState(false)
  const [showRechazarModal, setShowRechazarModal] = useState(false)

  // Formularios
  const [formCalificacion, setFormCalificacion] = useState({ calificacion: 3, observaciones: '' })
  const [formEvaluacion, setFormEvaluacion] = useState({ tipo: 'TECNICA', puntuacion: 0, observaciones: '' })
  const [formOferta, setFormOferta] = useState({ salario: '', beneficios: '', condiciones: '', fechaInicio: '' })
  const [motivoRechazo, setMotivoRechazo] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [candidatoId])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [candidatoData, vacantesData] = await Promise.all([
        candidatoService.obtenerCandidatoPorId(candidatoId),
        vacanteService.obtenerVacantes()
      ])
      
      setCandidato(candidatoData)
      
      // Buscar el proceso del candidato
      for (const v of vacantesData) {
        try {
          const procesos = await reclutamientoService.obtenerCandidatosPorVacante(v.idVacante)
          const procesoCandidato = procesos.find(pp => pp.idPostulante === candidatoData.idPostulante)
          
          if (procesoCandidato) {
            setProcesoInfo(procesoCandidato)
            setEtapaActual(procesoCandidato.etapaActual || EtapaProceso.REVISION_CV)
            setCalificacion(procesoCandidato.calificacion)
            setVacante(vacantesData.find(vac => vac.idVacante === v.idVacante))
            break
          }
        } catch (err) {
          console.warn(`Error al buscar proceso en vacante ${v.idVacante}:`, err)
        }
      }
    } catch (err) {
      console.error('Error al cargar datos:', err)
      showError('Error al cargar la información del proceso')
    } finally {
      setLoading(false)
    }
  }

  // 1. FILTRAR Y CALIFICAR (1-5)
  const handleCalificar = async () => {
    if (!procesoInfo || !procesoInfo.idProcesoActual) {
      showError('No se encontró el proceso del candidato')
      return
    }

    try {
      await reclutamientoService.evaluarCandidato(
        candidato.idPostulante,
        procesoInfo.idProcesoActual,
        {
          calificacion: formCalificacion.calificacion,
          observaciones: formCalificacion.observaciones
        }
      )
      success(`Candidato calificado con ${formCalificacion.calificacion}/5`)
      setShowCalificarModal(false)
      await cargarDatos()
      if (onUpdate) onUpdate()
    } catch (err) {
      showError(err.message || 'Error al calificar el candidato')
    }
  }

  // 2. Mover a siguiente etapa
  const handleMoverEtapa = async (nuevaEtapa) => {
    if (!procesoInfo || !procesoInfo.idPostulanteProceso) {
      showError('No se encontró el proceso del candidato')
      return
    }

    try {
      await reclutamientoService.moverCandidatoEtapa(procesoInfo.idPostulanteProceso, nuevaEtapa)
      success(`Candidato movido a etapa: ${nuevaEtapa}`)
      await cargarDatos()
      if (onUpdate) onUpdate()
    } catch (err) {
      showError(err.message || 'Error al mover el candidato de etapa')
    }
  }

  // 3. Rechazar candidato
  const handleRechazar = async () => {
    if (!procesoInfo || !procesoInfo.idPostulanteProceso) {
      showError('No se encontró el proceso del candidato')
      return
    }

    if (!motivoRechazo.trim()) {
      showError('Debe especificar un motivo de rechazo')
      return
    }

    try {
      await reclutamientoService.rechazarCandidato(procesoInfo.idPostulanteProceso, motivoRechazo)
      success('Candidato rechazado')
      setShowRechazarModal(false)
      setMotivoRechazo('')
      await cargarDatos()
      if (onUpdate) onUpdate()
    } catch (err) {
      showError(err.message || 'Error al rechazar el candidato')
    }
  }

  // 4. Registrar evaluación
  const handleRegistrarEvaluacion = async () => {
    if (!procesoInfo || !procesoInfo.idProcesoActual) {
      showError('No se encontró el proceso del candidato')
      return
    }

    try {
      // Usar el servicio de reclutamiento para evaluar
      await reclutamientoService.evaluarCandidato(
        candidato.idPostulante,
        procesoInfo.idProcesoActual,
        {
          tipoEvaluacion: formEvaluacion.tipo,
          puntuacion: formEvaluacion.puntuacion,
          observaciones: formEvaluacion.observaciones
        }
      )
      success('Evaluación registrada exitosamente')
      setShowEvaluacionModal(false)
      setFormEvaluacion({ tipo: 'TECNICA', puntuacion: 0, observaciones: '' })
      await cargarDatos()
      if (onUpdate) onUpdate()
    } catch (err) {
      showError(err.message || 'Error al registrar la evaluación')
    }
  }

  // 5. Emitir oferta
  const handleEmitirOferta = async () => {
    if (!vacante || !candidato) {
      showError('No se encontró la vacante o el candidato')
      return
    }

    try {
      await ofertaService.emitirOferta({
        idVacante: vacante.idVacante,
        idCandidato: candidato.idPostulante,
        salarioOfrecido: parseFloat(formOferta.salario),
        beneficios: formOferta.beneficios || '',
        condiciones: formOferta.condiciones || '',
        fechaInicio: formOferta.fechaInicio
      })
      success('Oferta laboral emitida exitosamente')
      setShowOfertaModal(false)
      setFormOferta({ salario: '', beneficios: '', condiciones: '', fechaInicio: '' })
      await cargarDatos()
      if (onUpdate) onUpdate()
    } catch (err) {
      showError(err.message || 'Error al emitir la oferta')
    }
  }

  // 6. Cerrar contratación
  const handleCerrarContratacion = async () => {
    if (!procesoInfo || !procesoInfo.idPostulanteProceso) {
      showError('No se encontró el proceso del candidato')
      return
    }

    try {
      await reclutamientoService.moverCandidatoEtapa(procesoInfo.idPostulanteProceso, EtapaProceso.CONTRATACION)
      success('Contratación cerrada. Candidato convertido a empleado.')
      await cargarDatos()
      if (onUpdate) onUpdate()
    } catch (err) {
      showError(err.message || 'Error al cerrar la contratación')
    }
  }

  if (loading) {
    return <div className="proceso-seleccion-loading">Cargando proceso de selección...</div>
  }

  if (!procesoInfo) {
    return (
      <div className="proceso-seleccion-error">
        <p>No se encontró un proceso de selección para este candidato.</p>
        <p>El candidato debe estar vinculado a una vacante.</p>
      </div>
    )
  }

  const puedeMoverAEntrevista = etapaActual === EtapaProceso.REVISION_CV && calificacion && calificacion >= 3
  const puedeMoverAPrueba = etapaActual === EtapaProceso.ENTREVISTA
  const puedeMoverAOferta = etapaActual === EtapaProceso.PRUEBA
  const puedeCerrarContratacion = etapaActual === EtapaProceso.OFERTA

  return (
    <div className="proceso-seleccion-container">
      <div className="proceso-seleccion-header">
        <h3>Proceso de Selección</h3>
        <div className="proceso-seleccion-info">
          <span><strong>Etapa Actual:</strong> {etapaActual}</span>
          {calificacion && <span><strong>Calificación:</strong> {calificacion}/5</span>}
        </div>
      </div>

      <div className="proceso-seleccion-etapas">
        {/* ETAPA 1: REVISION_CV - Filtrar y Calificar */}
        {etapaActual === EtapaProceso.REVISION_CV && (
          <div className="proceso-etapa-card">
            <h4>1. Filtrar y Calificar Candidato</h4>
            <p>Califique al candidato de 1 a 5 según los requisitos mínimos.</p>
            {!calificacion ? (
              <button className="btn-primary" onClick={() => setShowCalificarModal(true)}>
                Calificar Candidato
              </button>
            ) : (
              <div>
                <p><strong>Calificación actual:</strong> {calificacion}/5</p>
                {calificacion >= 3 ? (
                  <button className="btn-success" onClick={() => handleMoverEtapa(EtapaProceso.ENTREVISTA)}>
                    ✓ Cumple requisitos - Mover a Entrevista
                  </button>
                ) : (
                  <button className="btn-danger" onClick={() => setShowRechazarModal(true)}>
                    ✗ No cumple requisitos - Rechazar
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ETAPA 2: ENTREVISTA */}
        {etapaActual === EtapaProceso.ENTREVISTA && (
          <div className="proceso-etapa-card">
            <h4>2. Realizar Entrevista</h4>
            <p>Programe y realice la entrevista con el candidato.</p>
            <div className="proceso-acciones">
              <button className="btn-primary" onClick={() => window.location.href = `/entrevistas`}>
                Ver Entrevistas Programadas
              </button>
              <button className="btn-secondary" onClick={() => handleMoverEtapa(EtapaProceso.PRUEBA)}>
                ✓ Pasa Entrevista - Mover a Prueba
              </button>
              <button className="btn-danger" onClick={() => setShowRechazarModal(true)}>
                ✗ No Pasa - Rechazar
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 3: PRUEBA */}
        {etapaActual === EtapaProceso.PRUEBA && (
          <div className="proceso-etapa-card">
            <h4>3. Realizar Evaluación</h4>
            <p>Registre los resultados de la evaluación técnica o psicológica.</p>
            <div className="proceso-acciones">
              <button className="btn-primary" onClick={() => setShowEvaluacionModal(true)}>
                Registrar Evaluación
              </button>
              <button className="btn-success" onClick={() => handleMoverEtapa(EtapaProceso.OFERTA)}>
                ✓ Aprueba Prueba - Mover a Oferta
              </button>
              <button className="btn-danger" onClick={() => setShowRechazarModal(true)}>
                ✗ No Aprueba - Rechazar
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 4: OFERTA */}
        {etapaActual === EtapaProceso.OFERTA && (
          <div className="proceso-etapa-card">
            <h4>4. Emitir Oferta Laboral</h4>
            <p>Genere y envíe la oferta formal al candidato.</p>
            <div className="proceso-acciones">
              <button className="btn-primary" onClick={() => setShowOfertaModal(true)}>
                Emitir Oferta
              </button>
              <button className="btn-success" onClick={handleCerrarContratacion}>
                ✓ Acepta Oferta - Cerrar Contratación
              </button>
              <button className="btn-danger" onClick={() => setShowRechazarModal(true)}>
                ✗ Rechaza Oferta
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 5: CONTRATACION */}
        {etapaActual === EtapaProceso.CONTRATACION && (
          <div className="proceso-etapa-card proceso-completado">
            <h4>✓ Contratación Cerrada</h4>
            <p>El candidato ha sido contratado y debe integrarse con el módulo de Gestión de Empleados.</p>
          </div>
        )}
      </div>

      {/* MODAL: Calificar */}
      {showCalificarModal && (
        <div className="modal-overlay" onClick={() => setShowCalificarModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Calificar Candidato</h3>
            <div className="form-group">
              <label>Calificación (1-5) *</label>
              <input
                type="number"
                min="1"
                max="5"
                value={formCalificacion.calificacion}
                onChange={(e) => setFormCalificacion({ ...formCalificacion, calificacion: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="form-group">
              <label>Observaciones</label>
              <textarea
                value={formCalificacion.observaciones}
                onChange={(e) => setFormCalificacion({ ...formCalificacion, observaciones: e.target.value })}
                rows="3"
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowCalificarModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleCalificar}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Evaluación */}
      {showEvaluacionModal && (
        <div className="modal-overlay" onClick={() => setShowEvaluacionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Registrar Evaluación</h3>
            <div className="form-group">
              <label>Tipo de Evaluación *</label>
              <select
                value={formEvaluacion.tipo}
                onChange={(e) => setFormEvaluacion({ ...formEvaluacion, tipo: e.target.value })}
                required
              >
                <option value="TECNICA">Técnica</option>
                <option value="PSICOLOGICA">Psicológica</option>
                <option value="OTRA">Otra</option>
              </select>
            </div>
            <div className="form-group">
              <label>Puntuación (0-100) *</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formEvaluacion.puntuacion}
                onChange={(e) => setFormEvaluacion({ ...formEvaluacion, puntuacion: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="form-group">
              <label>Observaciones</label>
              <textarea
                value={formEvaluacion.observaciones}
                onChange={(e) => setFormEvaluacion({ ...formEvaluacion, observaciones: e.target.value })}
                rows="3"
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowEvaluacionModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleRegistrarEvaluacion}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Oferta */}
      {showOfertaModal && (
        <div className="modal-overlay" onClick={() => setShowOfertaModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Emitir Oferta Laboral</h3>
            <div className="form-group">
              <label>Salario Ofrecido *</label>
              <input
                type="number"
                value={formOferta.salario}
                onChange={(e) => setFormOferta({ ...formOferta, salario: e.target.value })}
                placeholder="Ej: 50000"
                required
              />
            </div>
            <div className="form-group">
              <label>Beneficios</label>
              <textarea
                value={formOferta.beneficios}
                onChange={(e) => setFormOferta({ ...formOferta, beneficios: e.target.value })}
                rows="2"
                placeholder="Seguro médico, vacaciones, etc."
              />
            </div>
            <div className="form-group">
              <label>Condiciones</label>
              <textarea
                value={formOferta.condiciones}
                onChange={(e) => setFormOferta({ ...formOferta, condiciones: e.target.value })}
                rows="2"
                placeholder="Modalidad, horario, etc."
              />
            </div>
            <div className="form-group">
              <label>Fecha de Inicio *</label>
              <input
                type="date"
                value={formOferta.fechaInicio}
                onChange={(e) => setFormOferta({ ...formOferta, fechaInicio: e.target.value })}
                required
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowOfertaModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleEmitirOferta}>Emitir Oferta</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Rechazar */}
      {showRechazarModal && (
        <div className="modal-overlay" onClick={() => setShowRechazarModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Rechazar Candidato</h3>
            <div className="form-group">
              <label>Motivo del Rechazo *</label>
              <textarea
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                rows="4"
                placeholder="Especifique el motivo del rechazo..."
                required
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowRechazarModal(false)}>Cancelar</button>
              <button className="btn-danger" onClick={handleRechazar}>Confirmar Rechazo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProcesoSeleccion

