import React, { useState, useEffect, useRef } from 'react';
import vacacionesService from '../../services/api/vacacionesService';
import { useNotification } from '../../components/common/NotificationProvider';
import './RegistrarSolicitud.css'; // Reutilizamos estilos de autocompletado existentes

const AsignarSaldoVista = ({ onSuccess }) => {
  const { success, error } = useNotification();
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para Autocompletado
  const [busqueda, setBusqueda] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const wrapperRef = useRef(null);

  const [formData, setFormData] = useState({
    idEmpleado: '',
    anio: new Date().getFullYear(),
    diasAsignados: 30
  });

  useEffect(() => {
    // Cargar empleados al montar el componente
    vacacionesService.obtenerEmpleados().then(setEmpleados).catch(console.error);

    // Cerrar sugerencias al hacer clic fuera
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setMostrarSugerencias(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lógica de filtrado
  const handleBusquedaChange = (e) => {
    const texto = e.target.value;
    setBusqueda(texto);
    
    if (texto === '') {
      setFormData(prev => ({ ...prev, idEmpleado: '' }));
      setSugerencias([]);
      setMostrarSugerencias(false);
      return;
    }

    const coincidencias = empleados.filter(emp => {
      const nombreFull = emp.nombreCompleto || `${emp.nombres} ${emp.apellidoPaterno}`;
      return nombreFull.toLowerCase().includes(texto.toLowerCase());
    });
    
    setSugerencias(coincidencias);
    setMostrarSugerencias(true);
  };

  const seleccionarEmpleado = (emp) => {
    const nombre = emp.nombreCompleto || `${emp.nombres} ${emp.apellidoPaterno}`;
    setBusqueda(nombre);
    setFormData(prev => ({ ...prev, idEmpleado: emp.idEmpleado }));
    setMostrarSugerencias(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.idEmpleado) {
      error("Por favor selecciona un empleado válido de la lista");
      return;
    }

    try {
      setLoading(true);
      await vacacionesService.asignarSaldo(
        parseInt(formData.idEmpleado),
        parseInt(formData.anio),
        parseInt(formData.diasAsignados)
      );
      success("Saldo actualizado correctamente");
      
      // Limpiar formulario opcionalmente
      setBusqueda('');
      setFormData(prev => ({ ...prev, idEmpleado: '' }));
      
      if(onSuccess) onSuccess(); 
    } catch (err) {
      error("Error al asignar saldo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-card" style={{ marginTop: '20px', maxWidth: '800px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#111827' }}>
        Asignar Saldo Vacacional
      </h2>
      
      <form onSubmit={handleSubmit}>
        
        {/* BUSCADOR DE EMPLEADO */}
        <div className="form-group" style={{ marginBottom: '25px' }} ref={wrapperRef}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Empleado:</label>
          <div className="autocomplete-wrapper" style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input-underline"
              placeholder="Escribe el nombre del empleado..."
              value={busqueda}
              onChange={handleBusquedaChange}
              onFocus={() => busqueda && setMostrarSugerencias(true)}
              style={{ width: '100%', padding: '10px', border: 'none', borderBottom: '1px solid #ccc', outline: 'none' }}
            />
            
            {mostrarSugerencias && (
              <ul className="suggestions-list" style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                background: 'white', border: '1px solid #eee', borderRadius: '0 0 8px 8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: '200px', overflowY: 'auto',
                listStyle: 'none', padding: 0, margin: 0
              }}>
                {sugerencias.length > 0 ? (
                  sugerencias.map(emp => (
                    <li 
                      key={emp.idEmpleado} 
                      onClick={() => seleccionarEmpleado(emp)}
                      style={{ padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #f9fafb' }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                    >
                      {emp.nombreCompleto || emp.nombres}
                    </li>
                  ))
                ) : (
                  <li style={{ padding: '15px', color: '#999', textAlign: 'center' }}>No se encontraron empleados</li>
                )}
              </ul>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Año:</label>
            <input 
              type="number" 
              className="form-input-underline"
              value={formData.anio}
              onChange={e => setFormData({...formData, anio: e.target.value})}
              style={{ width: '100%', padding: '10px', border: 'none', borderBottom: '1px solid #ccc' }}
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Días a asignar:</label>
            <input 
              type="number" 
              className="form-input-underline"
              value={formData.diasAsignados}
              onChange={e => setFormData({...formData, diasAsignados: e.target.value})}
              style={{ width: '100%', padding: '10px', border: 'none', borderBottom: '1px solid #ccc' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            type="submit" 
            className="btn-confirm-success"
            disabled={loading}
            style={{ 
              backgroundColor: '#8ed232', color: 'white', border: 'none', 
              padding: '12px 30px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' 
            }}
          >
            {loading ? 'Guardando...' : 'Guardar Saldo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AsignarSaldoVista;