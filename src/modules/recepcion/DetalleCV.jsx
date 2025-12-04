import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import apiClient from '../../services/api/client'
import reclutamientoService from '../../services/api/reclutamientoService'
import { EtapaProceso } from '../../types'
import './DetalleCV.css'

const DetalleCV = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { id } = useParams()
  const { postulante, nombrePuesto, area, idPuesto } = location.state || {}

  const [tabActiva, setTabActiva] = useState('info')
  const [detallePostulante, setDetallePostulante] = useState(postulante)
  const [cargandoDetalle, setCargandoDetalle] = useState(false)
  const [errorCarga, setErrorCarga] = useState('')
  const [procesandoAccion, setProcesandoAccion] = useState(false)
  const [errorAccion, setErrorAccion] = useState('')
  const [cvUrl, setCvUrl] = useState('')
  const [cargandoCV, setCargandoCV] = useState(false)
  const [errorCV, setErrorCV] = useState('')
  const [habilidades, setHabilidades] = useState([])
  const [cargandoHabilidades, setCargandoHabilidades] = useState(false)
  const [errorHabilidades, setErrorHabilidades] = useState('')
  const [idProcesoEncontrado, setIdProcesoEncontrado] = useState(null)

  const formatFecha = fecha => {
    if (!fecha) return ''
    const date = new Date(fecha)
    return isNaN(date) ? fecha : date.toLocaleDateString()
  }

  useEffect(() => {
    if (!id) return

    const cargarDetalle = async () => {
      setCargandoDetalle(true)
      setErrorCarga('')
      try {
        const data = await apiClient.get(`/rrhh/postulantes/${id}`)
        setDetallePostulante(data)
      } catch (err) {
        console.error('Error cargando postulante:', err)
        setErrorCarga('No se pudo cargar la información del postulante.')
      } finally {
        setCargandoDetalle(false)
      }
    }

    cargarDetalle()
  }, [id])

  useEffect(() => {
    if (!id) return

    const cargarHabilidades = async () => {
      setCargandoHabilidades(true)
      setErrorHabilidades('')

      try {
        const data = await apiClient.get(`/candidatos/${id}/habilidades`)

        if (Array.isArray(data)) {
          const habilidadesNormalizadas = data.map(h => ({
            id: h.idPostulanteHabilidad || h.id_postulante_habilidad || h.idHabilidad || h.id_habilidad,
            nombre:
              h.nombreHabilidad ||
              h.nombre_habilidad ||
              h.habilidad?.nombreHabilidad ||
              h.habilidad?.nombre_habilidad ||
              '',
            tipo:
              h.tipo ||
              h.tipoHabilidad ||
              h.tipo_habilidad ||
              h.habilidad?.tipoHabilidad ||
              h.habilidad?.tipo_habilidad ||
              '',
            categoria: h.categoria || h.habilidad?.categoria || '',
            nivelDominio: h.nivelDominio || h.nivel_dominio || '',
            anosExperiencia: h.anosExperiencia ?? h.anos_experiencia ?? null,
            descripcion: h.descripcion || h.habilidad?.descripcion || ''
          }))

          setHabilidades(habilidadesNormalizadas)
        } else {
          setHabilidades([])
        }
      } catch (err) {
        console.error('Error cargando habilidades:', err)
        setErrorHabilidades('No se pudieron cargar las habilidades del postulante.')
      } finally {
        setCargandoHabilidades(false)
      }
    }

    cargarHabilidades()
  }, [id])

  useEffect(() => {
    if (!id) return

    let cancelado = false
    let objectUrl = ''

    const cargarPDF = async () => {
      setCargandoCV(true)
      setErrorCV('')
      setCvUrl('')

      try {
        const response = await fetch(`${apiClient.baseURL}/candidatos/${id}/cv/archivo`, {
          headers: apiClient.getHeaders({ Accept: 'application/pdf' })
        })

        if (!response.ok) {
          throw new Error('No se pudo obtener el archivo del CV.')
        }

        const blob = await response.blob()
        if (cancelado) return

        objectUrl = URL.createObjectURL(blob)
        // Agregar zoom al 80% al PDF
        setCvUrl(objectUrl + '#zoom=80')
      } catch (err) {
        if (!cancelado) {
          console.error('Error cargando CV en PDF:', err)
          setErrorCV('No se pudo cargar el CV en PDF.')
        }
      } finally {
        if (!cancelado) {
          setCargandoCV(false)
        }
      }
    }

    cargarPDF()

    return () => {
      cancelado = true
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [id])

  const obtenerPeriodo = (inicio, fin) => {
    const inicioFmt = formatFecha(inicio)
    const finFmt = fin ? formatFecha(fin) : 'Actualidad'
    if (inicioFmt && finFmt) return `${inicioFmt} - ${finFmt}`
    return inicioFmt || finFmt || ''
  }

  const obtenerMeses = (inicio, fin) => {
    if (!inicio) return null

    const fechaInicio = new Date(inicio)
    const fechaFin = fin ? new Date(fin) : new Date()

    if (isNaN(fechaInicio) || isNaN(fechaFin)) return null

    let meses = (fechaFin.getFullYear() - fechaInicio.getFullYear()) * 12
    meses += fechaFin.getMonth() - fechaInicio.getMonth()

    if (fechaFin.getDate() < fechaInicio.getDate()) {
      meses -= 1
    }

    return Math.max(meses, 0)
  }

  const obtenerEdad = fechaNacimiento => {
    if (!fechaNacimiento) return null
    const fecha = new Date(fechaNacimiento)
    if (isNaN(fecha)) return null

    const hoy = new Date()
    let edad = hoy.getFullYear() - fecha.getFullYear()
    const mes = hoy.getMonth() - fecha.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
      edad--
    }
    return edad
  }

  const idPostulanteProceso = useMemo(() => {
    return (
      idProcesoEncontrado ||
      detallePostulante?.idPostulanteProceso ||
      detallePostulante?.id_postulante_proceso ||
      postulante?.idPostulanteProceso ||
      postulante?.id_postulante_proceso ||
      null
    )
  }, [detallePostulante, postulante, idProcesoEncontrado])

  useEffect(() => {
    if (!id || !idPuesto || idPostulanteProceso) return

    let cancelado = false

    const buscarProceso = async () => {
      try {
        const procesos = await reclutamientoService.obtenerCandidatosPorVacante(idPuesto)
        const proceso = procesos.find(p => String(p.idPostulante) === String(id))

        if (!cancelado && proceso?.idPostulanteProceso) {
          setIdProcesoEncontrado(proceso.idPostulanteProceso)
        }
      } catch (err) {
        console.error('No se pudo obtener el proceso del postulante:', err)
      }
    }

    buscarProceso()

    return () => {
      cancelado = true
    }
  }, [id, idPuesto, idPostulanteProceso])

  const volverARecepcion = () => {
    navigate('/recepcion-cv', {
      state: { area, idPuesto }
    })
  }

  const handleAprobar = async () => {
    if (!idPostulanteProceso || procesandoAccion) return

    setProcesandoAccion(true)
    setErrorAccion('')

    try {
      await reclutamientoService.moverCandidatoEtapa(
        idPostulanteProceso,
        EtapaProceso.ENTREVISTA
      )
      alert('Postulante movido a ENTREVISTA correctamente.')
      volverARecepcion()
    } catch (err) {
      console.error('Error al mover a entrevista:', err)
      setErrorAccion('No se pudo mover al postulante a entrevista. Intente nuevamente.')
    } finally {
      setProcesandoAccion(false)
    }
  }

  const handleRechazar = async () => {
    if (!idPostulanteProceso || procesandoAccion) return

    setProcesandoAccion(true)
    setErrorAccion('')

    try {
      await reclutamientoService.rechazarCandidato(
        idPostulanteProceso,
        'Rechazado durante revisión de CV'
      )
      alert('Postulante marcado como DESCARTADO.')
      volverARecepcion()
    } catch (err) {
      console.error('Error al descartar postulante:', err)
      setErrorAccion('No se pudo descartar al postulante. Intente nuevamente.')
    } finally {
      setProcesandoAccion(false)
    }
  }

  if (cargandoDetalle) {
    return (
      <div className="cv-full-view d-flex flex-column justify-content-center align-items-center">
        <p className="fs-4">Cargando información del postulante...</p>
      </div>
    )
  }

  if (!detallePostulante || errorCarga) {
    return (
      <div className="cv-full-view d-flex flex-column justify-content-center align-items-center">
        <p className="fs-4 text-danger">{errorCarga || 'No se encontró información del postulante.'}</p>
        <button className="btn btn-dark mt-3" onClick={volverARecepcion}>
          Volver
        </button>
      </div>
    )
  }

  const nombreCompleto = `${detallePostulante.nombres} ${detallePostulante.apellidoPaterno}${
    detallePostulante.apellidoMaterno ? ` ${detallePostulante.apellidoMaterno}` : ''
  }`.trim()

  return (
    <div className="cv-full-view">
      <div className="cv-header">
        <div>
          <h2 className="fw-bold mb-0">Recepción de CVs</h2>
          <p className="text-muted mb-0">
            {area && nombrePuesto ? `${area} > ${nombrePuesto}` : 'No se pudo determinar el puesto'}
          </p>
          <div className="cv-tabs">
            <button
              className={tabActiva === 'info' ? 'cv-tab-btn cv-tab-active' : 'cv-tab-btn'}
              onClick={() => setTabActiva('info')}
            >
              Información personal
            </button>
            <span className="mx-2 text-muted">|</span>
            <button
              className={tabActiva === 'skills' ? 'cv-tab-btn cv-tab-active' : 'cv-tab-btn'}
              onClick={() => setTabActiva('skills')}
            >
              Habilidades
            </button>
          </div>
        </div>

        <button className="btn btn-dark" onClick={volverARecepcion}>
          VOLVER
        </button>
      </div>

      <div className="cv-body">
        <div className="cv-info-card">
          <h4 className="fw-bold mb-4">
            {nombreCompleto}{nombrePuesto ? ` - ${nombrePuesto}` : ''}
          </h4>
          {tabActiva === 'info' && (
            <>
              {/* Información Personal */}
              <div className="info-section">
                <h5 className="section-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Información Personal
                </h5>

                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                    <div className="info-content">
                      <span className="info-label">Email</span>
                      <span className="info-value">{detallePostulante.email || 'No especificado'}</span>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                        <line x1="12" y1="18" x2="12.01" y2="18"></line>
                      </svg>
                    </div>
                    <div className="info-content">
                      <span className="info-label">Teléfono</span>
                      <span className="info-value">{detallePostulante.telefono || 'No especificado'}</span>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                        <circle cx="12" cy="12" r="10"></circle>
                      </svg>
                    </div>
                    <div className="info-content">
                      <span className="info-label">Género</span>
                      <span className="info-value">{detallePostulante.genero || 'No especificado'}</span>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                    <div className="info-content">
                      <span className="info-label">Edad</span>
                      <span className="info-value">
                        {detallePostulante.edad
                          ? `${detallePostulante.edad} años`
                          : obtenerEdad(detallePostulante.fechaNacimiento)
                            ? `${obtenerEdad(detallePostulante.fechaNacimiento)} años`
                            : 'No especificado'}
                      </span>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                    <div className="info-content">
                      <span className="info-label">Dirección</span>
                      <span className="info-value">{detallePostulante.direccion || 'No especificado'}</span>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 6v6l4 2"></path>
                      </svg>
                    </div>
                    <div className="info-content">
                      <span className="info-label">Estado Civil</span>
                      <span className="info-value">{detallePostulante.estadoCivil || 'No especificado'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formación Académica */}
              <div className="info-section">
                <h5 className="section-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                  </svg>
                  Formación Académica
                </h5>

                {Array.isArray(detallePostulante.formacionesAcademicas) &&
                detallePostulante.formacionesAcademicas.length > 0 ? (
                  <div className="timeline">
                    {detallePostulante.formacionesAcademicas.map((formacion, idx) => (
                      <div key={formacion.idFormacion || idx} className="timeline-item">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <h6 className="timeline-title">{formacion.carrera || 'Carrera no especificada'}</h6>
                            <span className="timeline-badge">{formacion.nivelEstudios || 'N/A'}</span>
                          </div>
                          
                          <div className="timeline-meta">
                            <span className="timeline-institution">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                              </svg>
                              {formacion.institucion || 'Institución no especificada'}
                            </span>
                            <span className="timeline-period">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                              </svg>
                              {obtenerPeriodo(formacion.fechaInicio, formacion.fechaFin)}
                            </span>
                          </div>

                          {formacion.situacion && (
                            <div className="timeline-status">
                              <span className={`status-badge status-${formacion.situacion.toLowerCase()}`}>
                                {formacion.situacion}
                              </span>
                            </div>
                          )}

                          {formacion.cursosRelevantes && (
                            <div className="timeline-detail">
                              <strong>Cursos relevantes:</strong> {formacion.cursosRelevantes}
                            </div>
                          )}

                          {formacion.observaciones && (
                            <div className="timeline-detail">
                              <strong>Observaciones:</strong> {formacion.observaciones}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-message">Sin formación académica registrada</p>
                )}
              </div>

              {/* Experiencia Laboral */}
              <div className="info-section">
                <h5 className="section-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                  Experiencia Laboral
                </h5>

                {Array.isArray(detallePostulante.experiencias) && detallePostulante.experiencias.length > 0 ? (
                  <div className="timeline">
                    {detallePostulante.experiencias.map((exp, idx) => {
                      const meses = obtenerMeses(exp.fechaInicio, exp.fechaFin)
                      return (
                        <div key={exp.idExperiencia || idx} className="timeline-item">
                          <div className="timeline-marker"></div>
                          <div className="timeline-content">
                            <div className="timeline-header">
                              <h6 className="timeline-title">{exp.cargo || 'Cargo no especificado'}</h6>
                              {meses !== null && (
                                <span className="timeline-duration">{meses} meses</span>
                              )}
                            </div>
                            
                            <div className="timeline-meta">
                              <span className="timeline-company">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                </svg>
                                {exp.empresa || 'Empresa no especificada'}
                              </span>
                              <span className="timeline-period">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                {obtenerPeriodo(exp.fechaInicio, exp.fechaFin)}
                              </span>
                            </div>

                            {exp.funcionesPrincipales && (
                              <div className="timeline-description">
                                <p>{exp.funcionesPrincipales}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="empty-message">Sin experiencia laboral registrada</p>
                )}
              </div>
            </>
          )}

          {tabActiva === 'skills' && (
            <div>
              <br />
              <h5 className="mt-4 mb-2"><strong>Habilidades del postulante</strong></h5>
              <br />

              {cargandoHabilidades && <p className="text-muted">Cargando habilidades...</p>}
              {!cargandoHabilidades && errorHabilidades && (
                <p className="text-danger">{errorHabilidades}</p>
              )}

              {!cargandoHabilidades && !errorHabilidades && habilidades.length === 0 && (
                <p className="text-muted">Sin habilidades registradas.</p>
              )}

              {!cargandoHabilidades && !errorHabilidades && habilidades.length > 0 && (
                <div className="habilidades-lista">
                  {['TECNICA', 'BLANDA'].map(tipo => {
                    const habilidadesPorTipo = habilidades.filter(h => h.tipo === tipo)

                    if (habilidadesPorTipo.length === 0) return null

                    return (
                      <div key={tipo} className="mb-5">
                        <h6 className="habilidades-tipo-titulo mb-3">
                          {tipo === 'TECNICA' ? 'Habilidades Técnicas' : 'Habilidades Blandas'}
                        </h6>
                        <div className="habilidades-grid">
                          {habilidadesPorTipo.map(habilidad => (
                            <div key={habilidad.id} className="habilidad-card">
                              <div className="habilidad-header">
                                <h6 className="habilidad-nombre">{habilidad.nombre}</h6>
                                {habilidad.categoria && (
                                  <span className="habilidad-categoria">{habilidad.categoria}</span>
                                )}
                              </div>
                              
                              {habilidad.descripcion && (
                                <p className="habilidad-descripcion">{habilidad.descripcion}</p>
                              )}
                              
                              <div className="habilidad-badges">
                                {habilidad.nivelDominio && (
                                  <span className="habilidad-badge badge-nivel">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                                    </svg>
                                    {habilidad.nivelDominio}
                                  </span>
                                )}
                                {habilidad.anosExperiencia !== null && habilidad.anosExperiencia !== undefined && (
                                  <span className="habilidad-badge badge-experiencia">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <circle cx="12" cy="12" r="10"/>
                                      <polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                    {habilidad.anosExperiencia} año{habilidad.anosExperiencia === 1 ? '' : 's'}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="cv-preview-card">
          <div className="cv-pdf-box">
            {cargandoCV && <div className="cv-pdf-placeholder">Cargando CV en PDF...</div>}
            {!cargandoCV && errorCV && <div className="cv-pdf-placeholder text-danger">{errorCV}</div>}
            {!cargandoCV && !errorCV && cvUrl && (
              <iframe title="CV del postulante" src={cvUrl} className="cv-pdf-frame" />
            )}
            {!cargandoCV && !errorCV && !cvUrl && (
              <div className="cv-pdf-placeholder">No hay CV disponible.</div>
            )}
          </div>

          {errorAccion && <div className="alert alert-danger">{errorAccion}</div>}

          <div className="cv-preview-actions">
            <button
              className="btn btn-success rounded-pill fw-semibold"
              onClick={handleAprobar}
              disabled={procesandoAccion || !idPostulanteProceso}
            >
              {procesandoAccion ? 'Procesando...' : 'Aprobar y continuar'}
            </button>

            <button
              className="btn btn-outline-danger rounded-pill fw-semibold"
              onClick={handleRechazar}
              disabled={procesandoAccion || !idPostulanteProceso}
            >
              {procesandoAccion ? 'Procesando...' : 'Rechazar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetalleCV
