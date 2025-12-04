package com.rrhh.vacaciones.pattern.command;

public interface ComandoSolicitar {
    // No recibe parámetros aquí; la solicitud se inyectará en la clase concreta
    void ejecutar();
}