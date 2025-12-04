package com.rrhh.incentivos.service;

import com.rrhh.incentivos.dto.*;
import java.util.List;

public interface IIncentivoService {
    
    List<BonoResumenDTO> obtenerBonosPorEmpleado(Integer idEmpleado);
    DetalleEvidenciaDTO obtenerDetalleBono(Integer idBono);

    DashboardAdminDTO obtenerDatosDashboard(String periodo);

    List<ReglaAdminDTO> listarReglasPorCategoria(String categoria);
    void crearNuevaRegla(ReglaCreateDTO dto);
    void cambiarEstadoRegla(Integer idRegla, boolean nuevoEstado);
    void eliminarRegla(Integer idRegla);

    ResumenMetasDTO obtenerResumenMetas(String departamento, String periodo);
    void asignarMetaEmpleado(MetaAsignacionDTO dto);

    PantallaAprobacionDTO obtenerDataAprobaciones(String periodo);
    void aprobarBono(Integer idBono);
    void rechazarBono(Integer idBono);
    void aprobarMasivo(List<Integer> idsBonos);
    ReporteIncentivosDTO generarReporteAnual(String anio);
    DashboardEmpleadoDTO obtenerDashboardEmpleado(Integer idEmpleado, String periodo);
    List<BonoDetalleNominaDTO> obtenerDetalleNominaPorPeriodo(String periodo); 

}