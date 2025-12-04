import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import vacacionesService from '../../services/api/vacacionesService';
import { useNotification } from '../../components/common/NotificationProvider';
import './RegistrarSolicitud.css';

const RegistrarSolicitudAdmin = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();

  // Datos maestros
  const [empleados, setEmpleados] = useState([]);
  const [tiposSolicitud, setTiposSolicitud] = useState([]);
  
  // Estados para el Autocompletado
  const [busquedaEmpleado, setBusquedaEmpleado] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const wrapperRef = useRef(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    idEmpleado: '',
    area: '', 
    cargo: '', 
    idTipoSolicitud: '',
    fechaInicio: '',
    fechaFin: '',
    motivo: ''
  });

  const [diasCalculados, setDiasCalculados] = useState(0);
  const [loading, setLoading] = useState(false);

  // Cargar listas al inicio (CON DATOS REALES)
  useEffect(() => {
    const cargarMaestros = async () => {
      try {
        // 1. Obtener empleados reales de la API
        const dataEmpleados = await vacacionesService.obtenerEmpleados();
        setEmpleados(dataEmpleados || []);

        // 2. Tipos de solicitud (Si aún no tienes API para esto, mantengo el mock temporalmente)
        // const dataTipos = await vacacionesService.obtenerTiposSolicitud();
        const tiposMock = [
          { idTipoSolicitud: 1, nombre: 'Vacaciones' },
          { idTipoSolicitud: 2, nombre: 'Permiso por salud' },
          { idTipoSolicitud: 3, nombre: 'Tiempo personal' }
        ];
        
        setTiposSolicitud(tiposMock);
      } catch (err) {
        console.error("Error cargando datos maestros", err);
        showError("Error al cargar la lista de empleados");
      }
    };
    cargarMaestros();

    // Event listener para cerrar sugerencias al hacer click fuera
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setMostrarSugerencias(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showError]);

  // Lógica de filtrado al escribir (AUTOCOMPLETADO)
  const handleBusquedaChange = (e) => {
    const texto = e.target.value;
    setBusquedaEmpleado(texto);
    
    // Si borra el texto, limpiamos la selección previa
    if (texto === '') {
      setFormData(prev => ({ ...prev, idEmpleado: '', area: '', cargo: '' }));
      setSugerencias([]);
      setMostrarSugerencias(false);
      return;
    }

    // Filtrar usando 'nombreCompleto' que viene de tu API
    // Si nombreCompleto es null, usamos fallback a nombres + apellidos
    const coincidencias = empleados.filter(emp => {
      const nombreFull = emp.nombreCompleto || 
        `${emp.nombres} ${emp.apellidoPaterno} ${emp.apellidoMaterno || ''}`;
      return nombreFull.toLowerCase().includes(texto.toLowerCase());
    });
    
    setSugerencias(coincidencias);
    setMostrarSugerencias(true);
  };

  // Seleccionar empleado de la lista
  const seleccionarEmpleado = (empleado) => {
    // Usamos los campos exactos de tu JSON
    const nombreMostrar = empleado.nombreCompleto || 
      `${empleado.nombres} ${empleado.apellidoPaterno} ${empleado.apellidoMaterno || ''}`.trim();
    
    setBusquedaEmpleado(nombreMostrar);
    setFormData(prev => ({
      ...prev,
      idEmpleado: empleado.idEmpleado,
      // Usamos || '' porque tu API devuelve null actualmente para estos campos
      area: empleado.area || '', 
      cargo: empleado.puesto || '' 
    }));
    setMostrarSugerencias(false);
  };

  // Calculo de días
  useEffect(() => {
    if (formData.fechaInicio && formData.fechaFin) {
      const inicio = new Date(formData.fechaInicio);
      const fin = new Date(formData.fechaFin);
      if (fin >= inicio) {
        const diffTime = Math.abs(fin - inicio);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setDiasCalculados(diffDays);
      } else {
        setDiasCalculados(0);
      }
    } else {
      setDiasCalculados(0);
    }
  }, [formData.fechaInicio, formData.fechaFin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLimpiar = () => {
    setFormData({
      idEmpleado: '', area: '', cargo: '', idTipoSolicitud: '',
      fechaInicio: '', fechaFin: '', motivo: ''
    });
    setBusquedaEmpleado('');
    setDiasCalculados(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.idEmpleado || !formData.idTipoSolicitud || !formData.fechaInicio || !formData.fechaFin) {
      showError("Por favor completa los campos obligatorios");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        idEmpleado: parseInt(formData.idEmpleado),
        idTipoSolicitud: parseInt(formData.idTipoSolicitud),
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        motivo: formData.motivo
      };

      await vacacionesService.crearSolicitud(payload);
      success("Solicitud registrada correctamente");
      navigate('/vacaciones-permisos');
    } catch (err) {
      showError("Error al registrar la solicitud");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-container">
      <h2 className="registro-title">Registrar Solicitud</h2>

      <div className="registro-card">
        <form onSubmit={handleSubmit}>
          
          {/* Fila 1: Empleado con Autocompletado */}
          <div className="form-row full-width">
            <div className="form-group" ref={wrapperRef}>
              <label>Empleado</label>
              <div className="autocomplete-wrapper">
                <input
                  type="text"
                  placeholder="Escribe el nombre del empleado..."
                  value={busquedaEmpleado}
                  onChange={handleBusquedaChange}
                  onFocus={() => busquedaEmpleado && setMostrarSugerencias(true)}
                  className="form-input-underline"
                  autoComplete="off"
                />
                
                {/* Lista de Sugerencias Flotante */}
                {mostrarSugerencias && (
                  <ul className="suggestions-list">
                    {sugerencias.length > 0 ? (
                      sugerencias.map(emp => (
                        <li 
                          key={emp.idEmpleado} 
                          onClick={() => seleccionarEmpleado(emp)}
                          className="suggestion-item"
                        >
                          <span className="suggestion-name">
                            {emp.nombreCompleto || `${emp.nombres} ${emp.apellidoPaterno} ${emp.apellidoMaterno || ''}`}
                          </span>
                          {/* Mostramos info adicional aunque sea null en tu JSON actual (se verá guion si no hay datos) */}
                          <span className="suggestion-meta">
                            {(emp.area || '-') + ' - ' + (emp.puesto || '-')}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="suggestion-item no-results">No se encontraron empleados</li>
                    )}
                  </ul>
                )}
                
                <div className="input-icon-right">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Fila 2: Área y Cargo (Readonly) */}
          <div className="form-row two-cols">
            <div className="form-group">
              <label>Area</label>
              <input 
                type="text" 
                value={formData.area} 
                className="form-input-underline readonly" 
                placeholder="El área se carga automáticamente" 
                readOnly 
              />
            </div>
            <div className="form-group">
              <label>Cargo</label>
              <input 
                type="text" 
                value={formData.cargo} 
                className="form-input-underline readonly" 
                placeholder="El cargo se carga automáticamente" 
                readOnly 
              />
            </div>
          </div>

          {/* Resto del formulario (Tipo de permiso, Fechas, Motivo, Botones) */}
          <div className="form-row full-width">
            <div className="form-group">
              <label>Tipo de permiso</label>
              <select 
                name="idTipoSolicitud" 
                value={formData.idTipoSolicitud} 
                onChange={handleChange}
                className="form-select-underline"
              >
                <option value="">Seleccione el tipo</option>
                {tiposSolicitud.map(t => (
                  <option key={t.idTipoSolicitud} value={t.idTipoSolicitud}>{t.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row three-cols-date">
            <div className="form-group">
              <label>Desde</label>
              <input type="date" name="fechaInicio" value={formData.fechaInicio} onChange={handleChange} className="form-input-underline" />
            </div>
            <div className="form-group">
              <label>Hasta</label>
              <input type="date" name="fechaFin" value={formData.fechaFin} onChange={handleChange} className="form-input-underline" />
            </div>
            <div className="form-group center-vertical">
              <span className="days-label">({diasCalculados} días)</span>
            </div>
          </div>

          <div className="form-row full-width">
            <div className="form-group">
              <label>Motivo</label>
              <textarea name="motivo" value={formData.motivo} onChange={handleChange} className="form-textarea-box" rows="4"></textarea>
            </div>
          </div>

          <div className="form-actions-footer">
            <button type="submit" className="btn-submit-yellow" disabled={loading}>{loading ? 'Enviando...' : 'Enviar Solicitud'}</button>
            <div className="right-buttons">
              <button type="button" className="btn-outline-gray" onClick={handleLimpiar}>Limpiar solicitud</button>
              <button type="button" className="btn-outline-red" onClick={() => navigate(-1)}>Volver</button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default RegistrarSolicitudAdmin;