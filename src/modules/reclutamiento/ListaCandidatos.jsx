import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRRHH } from '../../store/RRHHContext'
import CandidatosTable from './components/CandidatosTable'
import FiltrosCandidatos from './components/FiltrosCandidatos'
import Paginacion from './components/Paginacion'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'

const ListaCandidatos = () => {
  const navigate = useNavigate()
  const { 
    candidatesData, 
    currentPage, 
    itemsPerPage, 
    filteredCandidates,
    loading,
    error,
    setCurrentPage,
    setFilteredCandidates,
    loadCandidates,
    setError
  } = useRRHH()

  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState('')
  const [puesto, setPuesto] = useState('')

  useEffect(() => {
    const filtered = candidatesData.filter(candidate => {
      const searchMatch = candidate.name.toLowerCase().includes(search.toLowerCase()) ||
                        candidate.email.toLowerCase().includes(search.toLowerCase()) ||
                        candidate.position.toLowerCase().includes(search.toLowerCase())
      const estadoMatch = !estado || candidate.status === estado
      const puestoMatch = !puesto || candidate.position === puesto
      return searchMatch && estadoMatch && puestoMatch
    })

    setFilteredCandidates(filtered)
    setCurrentPage(1)
  }, [search, estado, puesto, candidatesData, setFilteredCandidates, setCurrentPage])

  const handleViewDetail = (candidateId) => {
    navigate(`/candidatos/${candidateId}`)
  }

  const start = (currentPage - 1) * itemsPerPage
  const end = start + itemsPerPage
  const pageCandidates = filteredCandidates.slice(start, end)
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage)

  if (loading.candidates) {
    return (
      <div className="view-container active">
        <div className="view-header">
          <h1>Reclutamiento y selección de personal</h1>
        </div>
        <LoadingSpinner message="Cargando candidatos..." />
      </div>
    )
  }

  return (
    <div className="view-container active">
      <div className="view-header">
        <h1>Reclutamiento y selección de personal</h1>
      </div>

      {error && (
        <ErrorMessage 
          message={error}
          onRetry={loadCandidates}
          onDismiss={() => setError(null)}
        />
      )}

      <FiltrosCandidatos
        search={search}
        estado={estado}
        puesto={puesto}
        onSearchChange={setSearch}
        onEstadoChange={setEstado}
        onPuestoChange={setPuesto}
      />

      {pageCandidates.length > 0 ? (
        <>
          <CandidatosTable 
            candidates={pageCandidates}
            onViewDetail={handleViewDetail}
          />

          <Paginacion
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevPage={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            onNextPage={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          />
        </>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          No se encontraron candidatos con los filtros aplicados.
        </div>
      )}
    </div>
  )
}

export default ListaCandidatos

