package com.rrhh.reclutamiento.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class EvaluacionDTO {
    
    @NotNull(message = "El ID del candidato es obligatorio")
    private Integer idCandidato;
    
    @NotNull(message = "El ID del proceso es obligatorio")
    private Integer idProceso;
    
    @NotNull(message = "La puntuación es obligatoria")
    @DecimalMin(value = "0.0", message = "La puntuación mínima es 0")
    @DecimalMax(value = "100.0", message = "La puntuación máxima es 100")
    private BigDecimal puntuacion;
    
    private String comentarios;
    
    @NotNull(message = "El tipo de evaluación es obligatorio")
    private String tipoEvaluacion; // TECNICA, PSICOLOGICA, COMPORTAMENTAL
}

