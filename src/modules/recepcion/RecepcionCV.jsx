import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import apiClient from '../../services/api/client'
import './RecepcionCV.css'
import searchIcon from './assets/search.svg'
import cvIcon from './assets/curriculum.svg'

const RecepcionCV = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [areas, setAreas] = useState([])
  const [puestos, setPuestos] = useState([])
  const [areaActiva, setAreaActiva] = useState('')
  const [puestoActivo, setPuestoActivo] = useState(null)
  const [postulantes, setPostulantes] = useState([])
  const [loading, setLoading] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [ordenarPor, setOrdenarPor] = useState('')

  useEffect(() => {
    const cargarPuestos = async () => {
      try {
        const data = await apiClient.get('/rrhh/puestos')
        setPuestos(data)
        const uniqueAreas = [...new Set(data.map(p => p.area))]
        setAreas(uniqueAreas)
        
        // Si viene del state, restaurar la posición
        if (location.state?.area && location.state?.idPuesto) {
          setAreaActiva(location.state.area)
          const puestoRestaurado = data.find(p => p.idPuesto === location.state.idPuesto)
          if (puestoRestaurado) {
            setPuestoActivo(puestoRestaurado)
          }
          // Limpiar el state para que no interfiera con futuras selecciones
          window.history.replaceState({}, document.title)
        } else if (uniqueAreas.length > 0) {
          setAreaActiva(uniqueAreas[0])
        }
      } catch (err) {
        console.error('Error cargando puestos:', err)
      }
    }

    cargarPuestos()
  }, [])

  useEffect(() => {
    if (!areaActiva) return
    
    const pArea = puestos.filter(p => p.area === areaActiva)
    if (pArea.length > 0 && !puestoActivo) {
      setPuestoActivo(pArea[0])
    }
  }, [areaActiva, puestos])

  const cargarPostulantes = useCallback(async idPuesto => {
    if (!idPuesto) return
    setLoading(true)
    try {
      const data = await apiClient.get(
        `/rrhh/postulantes-proceso/puesto/${idPuesto}/revision-cv`
      )
      setPostulantes(data)
    } catch (err) {
      console.error('Error cargando postulantes:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!puestoActivo) return
    cargarPostulantes(puestoActivo.idPuesto)
  }, [puestoActivo, cargarPostulantes])

  const puestosDeAreaActiva = useMemo(
    () => puestos.filter(p => p.area === areaActiva),
    [puestos, areaActiva]
  )

  const postulantesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()
    let filtrados = postulantes.filter(p => {
      const coincideTexto = termino
        ? `${p.nombres} ${p.apellidoPaterno} ${p.apellidoMaterno || ''} ${p.email}`
            .toLowerCase()
            .includes(termino)
        : true
      return coincideTexto
    })

    // Ordenar según el criterio seleccionado
    if (ordenarPor) {
      filtrados = [...filtrados].sort((a, b) => {
        switch (ordenarPor) {
          case 'nombre':
            const nombreA = `${a.nombres} ${a.apellidoPaterno} ${a.apellidoMaterno || ''}`.toLowerCase()
            const nombreB = `${b.nombres} ${b.apellidoPaterno} ${b.apellidoMaterno || ''}`.toLowerCase()
            return nombreA.localeCompare(nombreB)
          
          case 'email':
            return (a.email || '').toLowerCase().localeCompare((b.email || '').toLowerCase())
          
          case 'edad':
            const edadA = a.edad ?? obtenerEdad(a.fechaNacimiento) ?? 999
            const edadB = b.edad ?? obtenerEdad(b.fechaNacimiento) ?? 999
            return edadA - edadB
          
          case 'genero':
            return (a.genero || '').localeCompare(b.genero || '')
          
          default:
            return 0
        }
      })
    }

    return filtrados
  }, [postulantes, busqueda, ordenarPor])

  const handleBuscar = event => {
    event.preventDefault()
    setBusqueda(busqueda.trim())
  }

  const handleProcesarCVs = async () => {
    if (!puestoActivo || procesando) return

    setProcesando(true)
    try {
      const resumen = await apiClient.post(
        `/rrhh/puestos/${puestoActivo.idPuesto}/procesar-cv`
      )

      const totalNuevas = resumen.reduce(
        (acc, item) => {
          acc.formaciones += item.formacionesAgregadas || 0
          acc.experiencias += item.experienciasAgregadas || 0
          acc.habilidades += item.habilidadesAgregadas || 0
          return acc
        },
        { formaciones: 0, experiencias: 0, habilidades: 0 }
      )

      alert(
        `CVs procesados. Nuevas formaciones: ${totalNuevas.formaciones}, experiencias: ${totalNuevas.experiencias}, habilidades: ${totalNuevas.habilidades}`
      )

      await cargarPostulantes(puestoActivo.idPuesto)
    } catch (err) {
      console.error('Error procesando CVs:', err)
      alert('No se pudieron procesar los CVs. Intente nuevamente.')
    } finally {
      setProcesando(false)
    }
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

  return (
    <div className="rcv-page">
      {/* Header */}
      <div className="rcv-header">
        <div className="rcv-header-info">
          <h2 className="rcv-title">Recepción de CVs</h2>
          <p className="rcv-breadcrumb">
            {areaActiva && puestoActivo 
              ? `${areaActiva} > ${puestoActivo.nombrePuesto}` 
              : 'Seleccione un área y puesto'}
          </p>
        </div>

        <div className="rcv-header-actions">
          <button
            className="rcv-upload-btn"
            onClick={handleProcesarCVs}
            disabled={!puestoActivo || procesando}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            {procesando ? 'Procesando...' : 'Cargar CV'}
          </button>

          <form className="rcv-search" onSubmit={handleBuscar}>
            <span className="rcv-search-icon">
              <img src={searchIcon} alt="buscar" />
            </span>
            <input
              type="text"
              className="rcv-search-input"
              placeholder="Buscar por nombre o email..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            <button className="rcv-search-btn" type="submit">
              Buscar
            </button>
          </form>

          <select
            className="rcv-filter-select"
            value={ordenarPor}
            onChange={e => setOrdenarPor(e.target.value)}
          >
            <option value="">Ordenar por...</option>
            <option value="nombre">Nombre (A-Z)</option>
            <option value="email">Email (A-Z)</option>
            <option value="edad">Edad (menor a mayor)</option>
            <option value="genero">Género (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Navigation */}
      <div className="rcv-nav-container">
        {/* Areas tabs */}
        <div className="rcv-tabs-wrapper">
          <ul className="rcv-tabs">
            {areas.map(area => (
              <li key={area}>
                <button
                  className={`rcv-tab ${areaActiva === area ? 'rcv-tab-active' : ''}`}
                  onClick={() => setAreaActiva(area)}
                >
                  {area}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Puestos pills */}
        <div className="rcv-pills-wrapper">
          <ul className="rcv-pills">
            {puestosDeAreaActiva.map(puesto => (
              <li key={puesto.idPuesto}>
                <button
                  className={`rcv-pill ${puestoActivo?.idPuesto === puesto.idPuesto ? 'rcv-pill-active' : ''}`}
                  onClick={() => setPuestoActivo(puesto)}
                >
                  <span className="rcv-pill-text">{puesto.nombrePuesto}</span>
                  {puestoActivo?.idPuesto === puesto.idPuesto && (
                    <span className="rcv-pill-badge">{postulantesFiltrados.length}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Table */}
      <div className="rcv-content">
        {loading ? (
          <div className="rcv-empty-state">
            <div className="rcv-spinner"></div>
            <p>Cargando postulantes...</p>
          </div>
        ) : postulantesFiltrados.length === 0 ? (
          <div className="rcv-empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            <p className="rcv-empty-title">No hay postulantes</p>
            <p className="rcv-empty-subtitle">
              No se encontraron postulantes en revisión para este puesto
            </p>
          </div>
        ) : (
          <div className="rcv-table-container">
            <table className="rcv-table">
              <thead>
                <tr>
                  <th className="rcv-th">ID</th>
                  <th className="rcv-th">Nombre completo</th>
                  <th className="rcv-th">Contacto</th>
                  <th className="rcv-th rcv-th-center">Edad</th>
                  <th className="rcv-th rcv-th-center">Género</th>
                  <th className="rcv-th rcv-th-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {postulantesFiltrados.map(p => {
                  const edad = p.edad ?? obtenerEdad(p.fechaNacimiento)
                  
                  return (
                    <tr key={p.idPostulante} className="rcv-tr">
                      <td className="rcv-td">
                        <span className="rcv-id-badge">{p.idPostulante}</span>
                      </td>
                      <td className="rcv-td">
                        <div className="rcv-postulante-info">
                          <div className="rcv-postulante-avatar">
                            {p.nombres?.charAt(0)}{p.apellidoPaterno?.charAt(0)}
                          </div>
                          <div>
                            <div className="rcv-postulante-nombre">
                              {`${p.nombres} ${p.apellidoPaterno} ${p.apellidoMaterno || ''}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="rcv-td">
                        <div className="rcv-contact-info">
                          <div className="rcv-contact-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                              <line x1="12" y1="18" x2="12.01" y2="18"></line>
                            </svg>
                            <span>{p.telefono || 'No disponible'}</span>
                          </div>
                          <div className="rcv-contact-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                              <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            <span>{p.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="rcv-td rcv-td-center">
                        {edad ? (
                          <span className="rcv-data-badge">{edad} años</span>
                        ) : (
                          <span className="rcv-data-empty">-</span>
                        )}
                      </td>
                      <td className="rcv-td rcv-td-center">
                        <span className="rcv-gender-badge">
                          {p.genero || 'No especificado'}
                        </span>
                      </td>
                      <td className="rcv-td rcv-td-center">
                        <button
                          className="rcv-action-btn"
                          onClick={() =>
                            navigate(`/postulantes/${p.idPostulante}/cv`, {
                              state: { 
                                postulante: p, 
                                nombrePuesto: puestoActivo?.nombrePuesto,
                                area: areaActiva,
                                idPuesto: puestoActivo?.idPuesto
                              }
                            })
                          }
                          title="Ver CV completo"
                        >
                          <img src={cvIcon} alt="Ver CV" />
                          <span>Ver CV</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecepcionCV