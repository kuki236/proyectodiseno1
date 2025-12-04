package com.rrhh.reclutamiento.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EmitirOfertaDTO {
    
    @NotNull(message = "El ID de la vacante es obligatorio")
    private Integer idVacante;
    
    @NotNull(message = "El ID del candidato es obligatorio")
    private Integer idCandidato;
    
    @NotNull(message = "El salario ofrecido es obligatorio")
    @Positive(message = "El salario debe ser positivo")
    private BigDecimal salarioOfrecido;
    
    @NotBlank(message = "Las condiciones son obligatorias")
    private String condiciones;
    
    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;
    
    private String beneficios;
    private String horario;
}

