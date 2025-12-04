import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import vacacionesService from '../../services/api/vacacionesService';
import { useNotification } from '../../components/common/NotificationProvider'; // 1. Importar hook
import './DetalleSolicitud.css';
import './GestionVacaciones.css'; // Importamos para usar los estilos del modal

const DetalleSolicitudAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification(); // 2. Instanciar notificaciones
  
  const [solicitud, setSolicitud] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para el modal
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: null,
    texto: ''
  });
  const [errorValidacion, setErrorValidacion] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [dataSolicitud, dataHistorial] = await Promise.all([
        vacacionesService.obtenerSolicitudPorId(id),
        vacacionesService.obtenerHistorial(id)
      ]);
      setSolicitud(dataSolicitud);
      setHistorial(dataHistorial);
    } catch (error) {
      console.error("Error cargando detalle:", error);
      showError("No se pudo cargar la información de la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  // --- Lógica del Modal ---
  const abrirModal = (type) => {
    setModalConfig({ isOpen: true, type, texto: '' });
    setErrorValidacion(false);
  };

  const cerrarModal = () => {
    setModalConfig({ isOpen: false, type: null, texto: '' });
    setErrorValidacion(false);
  };

  const handleConfirmarAccion = async () => {
    const { type, texto } = modalConfig;

    try {
      if (type === 'RECHAZAR') {
        if (!texto.trim()) {
          setErrorValidacion(true);
          return;
        }
        await vacacionesService.rechazarSolicitud(id, texto);
        success("Solicitud rechazada correctamente"); // Mensaje de éxito
      } else if (type === 'APROBAR') {
        await vacacionesService.aprobarSolicitud(id, texto);
        success("Solicitud aprobada exitosamente"); // Mensaje de éxito
      }
      
      cerrarModal();
      cargarDatos(); 
    } catch (err) {
      // --- CORRECCIÓN AQUÍ ---
      // Capturamos el mensaje que viene del Backend (ej: "Saldo insuficiente")
      // apiClient suele devolver el error en err.data.message o err.message
      const mensajeError = err.data?.message || err.message || "No se pudo completar la acción";
      
      showError(mensajeError); // Usamos la notificación roja bonita
      cerrarModal(); 
    }
  };

  const handleVolverAprobacion = async () => {
    if(window.confirm("¿Regresar esta solicitud a estado Pendiente?")) {
      try {
        await vacacionesService.volverAPendiente(id);
        success("La solicitud ha retornado a estado Pendiente");
        cargarDatos();
      } catch (err) {
        const msg = err.data?.message || "No se pudo retornar la solicitud a pendiente";
        showError(msg);
      }
    }
  };

  const renderBotonesAccion = () => {
    const estado = solicitud?.estado;

    if (estado === 'RECHAZADA') {
      return (
        <button className="btn-action-yellow" onClick={handleVolverAprobacion}>
          Volver a la aprobación
        </button>
      );
    }

    if (estado === 'APROBADA') {
      return (
        <>
          <button className="btn-action-yellow" onClick={handleVolverAprobacion}>
            Volver a la aprobación
          </button>
          <button className="btn-action-outline-red" onClick={() => abrirModal('RECHAZAR')}>
            ✕ Rechazar
          </button>
        </>
      );
    }

    if (estado === 'PENDIENTE') {
      return (
        <>
          <button className="btn-action-green" onClick={() => abrirModal('APROBAR')}>
            
            Aprobar
          </button>
          <button className="btn-action-outline-red" onClick={() => abrirModal('RECHAZAR')}>
            <img 
                src="/images/multiplicar.png" 
                alt="Rechazar" 
                className="action-icon" 
            />
            Rechazar
          </button>
        </>
      );
    }
  };

  // ... (Funciones de formateo de fecha iguales que antes) ...
  const formatearFecha = (fechaStr) => { /* ... */ 
    if (!fechaStr) return '';
    const date = new Date(fechaStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const formatearHora = (fechaIso) => { /* ... */ 
    if (!fechaIso) return '';
    const date = new Date(fechaIso);
    return date.toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  if (loading) return <div className="loading-container">Cargando detalle...</div>;
  if (!solicitud) return <div className="error-container">No se encontró la solicitud</div>;

  return (
    <div className="detalle-view-container">
      <h2 className="page-title">Ver solicitud</h2>

      <div className="detalle-grid">
        {/* ... (Paneles de Info e Historial sin cambios) ... */}
        <div className="info-card">
          <div className="info-row">
            <span className="info-label">Empleado</span>
            <span className="info-value font-bold">{solicitud.empleado?.nombres} {solicitud.empleado?.apellidoPaterno} {solicitud.empleado?.apellidoMaterno || ''}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Area</span>
            <span className="info-value">{solicitud.empleado?.area || 'No especificado'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Cargo</span>
            <span className="info-value">{solicitud.empleado?.puesto || 'No especificado'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Tipo de permiso</span>
            <span className="info-value">{solicitud.tipoSolicitud?.nombre || 'Vacaciones'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Fechas</span>
            <div className="info-value">
              {formatearFecha(solicitud.fechaInicio)} → {formatearFecha(solicitud.fechaFin)}
              <span className="days-badge">({solicitud.diasSolicitados} Días)</span>
            </div>
          </div>
          <div className="info-row">
            <span className="info-label">Estado</span>
            <span className={`status-tag tag-${solicitud.estado.toLowerCase()}`}>
              {solicitud.estado.charAt(0) + solicitud.estado.slice(1).toLowerCase()}
            </span>
          </div>
        </div>

        <div className="history-card">
          <h3 className="history-title">Historial de cambios</h3>
          <div className="timeline-container">
            {historial.map((item, index) => (
              <div key={item.idHistorial || index} className="timeline-wrapper">
                <div className="timeline-date-separator">
                  <span>------ {formatearFecha(item.fechaAccion)} ------</span>
                </div>
                <div className="timeline-item">
                  <div className="timeline-header">
                    <span className="timeline-user">{item.usuarioAccion?.nombreCompleto || 'Usuario Sistema'}</span>
                    <span className="timeline-time">{formatearHora(item.fechaAccion)}</span>
                  </div>
                  <div className="timeline-content">
                    {item.estado === 'PENDIENTE' && item.comentarios?.includes('Retornado') 
                      ? 'Estado cambiado a: Pendiente' 
                      : `Estado cambiado a: ${item.estado}`}
                  </div>
                  {item.comentarios && (
                    <div className="timeline-comment">{item.comentarios}</div>
                  )}
                </div>
              </div>
            ))}
            {/* Evento inicial */}
            <div className="timeline-wrapper">
              <div className="timeline-date-separator">
                <span>------ {formatearFecha(solicitud.fechaSolicitud || solicitud.fechaCreacion)} ------</span>
              </div>
              <div className="timeline-item">
                <div className="timeline-header">
                  <span className="timeline-user">{solicitud.empleado?.nombres}</span>
                  <span className="timeline-time">{formatearHora(solicitud.fechaCreacion)}</span>
                </div>
                <div className="timeline-content">Creó la solicitud</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="actions-footer">
        <div className="left-actions">
          {renderBotonesAccion()}
        </div>
        <button className="btn-volver-outline" onClick={() => navigate(-1)}>Volver</button>
      </div>

      {/* ---- MODAL REUTILIZADO ---- */}
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

export default DetalleSolicitudAdmin;