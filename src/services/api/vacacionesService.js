import apiClient from './client';

class VacacionesService {
  
  /**
   * Obtener todas las solicitudes (Vista Admin)
   */
  async obtenerTodasLasSolicitudes() {
    try {
      const data = await apiClient.get('/vacaciones/admin/todas');
      return data;
    } catch (error) {
      console.error('Error al obtener solicitudes:', error);
      throw error;
    }
  }

  /**
   * Aprobar solicitud
   */
  async aprobarSolicitud(id, comentarios = '') {
    return await apiClient.patch(`/vacaciones/admin/solicitud/${id}/aprobar`, { comentarios });
  }

  /**
   * Rechazar solicitud
   */
  async rechazarSolicitud(id, motivo) {
    return await apiClient.patch(`/vacaciones/admin/solicitud/${id}/rechazar`, { motivo });
  }

  async obtenerSolicitudPorId(id) {
    // Asumiendo que existe este endpoint o uno similar en tu controller
    // Si no, tendremos que filtrar de obtenerTodasLasSolicitudes() temporalmente.
    return await apiClient.get(`/vacaciones/solicitud/${id}`); 
  }

  /**
   * Obtener historial de una solicitud
   */
  async obtenerHistorial(id) {
    return await apiClient.get(`/vacaciones/solicitud/${id}/historial`);
  }

  /**
   * Volver estado a PENDIENTE (Volver a aprobación)
   */
  async volverAPendiente(id) {
    return await apiClient.patch(`/vacaciones/admin/solicitud/${id}/pendiente`);
  }

  /* Obtener lista de empleados para el selector */
  async obtenerEmpleados() {
    
    return await apiClient.get('/empleados'); 
  }

  /**
   * Obtener tipos de solicitud (Vacaciones, Permiso, etc.)
   */
  async obtenerTiposSolicitud() {
    // Endpoint asumido.
    return await apiClient.get('/vacaciones/tipos');
  }

  /**
   * Crear una nueva solicitud
   */
  async crearSolicitud(solicitudDTO) {
    return await apiClient.post('/vacaciones/solicitar', solicitudDTO);
  }

  /**
   * Obtener reporte de saldos de vacaciones
   */
  async obtenerReporteSaldos() {
    return await apiClient.get('/vacaciones/admin/reportes/saldos');
  }

  async asignarSaldo(idEmpleado, anio, dias) {
    return await apiClient.post('/vacaciones/admin/saldos/asignar', {
      idEmpleado,
      anio,
      diasAsignados: dias
    });
  }
}

export default new VacacionesService();