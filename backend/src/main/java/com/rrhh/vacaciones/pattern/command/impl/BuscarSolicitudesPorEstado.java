package com.rrhh.vacaciones.pattern.command.impl;

import com.rrhh.vacaciones.model.Estado;
import com.rrhh.vacaciones.model.Solicitud;
import com.rrhh.vacaciones.pattern.command.ComandoConsultarSolicitudes;
import com.rrhh.vacaciones.repository.ISolicitudRepository;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Scope("prototype")
@RequiredArgsConstructor
public class BuscarSolicitudesPorEstado implements ComandoConsultarSolicitudes {

    private final ISolicitudRepository solicitudRepository;

    @Setter
    private Estado estado;

    @Override
    public List<Solicitud> ejecutar() {
        return solicitudRepository.findByEstado(estado);
    }
}