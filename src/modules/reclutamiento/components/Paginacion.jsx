import React from 'react'

const Paginacion = ({ currentPage, totalPages, onPrevPage, onNextPage }) => {
  return (
    <div className="pagination">
      <button 
        id="btn-prev" 
        onClick={onPrevPage}
        disabled={currentPage === 1}
      >
        ← Anterior
      </button>
      <span id="page-info">
        Página {currentPage} de {totalPages}
      </span>
      <button 
        id="btn-next" 
        onClick={onNextPage}
        disabled={currentPage === totalPages}
      >
        Siguiente →
      </button>
    </div>
  )
}

export default Paginacion

