package com.rrhh.auth.service;

import com.rrhh.auth.dto.LoginRequest;
import com.rrhh.auth.dto.LoginResponse;

public interface IServicioAutenticacion {
    LoginResponse login(LoginRequest request);
    void logout(String token);
    boolean validarToken(String token);
    Integer obtenerIdUsuarioDesdeToken(String token);
}

