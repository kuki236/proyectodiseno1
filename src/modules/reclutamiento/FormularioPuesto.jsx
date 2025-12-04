import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRRHH } from '../../store/RRHHContext'
import { useNotification } from '../../components/common/NotificationProvider'

const FormularioPuesto = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { success, error } = useNotification()
  const { 
    positionsData, 
    departamentos, 
    puestosPorDepartamento,
    addPosition,
    updatePosition,
    setEditingPositionId
  } = useRRHH()

  const [formData, setFormData] = useState({
    department: '',
    positionName: '',
    description: '',
    priority: '',
    modalidad: '',
    tipoContrato: '',
    requisitos: ''
  })

  const [availablePositions, setAvailablePositions] = useState([])

  useEffect(() => {
    if (id) {
      const position = positionsData.find(p => p.id === parseInt(id))
      if (position) {
        setFormData({
          department: position.department,
          positionName: position.name,
          description: position.description,
          priority: position.priority,
          modalidad: position.modalidad,
          tipoContrato: position.tipoContrato,
          requisitos: position.requisitos || ''
        })
        setEditingPositionId(parseInt(id))
      }
    } else {
      setEditingPositionId(null)
    }
  }, [id, positionsData, setEditingPositionId])

  useEffect(() => {
    if (formData.department && puestosPorDepartamento[formData.department]) {
      setAvailablePositions(puestosPorDepartamento[formData.department])
    } else {
      setAvailablePositions([])
    }
    if (!formData.department) {
      setFormData(prev => ({ ...prev, positionName: '' }))
    }
  }, [formData.department, puestosPorDepartamento])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.positionName || !formData.department || !formData.description ||
        !formData.priority || !formData.modalidad || !formData.tipoContrato) {
      error('Por favor completa todos los campos obligatorios')
      return
    }

    const positionData = {
      name: formData.positionName,
      department: formData.department,
      description: formData.description,
      priority: formData.priority,
      modalidad: formData.modalidad,
      tipoContrato: formData.tipoContrato,
      requisitos: formData.requisitos || '',
      candidates: 0,
      selected: 0,
      interviews: 0
    }

    if (id) {
      updatePosition(parseInt(id), positionData)
      success('Oportunidad de trabajo actualizada exitosamente')
    } else {
      addPosition(positionData)
      success('Oportunidad de trabajo agregada exitosamente')
    }

    navigate('/posiciones')
  }

  const handleCancel = () => {
    setEditingPositionId(null)
    navigate('/posiciones')
  }

  return (
    <div className="view-container active">
      <button className="btn-back" onClick={handleCancel}>
        ← Volver
      </button>
      <div className="form-container">
        <h2>{id ? 'Editar Oportunidad de Trabajo' : 'Crear Nueva Oportunidad de Trabajo'}</h2>
        <form id="position-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Departamento *</label>
            <select
              id="form-department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
            >
              <option value="">Seleccionar...</option>
              {departamentos.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Oportunidad de Trabajo *</label>
            <select
              id="form-position-name"
              value={formData.positionName}
              onChange={(e) => setFormData({ ...formData, positionName: e.target.value })}
              required
              disabled={!formData.department}
            >
              <option value="">{formData.department ? 'Seleccionar...' : 'Seleccione un departamento primero...'}</option>
              {availablePositions.map(puesto => (
                <option key={puesto} value={puesto}>{puesto}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Descripción *</label>
            <textarea
              id="form-description"
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Prioridad *</label>
            <select
              id="form-priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              required
            >
              <option value="">Seleccionar...</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
              <option value="Crítica">Crítica</option>
            </select>
          </div>
          <div className="form-group">
            <label>Modalidad *</label>
            <select
              id="form-modalidad"
              value={formData.modalidad}
              onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })}
              required
            >
              <option value="">Seleccionar...</option>
              <option value="Presencial">Presencial</option>
              <option value="Remoto">Remoto</option>
              <option value="Híbrido">Híbrido</option>
            </select>
          </div>
          <div className="form-group">
            <label>Tipo de Contrato *</label>
            <select
              id="form-tipo-contrato"
              value={formData.tipoContrato}
              onChange={(e) => setFormData({ ...formData, tipoContrato: e.target.value })}
              required
            >
              <option value="">Seleccionar...</option>
              <option value="Prácticas">Prácticas</option>
              <option value="Por horas">Por horas</option>
              <option value="Jornada completa">Jornada completa</option>
              <option value="Medio tiempo">Medio tiempo</option>
            </select>
          </div>
          <div className="form-group">
            <label>Requisitos</label>
            <textarea
              id="form-requisitos"
              rows="4"
              value={formData.requisitos}
              onChange={(e) => setFormData({ ...formData, requisitos: e.target.value })}
              placeholder="Ingrese los requisitos para esta oportunidad de trabajo (opcional, pero necesario para publicar)"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">Guardar Oportunidad</button>
            <button type="button" className="btn-secondary" onClick={handleCancel}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FormularioPuesto

