package com.rrhh.vacaciones.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReporteSaldoDTO {
    private Integer idEmpleado;
    private String nombreCompleto;
    private String departamento; // Nuevo campo para agrupar
    private String area;         // Campo para mostrar detalle
    private Integer diasTotales;
    private Integer diasGozados;
    private Integer diasPendientes;
}