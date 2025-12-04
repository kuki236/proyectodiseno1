package com.rrhh.vacaciones.pattern.command;

import com.rrhh.vacaciones.model.HistorialSolicitud;
import java.util.List;

public interface ComandoConsultarHistorial {
    List<HistorialSolicitud> ejecutar();
}