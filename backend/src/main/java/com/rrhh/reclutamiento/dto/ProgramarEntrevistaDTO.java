package com.rrhh.reclutamiento.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ProgramarEntrevistaDTO {
    
    @NotNull(message = "El ID del candidato es obligatorio")
    private Integer idCandidato;
    
    @NotNull(message = "El ID del proceso es obligatorio")
    private Integer idProceso;
    
    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;
    
    @NotNull(message = "La hora es obligatoria")
    private LocalTime hora;
    
    @NotBlank(message = "El lugar es obligatorio")
    private String lugar;
    
    @NotBlank(message = "El entrevistador es obligatorio")
    private String entrevistador;
    
    private String observaciones;
}

