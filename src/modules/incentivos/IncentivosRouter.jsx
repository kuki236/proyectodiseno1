import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import authService from '../../services/api/authService'

const IncentivosRouter = () => {
  const user = authService.getCurrentUser()
  const location = useLocation()

  // 1. Si no hay usuario, mandar al login
  if (!user) {
    return <Navigate to="/login" replace />
  }


  const isBasePath = location.pathname === '/incentivos-reconocimientos' || location.pathname === '/incentivos-reconocimientos/';

  if (isBasePath) {
    if (user.tipoUsuario === 'ADMINISTRADOR') {
      return <Navigate to="admin/dashboard" replace />
    }
    return <Navigate to="empleado/dashboard" replace />
  }

  return <Outlet />
}

export default IncentivosRouter