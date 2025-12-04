import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRRHH } from '../../store/RRHHContext'
import { useNotification } from '../../components/common/NotificationProvider'
import entrevistaService from '../../services/api/entrevistaService'
import reclutamientoService from '../../services/api/reclutamientoService'
import vacanteService from '../../services/api/vacanteService'
import candidatoService from '../../services/api/candidatoService'
import ProcesoSeleccion from './ProcesoSeleccion'

const DetalleCandidato = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { candidatesData, updateCandidateStatus } = useRRHH()
  const { success, error } = useNotification()
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [showEntrevistaModal, setShowEntrevistaModal] = useState(false)
  const [cargandoProceso, setCargandoProceso] = useState(false)
  const [idProceso, setIdProceso] = useState(null)
  
  const [formDataEntrevista, setFormDataEntrevista] = useState({
    fecha: '',
    hora: '',
    lugar: 'Oficina principal - Sala de reuniones',
    entrevistador: '',
    observaciones: ''
  })

  const candidate = candidatesData.find(c => c.id === parseInt(id))

  // Cargar el proceso del candidato cuando se abre el modal
  useEffect(() => {
    if (showEntrevistaModal && candidate) {
      cargarProcesoDelCandidato()
    }
  }, [showEntrevistaModal, candidate])

  const cargarProcesoDelCandidato = async () => {
    if (!candidate) return
    
    setCargandoProceso(true)
    try {
      // Obtener el candidato completo del backend para tener el idPostulante correcto
      const candidatoCompleto = await candidatoService.obtenerCandidatoPorId(candidate.id)
      const idPostulanteReal = candidatoCompleto.idPostulante || candidate.id
      
      // Buscar el proceso del candidato en todas las vacantes
      const vacantes = await vacanteService.obtenerVacantes()
      
      for (const vacante of vacantes) {
        try {
          const procesos = await reclutamientoService.obtenerCandidatosPorVacante(vacante.idVacante)
          // Buscar por idPostulante (puede ser número o string)
          const procesoCandidato = procesos.find(pp => {
            const ppId = pp.idPostulante?.toString()
            const candidatoId = idPostulanteReal?.toString()
            return ppId === candidatoId
          })
          
          if (procesoCandidato && procesoCandidato.idProcesoActual) {
            setIdProceso(procesoCandidato.idProcesoActual)
            break
          }
        } catch (err) {
          console.warn(`Error al buscar proceso en vacante ${vacante.idVacante}:`, err)
        }
      }
      
      if (!idProceso) {
        console.warn(`No se encontró proceso para candidato ${idPostulanteReal}`)
      }
    } catch (err) {
      console.error('Error al cargar proceso del candidato:', err)
      error('Error al cargar el proceso de selección del candidato')
    } finally {
      setCargandoProceso(false)
    }
  }

  const handleProgramarEntrevista = async (e) => {
    e.preventDefault()
    
    if (!idProceso) {
      error('No se pudo obtener el proceso de selección del candidato')
      return
    }
    
    try {
      await entrevistaService.programarEntrevista({
        idCandidato: candidate.id,
        idProceso: idProceso,
        fecha: formDataEntrevista.fecha,
        hora: formDataEntrevista.hora,
        lugar: formDataEntrevista.lugar || 'Oficina principal - Sala de reuniones',
        entrevistador: formDataEntrevista.entrevistador
      })
      success('Entrevista programada exitosamente')
      setShowEntrevistaModal(false)
      setFormDataEntrevista({
        fecha: '',
        hora: '',
        lugar: 'Oficina principal - Sala de reuniones',
        entrevistador: '',
        observaciones: ''
      })
    } catch (err) {
      error(err.message || 'Error al programar la entrevista')
    }
  }

  if (!candidate) {
    return (
      <div className="view-container active">
        <p>Candidato no encontrado</p>
        <button className="btn-back" onClick={() => navigate('/candidatos')}>
          ← Volver
        </button>
      </div>
    )
  }

  const calculateAge = (birthDate) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const statuses = ["Nuevo", "En Proceso", "Entrevistado", "En Entrevista", "Prueba Técnica", "Entrevista Final", "Oferta", "Rechazado", "Contratado"]

  const handleChangeStatus = () => {
    setSelectedStatus(candidate.status)
    setShowStatusModal(true)
  }

  const handleConfirmStatusChange = () => {
    if (selectedStatus && statuses.includes(selectedStatus)) {
      updateCandidateStatus(candidate.id, selectedStatus)
      success(`Estado actualizado a: ${selectedStatus}`)
      setShowStatusModal(false)
    } else {
      error('Por favor selecciona un estado válido')
    }
  }

  return (
    <div className="view-container active">
      <button className="btn-back" onClick={() => navigate('/candidatos')}>
        ← Volver
      </button>
      
      <div className="detalle-container">
        <div className="detalle-header">
          <h2 id="detalle-nombre">{candidate.name}</h2>
          <div className="detalle-actions">
            <button 
              className="btn-primary" 
              onClick={() => setShowEntrevistaModal(true)}
              style={{ marginRight: '10px' }}
            >
              Programar Entrevista
            </button>
            <button className="btn-secondary" onClick={handleChangeStatus}>
              Cambiar Estado
            </button>
          </div>
        </div>

        {showStatusModal && (
          <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Cambiar Estado del Candidato</h3>
              <div className="form-group">
                <label>Nuevo Estado</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="btn-primary" onClick={handleConfirmStatusChange}>
                  Confirmar
                </button>
                <button className="btn-secondary" onClick={() => setShowStatusModal(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {showEntrevistaModal && (
          <div className="modal-overlay" onClick={() => {
            setShowEntrevistaModal(false)
            setFormDataEntrevista({
              fecha: '',
              hora: '',
              lugar: 'Oficina principal - Sala de reuniones',
              entrevistador: '',
              observaciones: ''
            })
          }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <h3>Programar Entrevista</h3>
              <form onSubmit={handleProgramarEntrevista}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label><strong>Candidato:</strong></label>
                  <input
                    type="text"
                    value={candidate.name}
                    disabled
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', background: '#f5f5f5' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label><strong>Proceso de Selección (ID):</strong></label>
                  <input
                    type="number"
                    value={idProceso || ''}
                    disabled
                    placeholder={cargandoProceso ? 'Cargando...' : 'ID del proceso'}
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', background: '#f5f5f5' }}
                  />
                  {cargandoProceso && (
                    <small style={{ color: '#667eea', fontSize: '12px', display: 'block', marginTop: '0.25rem' }}>
                      Cargando proceso del candidato...
                    </small>
                  )}
                  {!cargandoProceso && idProceso && (
                    <small style={{ color: '#28a745', fontSize: '12px', display: 'block', marginTop: '0.25rem' }}>
                      ✓ Proceso cargado automáticamente
                    </small>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label><strong>Fecha *</strong></label>
                  <input
                    type="date"
                    value={formDataEntrevista.fecha}
                    onChange={(e) => setFormDataEntrevista({ ...formDataEntrevista, fecha: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label><strong>Hora *</strong></label>
                  <input
                    type="time"
                    value={formDataEntrevista.hora}
                    onChange={(e) => setFormDataEntrevista({ ...formDataEntrevista, hora: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label><strong>Lugar *</strong></label>
                  <input
                    type="text"
                    value={formDataEntrevista.lugar}
                    onChange={(e) => setFormDataEntrevista({ ...formDataEntrevista, lugar: e.target.value })}
                    placeholder="Ej: Oficina principal, Sala de reuniones"
                    required
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label><strong>Entrevistador *</strong></label>
                  <input
                    type="text"
                    value={formDataEntrevista.entrevistador}
                    onChange={(e) => setFormDataEntrevista({ ...formDataEntrevista, entrevistador: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label><strong>Observaciones</strong></label>
                  <textarea
                    value={formDataEntrevista.observaciones}
                    onChange={(e) => setFormDataEntrevista({ ...formDataEntrevista, observaciones: e.target.value })}
                    rows="3"
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => {
                      setShowEntrevistaModal(false)
                      setFormDataEntrevista({
                        fecha: '',
                        hora: '',
                        lugar: 'Oficina principal - Sala de reuniones',
                        entrevistador: '',
                        observaciones: ''
                      })
                    }}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={!idProceso || cargandoProceso}
                  >
                    Programar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="detalle-grid">
          <div className="detalle-section">
            <h3>Información Personal</h3>
            <div className="info-row">
              <span className="label">Email:</span>
              <span>{candidate.email}</span>
            </div>
            <div className="info-row">
              <span className="label">Teléfono:</span>
              <span>{candidate.phone}</span>
            </div>
            <div className="info-row">
              <span className="label">Edad:</span>
              <span>{calculateAge(candidate.birthDate)} años</span>
            </div>
            <div className="info-row">
              <span className="label">Género:</span>
              <span>{candidate.gender}</span>
            </div>
            <div className="info-row">
              <span className="label">Estado Civil:</span>
              <span>{candidate.maritalStatus}</span>
            </div>
          </div>

          <div className="detalle-section">
            <h3>Formación</h3>
            <div className="info-row">
              <span className="label">Nivel:</span>
              <span>{candidate.education}</span>
            </div>
            <div className="info-row">
              <span className="label">Institución:</span>
              <span>{candidate.institution}</span>
            </div>
            <div className="info-row">
              <span className="label">Carrera:</span>
              <span>{candidate.career}</span>
            </div>
            <div className="info-row">
              <span className="label">Año Graduación:</span>
              <span>{candidate.graduationYear}</span>
            </div>
          </div>

          <div className="detalle-section">
            <h3>Experiencia Laboral</h3>
            {candidate.experience.map((exp, index) => (
              <div key={index} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e3e6e8' }}>
                <div style={{ fontWeight: 600, color: '#2c3e50' }}>{exp.company}</div>
                <div style={{ fontSize: '13px', color: '#6c757d' }}>{exp.position}</div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>{exp.startDate} - {exp.endDate}</div>
                <div style={{ fontSize: '13px', marginTop: '6px' }}>{exp.description}</div>
              </div>
            ))}
          </div>

          <div className="detalle-section">
            <h3>Habilidades Técnicas</h3>
            <div className="skills-list">
              {candidate.techSkills.map((skill, index) => (
                <span key={index} className="skill-badge">{skill}</span>
              ))}
            </div>
          </div>

          <div className="detalle-section">
            <h3>Habilidades Blandas</h3>
            <div className="skills-list">
              {candidate.softSkills.map((skill, index) => (
                <span key={index} className="skill-badge">{skill}</span>
              ))}
            </div>
          </div>

          <div className="detalle-section">
            <h3>Certificaciones</h3>
            {candidate.certifications.length > 0 ? (
              candidate.certifications.map((cert, index) => (
                <div key={index} style={{ padding: '8px 0', fontSize: '13px' }}>
                  ✓ {cert}
                </div>
              ))
            ) : (
              <div style={{ color: '#6c757d', fontSize: '13px' }}>Sin certificaciones</div>
            )}
          </div>
        </div>

        {/* Componente de Proceso de Selección */}
        <ProcesoSeleccion 
          candidatoId={candidate.id} 
          onUpdate={() => {
            // Recargar datos del candidato cuando se actualice el proceso
            window.location.reload()
          }}
        />
      </div>
    </div>
  )
}

export default DetalleCandidato

