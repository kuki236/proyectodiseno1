import axios from 'axios';

const API_URL = 'http://localhost:8080/api/incentivos/admin';

export const getCategoriaByTab = (tabValue) => {
    return tabValue === 0 ? 'VENTAS' : 'ATENCION';
};

export const incentivoService = {
    // --- REGLAS ---
    listarReglas: async (categoria) => {
        const response = await axios.get(`${API_URL}/reglas/${categoria}`);
        return response.data;
    },

    crearRegla: async (reglaDTO) => {
        return await axios.post(`${API_URL}/reglas`, reglaDTO);
    },

    cambiarEstadoRegla: async (idRegla, nuevoEstado) => {
        return await axios.patch(`${API_URL}/reglas/${idRegla}/estado`, nuevoEstado, {
            headers: { 'Content-Type': 'application/json' }
        });
    },

    eliminarRegla: async (idRegla) => {
        return await axios.delete(`${API_URL}/reglas/${idRegla}`);
    },

    // --- METAS ---
    obtenerResumenMetas: async (departamento, periodo) => {
        const response = await axios.get(`${API_URL}/metas/resumen`, {
            params: { departamento, periodo }
        });
        return response.data;
    },

    asignarMeta: async (asignacionDTO) => {
        return await axios.post(`${API_URL}/metas/asignar`, asignacionDTO);
    },
    
    // --- APROBACIONES ---
    obtenerDataAprobaciones: async (periodo) => {
        const response = await axios.get(`${API_URL}/aprobaciones`, {
            params: { periodo }
        });
        return response.data;
    },

    aprobarBono: async (idBono) => {
        return await axios.post(`${API_URL}/bonos/${idBono}/aprobar`);
    },

    rechazarBono: async (idBono) => {
        return await axios.post(`${API_URL}/bonos/${idBono}/rechazar`);
    },

    aprobarMasivo: async (idsBonos) => {
        return await axios.post(`${API_URL}/bonos/aprobar-masivo`, idsBonos);
    },

    // --- REPORTES ---
    generarReporteAnual: async (anio) => {
        const response = await axios.get(`${API_URL}/reportes/anual`, {
            params: { anio }
        });
        return response.data;
    },
    
    // MÉTODO REQUERIDO PARA EL MODAL DE DETALLE (EL OJITO)
    obtenerDetalleBonosPorPeriodo: async (periodo) => {
        const response = await axios.get(`${API_URL}/reportes/nomina-detalle`, {
            params: { periodo }
        });
        return response.data;
    }
};