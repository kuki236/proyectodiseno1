import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import authService from '../../services/api/authService'

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await authService.logout()
    navigate('/login')
  }

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  // Determinar sección activa según la ruta actual
  const isRecepcionActive = isActive('/recepcion-cv')
  const isReclutamientoActive = !isRecepcionActive && (isActive('/pipeline') || isActive('/candidatos') || isActive('/posiciones'))
  const isInicioActive = isActive('/inicio')
  const isAsistenciaActive = isActive('/control-asistencia')
  const isIncentivosActive = isActive('/incentivos-reconocimientos')
  const isVacacionesActive = isActive('/vacaciones-permisos')
  const isEmpleadosActive = isActive('/gestion-empleados')

  return (
    <aside className="sidebar">
      <button 
        className={`sidebar-btn ${isInicioActive ? 'active' : ''}`}
        onClick={() => navigate('/inicio')}
        title="Inicio"
      >
        <img src="/images/vector-13.svg" alt="Inicio" className="icon" />
      </button>

      <button className="sidebar-btn" style={{ cursor: 'default', pointerEvents: 'none' }}>
        <img src="/images/line-1-5.svg" alt="Separador" className="icon" />
      </button>

      <button 
        className={`sidebar-btn ${isRecepcionActive ? 'active' : ''}`}
        onClick={() => navigate('/recepcion-cv')}
        title="Recepción de CVs"
      >
        <img src="/images/image-2-10.png" alt="Recepción de CVs" className="icon" />
      </button>

      <button 
        className={`sidebar-btn ${isReclutamientoActive ? 'active' : ''}`}
        onClick={() => navigate('/posiciones')}
        title="Reclutamiento y Selección"
      >
        <img src="/images/image-3-12.png" alt="Reclutamiento" className="icon" />
      </button>

      <button 
        className={`sidebar-btn ${isAsistenciaActive ? 'active' : ''}`}
        onClick={() => navigate('/control-asistencia')}
        title="Control de Asistencia"
      >
        <img src="/images/image-4-6.png" alt="Control de Asistencia" className="icon" />
      </button>

      <button 
        className={`sidebar-btn ${isIncentivosActive ? 'active' : ''}`}
        onClick={() => navigate('/incentivos-reconocimientos')}
        title="Gestión de Incentivos y Reconocimientos"
      >
        <img src="/images/image-5-7.png" alt="Gestión de Incentivos y Reconocimientos" className="icon" />
      </button>

      <button 
        className={`sidebar-btn ${isVacacionesActive ? 'active' : ''}`}
        onClick={() => navigate('/vacaciones-permisos')}
        title="Gestión de Vacaciones y Permisos"
      >
        <img src="/images/image-6-8.png" alt="Gestión de Vacaciones y Permisos" className="icon" />
      </button>

      <button 
        className={`sidebar-btn ${isEmpleadosActive ? 'active' : ''}`}
        onClick={() => navigate('/gestion-empleados')}
        title="Gestión de Empleados"
      >
        <img src="/images/image-7-9.png" alt="Gestión de Empleados" className="icon" />
      </button>

      <div style={{ flex: 1 }}></div>
      <button 
        className="sidebar-btn"
        onClick={handleLogout}
        title="Cerrar Sesión"
        style={{ marginTop: 'auto' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'brightness(0) invert(1)' }}>
          <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.59L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="currentColor"/>
        </svg>
      </button>
    </aside>
  )
}

export default Sidebar

