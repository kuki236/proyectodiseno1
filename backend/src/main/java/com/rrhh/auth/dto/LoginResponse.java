package com.rrhh.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private Integer idUsuario;
    private String username;
    private String nombreCompleto;
    private String email;
    private Integer idReclutador;
    private String tipoUsuario;
}

