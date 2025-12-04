import React from 'react'

const CandidatosTable = ({ candidates, onViewDetail }) => {
  const getStatusClass = (status) => {
    return 'estado-' + status.toLowerCase().replace(/ /g, '-')
  }

  return (
    <div className="table-responsive">
      <table id="candidates-table" className="candidates-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Puesto</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody id="candidates-tbody">
          {candidates.map(candidate => (
            <tr key={candidate.id}>
              <td>{candidate.name}</td>
              <td>{candidate.email}</td>
              <td>{candidate.phone}</td>
              <td>{candidate.position}</td>
              <td>
                <span className={`estado-badge ${getStatusClass(candidate.status)}`}>
                  {candidate.status}
                </span>
              </td>
              <td>
                <button 
                  className="btn-secondary" 
                  onClick={() => onViewDetail(candidate.id)}
                >
                  Ver Detalle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CandidatosTable

