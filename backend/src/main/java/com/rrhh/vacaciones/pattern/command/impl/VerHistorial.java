package com.rrhh.vacaciones.pattern.command.impl;

import com.rrhh.vacaciones.model.HistorialSolicitud;
import com.rrhh.vacaciones.model.Solicitud;
import com.rrhh.vacaciones.pattern.command.ComandoConsultarHistorial;
import com.rrhh.vacaciones.repository.IHistorialSolicitudRepository;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Scope("prototype")
@RequiredArgsConstructor
public class VerHistorial implements ComandoConsultarHistorial {

    private final IHistorialSolicitudRepository historialRepository;

    @Setter
    private Solicitud solicitud;

    @Override
    public List<HistorialSolicitud> ejecutar() {
        if (solicitud == null || solicitud.getIdSolicitud() == null) {
            throw new IllegalArgumentException("La solicitud es requerida para ver el historial");
        }
        return historialRepository.findBySolicitudIdSolicitudOrderByFechaAccionDesc(solicitud.getIdSolicitud());
    }
}