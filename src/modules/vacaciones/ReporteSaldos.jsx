import React, { useState, useEffect } from 'react';
import vacacionesService from '../../services/api/vacacionesService';
import * as XLSX from 'xlsx'; // 1. Importamos la librería
import './GestionVacaciones.css';

const ReporteSaldos = () => {
  const [reporte, setReporte] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroArea, setFiltroArea] = useState('');

  useEffect(() => {
    cargarReporte();
  }, []);

  const cargarReporte = async () => {
    try {
      const data = await vacacionesService.obtenerReporteSaldos();
      setReporte(data || []);
    } catch (error) {
      console.error("Error cargando reporte", error);
    } finally {
      setLoading(false);
    }
  };

  const areasDisponibles = [...new Set(reporte.map(item => item.departamento || 'General'))].sort();

  const reporteFiltrado = reporte.filter(item => {
    if (!filtroArea) return true;
    return (item.departamento || 'General') === filtroArea;
  });

  const reporteAgrupado = reporteFiltrado.reduce((acc, item) => {
    const grupo = item.departamento || 'General';
    if (!acc[grupo]) acc[grupo] = [];
    acc[grupo].push(item);
    return acc;
  }, {});

  const departamentosAVisualizar = Object.keys(reporteAgrupado).sort();

  // --- 2. FUNCIÓN PARA EXPORTAR ---
  const handleExportarExcel = () => {
    // A. Preparamos los datos tal como queremos que se vean en el Excel
    const datosParaExcel = reporteFiltrado.map(item => ({
      "ID Empleado": item.idEmpleado,
      "Nombre Completo": item.nombreCompleto,
      "Departamento": item.departamento || 'General',
      "Sub-Área": item.area || '-',
      "Días Totales": item.diasTotales,
      "Días Gozados": item.diasGozados,
      "Saldo Pendiente": item.diasPendientes,
      "Estado": item.diasPendientes > 0 ? 'Disponible' : (item.diasPendientes === 0 ? 'Agotado' : 'Excedido')
    }));

    // B. Creamos una hoja de trabajo (Worksheet)
    const worksheet = XLSX.utils.json_to_sheet(datosParaExcel);

    // C. Ajustamos el ancho de las columnas (Opcional, para que se vea bonito)
    const wscols = [
      { wch: 10 }, // ID
      { wch: 30 }, // Nombre
      { wch: 20 }, // Depto
      { wch: 20 }, // Area
      { wch: 12 }, // Totales
      { wch: 12 }, // Gozados
      { wch: 15 }, // Pendiente
      { wch: 15 }  // Estado
    ];
    worksheet['!cols'] = wscols;

    // D. Creamos el libro (Workbook) y añadimos la hoja
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Saldos Vacaciones");

    // E. Generamos el archivo y forzamos la descarga
    XLSX.writeFile(workbook, `Reporte_Saldos_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  if (loading) return <div className="text-center p-4">Calculando saldos...</div>;
  
  return (
    <div className="reporte-container">
      
      {/* BARRA DE HERRAMIENTAS */}
      <div className="filter-bar mb-4" style={{
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', // Separar filtro y botón
        padding: '20px 0',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '20px'
      }}>
        
        {/* FILTRO IZQUIERDA */}
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          <label style={{fontWeight: '600', color: '#374151'}}>Filtrar por Área:</label>
          <select 
            value={filtroArea} 
            onChange={(e) => setFiltroArea(e.target.value)}
            className="form-select-underline"
            style={{maxWidth: '250px', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db'}}
          >
            <option value="">Todas las áreas</option>
            {areasDisponibles.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

        {/* 3. BOTÓN DE EXPORTAR DERECHA */}
        <button 
          onClick={handleExportarExcel}
          disabled={reporteFiltrado.length === 0}
          style={{
            backgroundColor: '#166534', // Verde Excel
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: reporteFiltrado.length === 0 ? 0.5 : 1
          }}
        >
          {/* Icono simple de descarga */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Exportar a Excel
        </button>

      </div>

      {reporte.length === 0 ? (
        <div className="text-center p-4">No hay datos de saldos disponibles.</div>
      ) : (
        departamentosAVisualizar.map((depto) => (
          <div key={depto} className="area-section">
            <h3 className="area-title">
              <span className="area-indicator"></span>
              {depto}
              <span className="area-count">({reporteAgrupado[depto].length} empleados)</span>
            </h3>

            <div className="table-card mb-4">
              <table className="vacaciones-table">
                <thead>
                  <tr>
                    <th style={{width: '30%'}}>Empleado</th>
                    <th style={{width: '20%'}}>Sub-Área</th>
                    <th className="text-center">Días Totales</th>
                    <th className="text-center">Días Gozados</th>
                    <th className="text-center">Días Pendientes</th>
                    <th className="text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteAgrupado[depto].map((item, index) => (
                    <tr key={index}>
                      <td><div style={{fontWeight: '500'}}>{item.nombreCompleto}</div></td>
                      <td className="text-muted small">{item.area || '-'}</td>
                      <td className="text-center">{item.diasTotales}</td>
                      <td className="text-center">{item.diasGozados}</td>
                      <td className="text-center">
                        <span style={{
                          fontWeight: 'bold', 
                          color: item.diasPendientes < 0 ? '#dc2626' : (item.diasPendientes > 5 ? '#166534' : '#d97706')
                        }}>
                          {item.diasPendientes < 0 
                            ? `${Math.abs(item.diasPendientes)} (Deuda)` 
                            : item.diasPendientes}
                        </span>
                      </td>
                      <td className="text-center">
                        {item.diasPendientes > 0 ? (
                          <span className="status-badge status-aprobada">Disponible</span>
                        ) : item.diasPendientes === 0 ? (
                          <span className="status-badge status-rechazada" style={{backgroundColor: '#e5e7eb', color: '#374151'}}>Agotado</span>
                        ) : (
                          <span className="status-badge status-rechazada" style={{backgroundColor: '#fee2e2', color: '#991b1b'}}>Excedido</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ReporteSaldos;