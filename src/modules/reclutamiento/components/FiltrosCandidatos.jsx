import React from 'react'

const FiltrosCandidatos = ({ search, estado, puesto, onSearchChange, onEstadoChange, onPuestoChange }) => {
  return (
    <div className="filters-section">
      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          id="search-candidates"
          placeholder="Buscar por nombre, email o puesto..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="filter-group">
        <label>Estado:</label>
        <select id="filter-estado" value={estado} onChange={(e) => onEstadoChange(e.target.value)}>
          <option value="">Todos</option>
          <option value="Nuevo">Nuevo</option>
          <option value="En Proceso">En Proceso</option>
          <option value="Entrevistado">Entrevistado</option>
          <option value="Rechazado">Rechazado</option>
          <option value="Contratado">Contratado</option>
        </select>
      </div>
      <div className="filter-group">
        <label>Puesto:</label>
        <select id="filter-puesto" value={puesto} onChange={(e) => onPuestoChange(e.target.value)}>
          <option value="">Todos</option>
          <option value="Técnico de Soporte">Técnico de Soporte</option>
          <option value="Ejecutivo de Ventas">Ejecutivo de Ventas</option>
          <option value="Ingeniero de Red">Ingeniero de Red</option>
          <option value="Especialista en Telecomunicaciones">Especialista Telecom</option>
          <option value="Técnico de Instalación">Técnico de Instalación</option>
        </select>
      </div>
    </div>
  )
}

export default FiltrosCandidatos

