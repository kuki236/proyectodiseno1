package com.rrhh.vacaciones.pattern.command;

import com.rrhh.vacaciones.model.Solicitud;
import java.util.List;

public interface ComandoConsultarSolicitudes {
    List<Solicitud> ejecutar();
}