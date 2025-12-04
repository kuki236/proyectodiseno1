package com.rrhh.incentivos.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class MetaAsignacionDTO {
    private Integer idEmpleado;
    private String departamento;
    private String periodo;     
    private String tipoMeta;   
    private BigDecimal valorObjetivo;
}