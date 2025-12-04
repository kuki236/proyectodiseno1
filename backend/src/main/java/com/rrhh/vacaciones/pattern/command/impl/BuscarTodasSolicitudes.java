package com.rrhh.vacaciones.pattern.command.impl;

import com.rrhh.vacaciones.model.Solicitud;
import com.rrhh.vacaciones.pattern.command.ComandoConsultarSolicitudes;
import com.rrhh.vacaciones.repository.ISolicitudRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class BuscarTodasSolicitudes implements ComandoConsultarSolicitudes {

    private final ISolicitudRepository solicitudRepository;

    @Override
    public List<Solicitud> ejecutar() {
        return solicitudRepository.findAll();
    }
}