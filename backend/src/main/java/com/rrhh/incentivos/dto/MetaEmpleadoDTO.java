package com.rrhh.incentivos.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class MetaEmpleadoDTO {
    private Integer idMeta;       
    private Integer idEmpleado;
    private String nombreEmpleado;
    private String cargo;       
    private String avatar;       
    
    // Datos de la Meta
    private BigDecimal metaObjetivo;
    private BigDecimal avanceActual;
    private Double porcentajeAvance;
    private String estado;       
}