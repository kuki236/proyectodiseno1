package com.rrhh.incentivos.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ResumenMetasDTO {
    private BigDecimal metaGlobalObjetivo;  
    private BigDecimal sumaAsignada;       
    
    private Double porcentajeAvanceEquipo;  
    
    private List<MetaEmpleadoDTO> empleados;
}