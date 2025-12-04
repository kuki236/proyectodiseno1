package com.rrhh.incentivos.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class BonoAprobacionDTO {
    private Integer idBono;
    private String nombreEmpleado;
    private String departamento;  
    private String concepto;     
    private String codigoRef;     
    private String evidencia;      
    private BigDecimal monto;
    private boolean alertaMonto;   
    private String estado;         
}