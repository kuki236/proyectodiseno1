import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRRHH } from '../../store/RRHHContext'
import PosicionCard from './components/PosicionCard'
import Paginacion from './components/Paginacion'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'

const PosicionesAbiertas = () => {
  const navigate = useNavigate()
  const { 
    positionsData, 
    loading, 
    error, 
    loadPositions, 
    setError 
  } = useRRHH()

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const handleAgregarPuesto = () => {
    navigate('/puesto/nuevo')
  }

  // Calcular paginación
  const start = (currentPage - 1) * itemsPerPage
  const end = start + itemsPerPage
  const pagePositions = positionsData.slice(start, end)
  const totalPages = Math.ceil(positionsData.length / itemsPerPage)

  // Resetear a página 1 cuando cambian los datos
  React.useEffect(() => {
    setCurrentPage(1)
  }, [positionsData.length])

  if (loading.positions) {
    return (
      <div className="view-container active">
        <div className="view-header">
          <h1>Posiciones Abiertas</h1>
        </div>
        <LoadingSpinner message="Cargando posiciones..." />
      </div>
    )
  }

  return (
    <div className="view-container active">
      <div className="view-header">
        <h1>Posiciones Abiertas</h1>
        <button className="btn-primary" onClick={handleAgregarPuesto}>
          + Agregar Oportunidad
        </button>
      </div>

      {error && (
        <ErrorMessage 
          message={error}
          onRetry={loadPositions}
          onDismiss={() => setError(null)}
        />
      )}

      <div id="posiciones-grid" className="posiciones-grid">
        {pagePositions.length > 0 ? (
          pagePositions.map(position => (
            <PosicionCard key={position.id} position={position} />
          ))
        ) : (
          <div style={{ 
            gridColumn: '1 / -1', 
            padding: '2rem', 
            textAlign: 'center', 
            color: 'var(--color-text-secondary)' 
          }}>
            No hay oportunidades de trabajo disponibles. Crea una nueva oportunidad para comenzar.
          </div>
        )}
      </div>

      {positionsData.length > itemsPerPage && (
        <Paginacion
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevPage={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          onNextPage={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
        />
      )}
    </div>
  )
}

export default PosicionesAbiertas

