import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const NavMenu = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { path: '/posiciones', label: 'Posiciones Abiertas' },
    { path: '/candidatos', label: 'Lista de Candidatos' },
    { path: '/pipeline', label: 'Pipeline' },
    { path: '/entrevistas', label: 'Entrevistas' }
  ]

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  // Rutas del módulo de Reclutamiento y Selección (sin recepción de CVs)
  const rutasReclutamiento = [
    '/posiciones',
    '/candidatos',
    '/pipeline',
    '/entrevistas'
  ]

  // Verificar si la ruta actual pertenece al módulo de Reclutamiento
  const estaEnReclutamiento = rutasReclutamiento.some(ruta => 
    location.pathname === ruta || location.pathname.startsWith(ruta + '/')
  )

  // Ocultar menú en formularios, login, recepción de CVs o fuera del módulo de Reclutamiento
  const isFormularioPuesto = location.pathname.includes('/puesto/')
  const isLoginPage = location.pathname === '/login'
  const isRecepcionCV = location.pathname === '/recepcion-cv'

  if (!estaEnReclutamiento || isFormularioPuesto || isLoginPage || isRecepcionCV) {
    return null
  }

  return (
    <div className="nav-menu">
      {menuItems.map(item => (
        <button
          key={item.path}
          className={`nav-menu-btn ${isActive(item.path) ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export default NavMenu

