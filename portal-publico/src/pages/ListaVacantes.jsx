import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../services/api'
import './ListaVacantes.css'

const ListaVacantes = () => {
  const navigate = useNavigate()
  const [vacantes, setVacantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [departamentoFiltro, setDepartamentoFiltro] = useState('Todos')

  useEffect(() => {
    cargarVacantes()
  }, [])

  const cargarVacantes = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.get('/vacantes', {
        estado: 'ABIERTA',
        etapa: 'REVISION_CV'
      })
      setVacantes(data || [])
    } catch (err) {
      console.error('Error al cargar vacantes:', err)
      setError('Error al cargar las oportunidades de trabajo')
    } finally {
      setLoading(false)
    }
  }

  const departamentos = ['Todos', ...new Set(vacantes.map(v => v.departamento).filter(Boolean))].sort()

  const vacantesFiltradas = vacantes.filter(v => {
    const matchBusqueda = !busqueda || 
      v.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.departamento?.toLowerCase().includes(busqueda.toLowerCase())
    
    const matchDepartamento = departamentoFiltro === 'Todos' || v.departamento === departamentoFiltro
    
    return matchBusqueda && matchDepartamento
  })

  if (loading) {
    return (
      <div className="lista-vacantes-container">
        <div className="loading">Cargando oportunidades de trabajo...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="lista-vacantes-container">
        <div className="error">{error}</div>
      </div>
    )
  }

  return (
    <div className="lista-vacantes-container">
      <header className="header">
        <div className="header-content">
          <h1>Oportunidades de Trabajo</h1>
          <p className="subtitle">Encuentra el trabajo que buscas</p>
        </div>
      </header>

      <div className="filtros-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por puesto, descripción o departamento..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="departamento-filtro">
          <label>Filtrar por departamento:</label>
          <select
            value={departamentoFiltro}
            onChange={(e) => setDepartamentoFiltro(e.target.value)}
            className="select-filtro"
          >
            {departamentos.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="vacantes-grid">
        {vacantesFiltradas.length === 0 ? (
          <div className="no-vacantes">
            <p>No se encontraron oportunidades de trabajo disponibles</p>
          </div>
        ) : (
          vacantesFiltradas.map(vacante => (
            <div key={vacante.idVacante} className="vacante-card">
              <div className="vacante-header">
                <h2>{vacante.nombre || 'Sin título'}</h2>
                <span className="departamento-badge">{vacante.departamento || 'Sin departamento'}</span>
              </div>
              
              <div className="vacante-info">
                {vacante.modalidad && (
                  <div className="info-item">
                    <span className="label">Modalidad:</span>
                    <span>{vacante.modalidad}</span>
                  </div>
                )}
                {vacante.tipoContrato && (
                  <div className="info-item">
                    <span className="label">Tipo de contrato:</span>
                    <span>{vacante.tipoContrato}</span>
                  </div>
                )}
                {vacante.rangoSalarial && (
                  <div className="info-item">
                    <span className="label">Rango salarial:</span>
                    <span>{vacante.rangoSalarial}</span>
                  </div>
                )}
              </div>

              {vacante.descripcion && (
                <div className="vacante-descripcion">
                  <p>{vacante.descripcion.length > 150 
                    ? `${vacante.descripcion.substring(0, 150)}...` 
                    : vacante.descripcion}</p>
                </div>
              )}

              {vacante.requisitos && (
                <div className="vacante-requisitos">
                  <strong>Requisitos:</strong>
                  <p>{vacante.requisitos.length > 100 
                    ? `${vacante.requisitos.substring(0, 100)}...` 
                    : vacante.requisitos}</p>
                </div>
              )}

              <button
                className="btn-postular"
                onClick={() => navigate(`/postular/${vacante.idVacante}`)}
              >
                Postular ahora
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ListaVacantes

