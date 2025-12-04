package com.rrhh.reclutamiento.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostulanteRevisionDTO {
    private Integer idPostulante;
    private String nombres;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String telefono;
    private String email;
    private Integer edad;
    private String genero;
    private String estadoCivil;
    private String fechaNacimiento;
    private String direccion;
}
