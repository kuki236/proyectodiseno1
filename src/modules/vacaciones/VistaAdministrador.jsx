import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import vacacionesService from '../../services/api/vacacionesService';
import { useNotification } from '../../components/common/NotificationProvider';
import ReporteSaldos from './ReporteSaldos';
// Importamos el componente de vista que creamos en el paso anterior
import AsignarSaldoVista from './ModalAsignarSaldo'; 
import './GestionVacaciones.css';

const VistaAdministrador = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();

  // Estado para controlar la vista activa: 'gestion' | 'reportes' | 'asignar-saldo'
  const [vistaActiva, setVistaActiva] = useState('gestion');

  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- Estados de Modales de Acción (Aprobar/Rechazar) ---
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: null, // 'APROBAR' o 'RECHAZAR'
    idSolicitud: null,
    texto: '' // Motivo o Comentario
  });
  const [errorValidacion, setErrorValidacion] = useState(false);

  // --- Estados de Interfaz y Filtros ---
  const [showFiltros, setShowFiltros] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear().toString());
  
  const filterRef = useRef(null);

  // Estado para forzar la recarga del reporte al guardar saldo (opcional)
  const [refreshKey, setRefreshKey] = useState(0);

  // Cargar solicitudes SOLO si estamos en la vista de gestión
  useEffect(() => {
    if (vistaActiva === 'gestion') {
      cargarSolicitudes();
    }
  }, [vistaActiva]);
  
  useEffect(() => {
    // Event listener para cerrar filtros al hacer clic fuera
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFiltros(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      const data = await vacacionesService.obtenerTodasLasSolicitudes();
      setSolicitudes(data || []);
    } catch (error) {
      console.error("Error al cargar solicitudes", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Lógica de Filtrado ---
  const solicitudesFiltradas = solicitudes.filter(solicitud => {
    const nombreCompleto = `${solicitud.empleado?.nombres} ${solicitud.empleado?.apellidoPaterno}`.toLowerCase();
    const coincideNombre = nombreCompleto.includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado ? solicitud.estado === filtroEstado : true;
    let coincideFecha = true;
    if (solicitud.fechaInicio) {
      const fecha = new Date(solicitud.fechaInicio);
      const mesSolicitud = (fecha.getMonth() + 1).toString();
      const anioSolicitud = fecha.getFullYear().toString();
      if (filtroMes && mesSolicitud !== filtroMes) coincideFecha = false;
      if (filtroAnio && anioSolicitud !== filtroAnio) coincideFecha = false;
    }
    return coincideNombre && coincideEstado && coincideFecha;
  });

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const irADetalle = (id) => {
    navigate(`/vacaciones/solicitud/${id}`);
  };

  // --- Manejo de Modales de Acción ---
  const abrirModal = (e, type, id) => {
    e.stopPropagation();
    setModalConfig({ isOpen: true, type, idSolicitud: id, texto: '' });
    setErrorValidacion(false);
  };

  const cerrarModal = () => {
    setModalConfig({ isOpen: false, type: null, idSolicitud: null, texto: '' });
    setErrorValidacion(false);
  };

  const handleConfirmarAccion = async () => {
    const { type, idSolicitud, texto } = modalConfig;

    try {
      if (type === 'RECHAZAR') {
        if (!texto.trim()) { setErrorValidacion(true); return; }
        await vacacionesService.rechazarSolicitud(idSolicitud, texto);
        success("Solicitud rechazada");
      } else if (type === 'APROBAR') {
        await vacacionesService.aprobarSolicitud(idSolicitud, texto);
        success("Solicitud aprobada");
      }
      
      cerrarModal();
      cargarSolicitudes(); 
    } catch (err) {
      const msg = err.data?.message || err.message || "Error al procesar la acción";
      showError(msg);
      cerrarModal();
    }
  };

  const handleNuevo = () => navigate('/vacaciones/nueva');
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 3, currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="vacaciones-container">
      <div className="vacaciones-header">
        <h1>Gestión de vacaciones y permisos</h1>
        
        {/* --- NAVEGACIÓN SUPERIOR (PESTAÑAS) --- */}
        <div className="nav-tabs">
          <button 
            className={`nav-tab-btn ${vistaActiva === 'gestion' ? 'active' : ''}`}
            onClick={() => setVistaActiva('gestion')}
          >
            Gestión de Solicitudes
          </button>
          <button 
            className={`nav-tab-btn ${vistaActiva === 'reportes' ? 'active' : ''}`}
            onClick={() => setVistaActiva('reportes')}
          >
            Reportes
          </button>
          <button 
            className={`nav-tab-btn ${vistaActiva === 'asignar-saldo' ? 'active' : ''}`}
            onClick={() => setVistaActiva('asignar-saldo')}
          >
            Asignar Saldo
          </button>
        </div>
      </div>

      {/* --- VISTA: GESTIÓN DE SOLICITUDES --- */}
      {vistaActiva === 'gestion' && (
        <>
          <div className="controls-bar">
            <button className="btn-nuevo" onClick={handleNuevo}>+ Nuevo</button>

            <div className="search-filter-wrapper" ref={filterRef}>
              <div className="search-bar-integrated">
                <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input 
                  type="text" 
                  className="search-input"
                  placeholder="Buscar por empleado..." 
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

              {/* Dropdown de Filtros */}
              {showFiltros && (
                <div className="filter-dropdown">
                  <div className="filter-header">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px'}}>
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg> Filtros
                  </div>
                  <div className="filter-section">
                    <div className={`filter-option ${filtroEstado === 'PENDIENTE' ? 'selected' : ''}`} onClick={() => setFiltroEstado(filtroEstado === 'PENDIENTE' ? '' : 'PENDIENTE')}>Pendiente</div>
                    <div className={`filter-option ${filtroEstado === 'APROBADA' ? 'selected' : ''}`} onClick={() => setFiltroEstado(filtroEstado === 'APROBADA' ? '' : 'APROBADA')}>Aprobado</div>
                    <div className={`filter-option ${filtroEstado === 'RECHAZADA' ? 'selected' : ''}`} onClick={() => setFiltroEstado(filtroEstado === 'RECHAZADA' ? '' : 'RECHAZADA')}>Rechazado</div>
                  </div>
                  <div className="filter-separator"></div>
                  <div className="filter-section">
                    <label className="filter-label">Fecha de inicio</label>
                    <div className="date-selectors">
                      <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} className="mini-select">
                        <option value="">Mes: Todos</option>
                        <option value="1">Enero</option>
                        <option value="12">Diciembre</option>
                      </select>
                      <select value={filtroAnio} onChange={(e) => setFiltroAnio(e.target.value)} className="mini-select">
                        {years.map(y => (<option key={y} value={y}>{y}</option>))}
                      </select>
                    </div>
                  </div>
                  {(filtroEstado || filtroMes || busqueda) && (
                    <div className="filter-footer">
                      <button className="btn-clear" onClick={() => { setFiltroEstado(''); setFiltroMes(''); setBusqueda(''); }}>Limpiar filtros</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pagination-controls">
              <button className="btn-page">&lt;</button>
              <button className="btn-page">&gt;</button>
            </div>
          </div>

          <div className="table-card">
            <table className="vacaciones-table">
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Tipo de Permiso</th>
                  <th>Fecha de Inicio</th>
                  <th>Fecha de Finalización</th>
                  <th>Duración</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center p-4">Cargando solicitudes...</td></tr>
                ) : solicitudesFiltradas.length === 0 ? (
                  <tr><td colSpan="7" className="text-center p-4 text-muted">No se encontraron solicitudes.</td></tr>
                ) : (
                  solicitudesFiltradas.map((solicitud) => (
                    <tr key={solicitud.idSolicitud} onClick={() => irADetalle(solicitud.idSolicitud)} style={{cursor: 'pointer'}}>
                      <td>
                        <div style={{fontWeight: '500'}}>
                          {solicitud.empleado?.nombres} {solicitud.empleado?.apellidoPaterno} {solicitud.empleado?.apellidoMaterno || ''}
                        </div>
                      </td>
                      <td>{solicitud.tipoSolicitud?.nombre || 'General'}</td>
                      <td>{formatearFecha(solicitud.fechaInicio)}</td>
                      <td>{formatearFecha(solicitud.fechaFin)}</td>
                      <td>{solicitud.diasSolicitados} días</td>
                      <td>
                        <span className={`status-badge status-${solicitud.estado.toLowerCase()}`}>
                          {solicitud.estado.charAt(0) + solicitud.estado.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td>
                        {solicitud.estado === 'PENDIENTE' ? (
                          <div className="action-buttons">
                            <button 
                              className="btn-action approve" 
                              onClick={(e) => abrirModal(e, 'APROBAR', solicitud.idSolicitud)}
                            >
                              <img src="/images/cheque.png" alt="Aprobar" className="action-icon" />
                              Aprobar
                            </button>
                            <button 
                              className="btn-action reject" 
                              onClick={(e) => abrirModal(e, 'RECHAZAR', solicitud.idSolicitud)}
                            >
                              <img src="/images/multiplicar.png" alt="Rechazar" className="action-icon" />
                              Rechazar
                            </button>
                          </div>
                        ) : <span className="text-muted small">Procesado</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* --- VISTA: REPORTES --- */}
      {vistaActiva === 'reportes' && (
        <div className="reportes-view">
          <div className="controls-bar" style={{ marginBottom: '20px', alignItems: 'center' }}>
            <div>
              <h2 className="section-subtitle">Reporte de Saldos Vacacionales</h2>
              <p className="section-desc">Resumen del estado de vacaciones por empleado.</p>
            </div>
          </div>
          <ReporteSaldos key={refreshKey} />
        </div>
      )}

      {/* --- VISTA: ASIGNAR SALDO (NUEVA PESTAÑA) --- */}
      {vistaActiva === 'asignar-saldo' && (
        <div className="asignar-saldo-view" style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
          <AsignarSaldoVista 
            onSuccess={() => {
              success("Saldo asignado correctamente");
              setRefreshKey(prev => prev + 1); // Para que si volvemos a reportes, esté actualizado
            }} 
          />
        </div>
      )}

      {/* --- MODAL DE APROBAR/RECHAZAR --- */}
      {modalConfig.isOpen && (
        <div className="vacaciones-modal-overlay" onClick={cerrarModal}>
          <div className="vacaciones-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              {modalConfig.type === 'APROBAR' ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
            </h3>
            
            <p className="modal-description">
              {modalConfig.type === 'APROBAR' 
                ? 'Puedes añadir un comentario opcional para el empleado.' 
                : 'Por favor, indica el motivo del rechazo. Esta información será enviada al empleado.'}
            </p>

            <textarea
              className={`modal-textarea ${errorValidacion ? 'error' : ''}`}
              placeholder={modalConfig.type === 'APROBAR' ? 'Comentarios (Opcional)' : 'Motivo del rechazo (Obligatorio)'}
              value={modalConfig.texto}
              onChange={(e) => {
                setModalConfig({...modalConfig, texto: e.target.value});
                if(e.target.value.trim()) setErrorValidacion(false);
              }}
            />
            {errorValidacion && <span className="error-text">El motivo es obligatorio para rechazar.</span>}

            <div className="modal-actions">
              <button className="btn-cancel" onClick={cerrarModal}>Cancelar</button>
              <button 
                className={modalConfig.type === 'APROBAR' ? 'btn-confirm-success' : 'btn-confirm-danger'} 
                onClick={handleConfirmarAccion}
              >
                {modalConfig.type === 'APROBAR' ? 'Confirmar Aprobación' : 'Confirmar Rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VistaAdministrador;