package com.rrhh.vacaciones.pattern.command;

import java.util.List;

public interface ComandoGenerarReporte<T> {
    List<T> ejecutar();
}