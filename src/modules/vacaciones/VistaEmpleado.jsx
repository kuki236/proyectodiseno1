import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import vacacionesService from '../../services/api/vacacionesService';
import './GestionVacaciones.css';

const VistaEmpleado = () => {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de filtro
  const [showFiltros, setShowFiltros] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  
  const filterRef = useRef(null);

  // --- OBTENER ID REAL DEL USUARIO LOGUEADO ---
  const obtenerIdUsuarioActual = () => {
    try {
      // 1. Buscamos el objeto 'user' en localStorage (ajusta la clave si usas otra, ej: 'auth')
      const userStr = localStorage.getItem('user'); 
      
      if (userStr) {
        const user = JSON.parse(userStr);
        // Retornamos el ID. Ajusta la propiedad según tu JSON (id, idEmpleado, id_empleado, etc.)
        return user.idEmpleado || user.id; 
      }
      return null;
    } catch (error) {
      console.error("Error al leer usuario del storage", error);
      return null;
    }
  };

  useEffect(() => {
    // 1. Obtenemos el ID dinámico
    const idEmpleado = obtenerIdUsuarioActual();

    if (idEmpleado) {
      cargarMisSolicitudes(idEmpleado);
    } else {
      // Si no hay usuario, redirigir al login
      console.warn("No se encontró usuario logueado");
      navigate('/login'); 
    }
    
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFiltros(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navigate]);

  const cargarMisSolicitudes = async (id) => {
    try {
      setLoading(true);
      // Usamos el ID real que pasamos como parámetro
      const data = await vacacionesService.obtenerMisSolicitudes(id);
      setSolicitudes(data || []);
    } catch (error) {
      console.error("Error al cargar mis solicitudes", error);
    } finally {
      setLoading(false);
    }
  };

  // --- RESTO DEL COMPONENTE IGUAL ---
  const solicitudesFiltradas = solicitudes.filter(solicitud => {
    const nombreTipo = solicitud.tipoSolicitud?.nombre || 'General';
    const coincideBusqueda = nombreTipo.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado ? solicitud.estado === filtroEstado : true;
    return coincideBusqueda && coincideEstado;
  });

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };
  
  const formatearHora = (fechaStr) => {
      if (!fechaStr) return '';
      return "8:00 a.m."; 
  };

  const irADetalle = (id) => {
    navigate(`/vacaciones/solicitud/${id}`); 
  };

  return (
    <div className="vacaciones-container">
      <div className="vacaciones-header">
        <h1>Gestión de vacaciones y permisos</h1>
        
        <div className="controls-bar">
          <button className="btn-nuevo" onClick={() => navigate('/vacaciones/nueva')}>
            Nuevo
          </button>

          <div className="search-filter-wrapper" ref={filterRef}>
            <div className="search-bar-integrated">
              <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input 
                type="text" 
                className="search-input"
                placeholder="Buscar por tipo (ej. Salud)..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <button 
                className={`btn-filter-trigger ${showFiltros ? 'active' : ''}`}
                onClick={() => setShowFiltros(!showFiltros)}
                title="Filtrar resultados"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
              </button>
            </div>

            {showFiltros && (
              <div className="filter-dropdown">
                <div className="filter-header">Filtros</div>
                <div className="filter-section">
                  <div className={`filter-option ${filtroEstado === 'PENDIENTE' ? 'selected' : ''}`} onClick={() => setFiltroEstado(filtroEstado === 'PENDIENTE' ? '' : 'PENDIENTE')}>Pendiente</div>
                  <div className={`filter-option ${filtroEstado === 'APROBADA' ? 'selected' : ''}`} onClick={() => setFiltroEstado(filtroEstado === 'APROBADA' ? '' : 'APROBADA')}>Aprobado</div>
                  <div className={`filter-option ${filtroEstado === 'RECHAZADA' ? 'selected' : ''}`} onClick={() => setFiltroEstado(filtroEstado === 'RECHAZADA' ? '' : 'RECHAZADA')}>Rechazado</div>
                </div>
              </div>
            )}
          </div>

          <div className="pagination-controls">
            <button className="btn-page">&lt;</button>
            <button className="btn-page">&gt;</button>
          </div>
        </div>
      </div>

      <div className="table-card">
        <table className="vacaciones-table">
          <thead>
            <tr>
              <th style={{width: '30%'}}>Tipo de Permiso</th>
              <th>Fecha de Inicio</th>
              <th>Fecha de Finalización</th>
              <th>Duración</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center p-4">Cargando mis solicitudes...</td></tr>
            ) : solicitudesFiltradas.length === 0 ? (
              <tr><td colSpan="5" className="text-center p-4 text-muted">No tienes solicitudes registradas.</td></tr>
            ) : (
              solicitudesFiltradas.map((solicitud) => (
                <tr key={solicitud.idSolicitud} onClick={() => irADetalle(solicitud.idSolicitud)} style={{cursor: 'pointer'}}>
                  <td>
                    <div style={{fontWeight: '500'}}>{solicitud.tipoSolicitud?.nombre || 'General'}</div>
                    <div className="text-muted small">{solicitud.motivo ? solicitud.motivo.substring(0, 30) + (solicitud.motivo.length > 30 ? '...' : '') : ''}</div>
                  </td>
                  <td>{formatearFecha(solicitud.fechaInicio)}, {formatearHora()}</td>
                  <td>{formatearFecha(solicitud.fechaFin)}, 5:00 p.m.</td>
                  <td>{solicitud.diasSolicitados} días</td>
                  <td>
                    <span className={`status-badge status-${solicitud.estado.toLowerCase()}`}>
                      {solicitud.estado.charAt(0) + solicitud.estado.slice(1).toLowerCase()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VistaEmpleado;