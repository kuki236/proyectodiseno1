import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRRHH } from '../../../store/RRHHContext'
import reclutamientoService from '../../../services/api/reclutamientoService'

const PosicionCard = ({ position }) => {
  const navigate = useNavigate()
  const [candidatosCount, setCandidatosCount] = useState(position.candidates || 0)
  const priorityClass = 'priority-' + position.priority.toLowerCase().replace(/ /g, '-')

  useEffect(() => {
    // Cargar el conteo real de candidatos vinculados a esta vacante
    const cargarCandidatos = async () => {
      try {
        const candidatos = await reclutamientoService.obtenerCandidatosPorVacante(position.id)
        setCandidatosCount(candidatos.length)
      } catch (err) {
        console.error('Error al cargar candidatos:', err)
      }
    }
    
    if (position.id) {
      cargarCandidatos()
    }
  }, [position.id])

  const handleVerCandidatos = () => {
    navigate('/candidatos')
  }

  return (
    <div className="posicion-card">
      <h3>{position.name}</h3>
      <div className="department">{position.department}</div>
      <div className="description">{position.description}</div>
      <div className={`priority-badge ${priorityClass}`}>{position.priority}</div>
      <div className="posicion-stats">
        <div className="stat-item">
          <div className="stat-number">{candidatosCount}</div>
          <div className="stat-label">Candidatos</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{position.selected}</div>
          <div className="stat-label">Seleccionados</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{position.interviews}</div>
          <div className="stat-label">Entrevistas</div>
        </div>
      </div>
      <button className="btn-primary" onClick={handleVerCandidatos}>
        Ver Candidatos
      </button>
    </div>
  )
}

export default PosicionCard

