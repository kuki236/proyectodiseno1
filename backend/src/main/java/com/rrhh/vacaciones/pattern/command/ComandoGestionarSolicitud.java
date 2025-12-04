package com.rrhh.vacaciones.pattern.command;

public interface ComandoGestionarSolicitud {
    // Al ser stateful, los motivos/comentarios se setean en la instancia antes de ejecutar
    void ejecutar();
}