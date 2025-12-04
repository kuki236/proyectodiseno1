// Archivo: backend/src/main/java/com/rrhh/vacaciones/dto/SolicitudDTO.java
package com.rrhh.vacaciones.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class SolicitudDTO {
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String motivo;
    private Integer idEmpleado;      // Recibimos solo el ID
    private Integer idTipoSolicitud; // Recibimos solo el ID
}