package com.rrhh.vacaciones.pattern.command;

public interface ComandoReportar {
    // El retorno podría ser un archivo o byte[],
    // pero respetando el UML "void ejecutar()", asumimos que
    // el comando maneja la salida internamente o escribiremos un wrapper.
    // Para ser prácticos en el MVP, lo dejaremos void por ahora.
    void ejecutar();
}