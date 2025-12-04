package com.rrhh.incentivos.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ReporteIncentivosDTO {
    private List<String> etiquetasMeses;
    private List<BigDecimal> dataVentas; 
    private List<BigDecimal> dataAtencion; 

    private List<FilaReporteDTO> tablaDetalle;

    @Data
    public static class FilaReporteDTO {
        private String periodo;     
        private String concepto;      
        private Integer numBeneficiarios; 
        private BigDecimal montoTotal;  
        private String estadoPago;      
    }
}