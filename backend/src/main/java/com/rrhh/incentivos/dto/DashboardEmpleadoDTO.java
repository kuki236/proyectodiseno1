package com.rrhh.incentivos.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class DashboardEmpleadoDTO {
    private String saludo;       
    private String periodo;         

    private BigDecimal montoAcumulado;      
    private String estadoCierre;        
    private String mensajeMotivacional;     

    private List<MetaProgresoItem> misMetas;

    private List<LogroItem> ultimosLogros;

    @Data
    public static class MetaProgresoItem {
        private String titulo;        
        private String subtitulo;      
        private Integer porcentaje;     
        private String mensajeEstado;  
        private String colorEstado;     
    }

    @Data
    public static class LogroItem {
        private String titulo;         
        private String fecha;          
        private String icono;          
    }
}