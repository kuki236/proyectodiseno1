package com.rrhh.reclutamiento.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CrearVacanteDTO {
    
    @NotNull(message = "El ID del reclutador es obligatorio")
    private Integer idReclutador;
    
    @NotBlank(message = "El nombre de la vacante es obligatorio")
    private String nombre;
    
    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;
    
    @NotBlank(message = "Los requisitos son obligatorios")
    private String requisitos;
    
    @NotBlank(message = "La modalidad es obligatoria")
    private String modalidad;
    
    private String rangoSalarial;
    
    @NotBlank(message = "El departamento es obligatorio")
    private String departamento;
    
    @NotBlank(message = "La prioridad es obligatoria")
    private String prioridad;
    
    @NotBlank(message = "El tipo de contrato es obligatorio")
    private String tipoContrato;
}

