import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRRHH } from '../../store/RRHHContext'
import vacanteService from '../../services/api/vacanteService'

const Pipeline = () => {
  const navigate = useNavigate()
  const { candidatesData, pipelineStages } = useRRHH()
  const [filterPuesto, setFilterPuesto] = useState('')
  const [vacantes, setVacantes] = useState([])

  useEffect(() => {
    const cargarVacantes = async () => {
      try {
        const data = await vacanteService.obtenerVacantes()
        setVacantes(data)
      } catch (err) {
        console.error('Error al cargar vacantes:', err)
      }
    }
    cargarVacantes()
  }, [])

  const stageColors = {
    "Nuevo": "#6c757d",
    "En Entrevista": "#3C83F6",
    "Prueba Técnica": "#ffc107",
    "Entrevista Final": "#17a2b8",
    "Oferta": "#28a745",
    "Contratado": "#20c997",
    "Rechazado": "#dc3545"
  }

  const handleCardClick = (candidateId) => {
    navigate(`/candidatos/${candidateId}`)
  }

  return (
    <div className="view-container active">
      <div className="view-header">
        <h1>Pipeline de Selección</h1>
        <div className="pipeline-controls">
          <label>Filtrar por Puesto:</label>
          <select
            id="filter-pipeline-puesto"
            value={filterPuesto}
            onChange={(e) => setFilterPuesto(e.target.value)}
          >
            <option value="">Todos</option>
            {vacantes.map(vacante => (
              <option key={vacante.idVacante} value={vacante.nombre}>
                {vacante.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div id="pipeline-container" className="pipeline-container">
        {pipelineStages.map(stage => {
          const candidates = candidatesData.filter(c => {
            const positionMatch = !filterPuesto || c.position === filterPuesto || filterPuesto === ''
            const statusMatch = c.status === stage
            return statusMatch && positionMatch
          })

          return (
            <div key={stage} className="pipeline-column">
              <div
                className="pipeline-header"
                style={{ background: stageColors[stage] || '#6c757d' }}
              >
                {stage}
                <span> ({candidates.length})</span>
              </div>
              <div className="pipeline-column-content">
                {candidates.length > 0 ? (
                  candidates.map(candidate => (
                    <div
                      key={candidate.id}
                      className="pipeline-card"
                      onClick={() => handleCardClick(candidate.id)}
                    >
                      <div className="pipeline-card-name">{candidate.name}</div>
                      <div className="pipeline-card-email">{candidate.email}</div>
                      <div className="pipeline-card-position">{candidate.position}</div>
                    </div>
                  ))
                ) : (
                  <div className="pipeline-empty-state">
                    <p>No hay candidatos</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Pipeline

