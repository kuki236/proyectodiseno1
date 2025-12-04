package com.rrhh.incentivos.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class DashboardAdminDTO {
    private BigDecimal totalPagar;          
    private Long pendientesRevision;       
    private Double porcentajeMetasCumplidas; 
    private Long empleadosActivos;           


    private List<BigDecimal> evolucionSemestral; 
    
    private Map<String, BigDecimal> presupuestoPorArea;
}