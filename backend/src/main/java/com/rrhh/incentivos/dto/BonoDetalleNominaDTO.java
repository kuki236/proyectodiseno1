package com.rrhh.incentivos.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class BonoDetalleNominaDTO {
    private Integer idBono;
    private String nombreEmpleado;
    private String departamento;
    private String concepto; 
    private BigDecimal monto;
    private String estado;
    private LocalDateTime fechaCalculo;
    private String evidenciaResumen; 
}