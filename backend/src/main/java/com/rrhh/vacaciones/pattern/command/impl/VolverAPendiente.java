package com.rrhh.vacaciones.pattern.command.impl;

import com.rrhh.vacaciones.model.Estado;
import com.rrhh.vacaciones.model.HistorialSolicitud;
import com.rrhh.vacaciones.model.Solicitud;
import com.rrhh.vacaciones.pattern.command.ComandoGestionarSolicitud;
import com.rrhh.vacaciones.repository.IHistorialSolicitudRepository;
import com.rrhh.vacaciones.repository.ISolicitudRepository;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@Scope("prototype")
@RequiredArgsConstructor
public class VolverAPendiente implements ComandoGestionarSolicitud {

    private final ISolicitudRepository solicitudRepository;
    private final IHistorialSolicitudRepository historialRepository;

    @Setter
    private Solicitud solicitud; // Estado inyectado
    @Setter
    private Integer idUsuarioAccion;

    @Override
    @Transactional
    public void ejecutar() {
        // Lógica de negocio: Validar que no esté ya pendiente o cancelada si se requiere
        solicitud.setEstado(Estado.PENDIENTE);
        solicitudRepository.save(solicitud);

        // Registrar en historial
        HistorialSolicitud historial = new HistorialSolicitud();
        historial.setSolicitud(solicitud);
        historial.setEstado(Estado.PENDIENTE);
        historial.setFechaAccion(LocalDateTime.now());
        historial.setComentarios("Retornado a estado Pendiente por administración");

        historial.setIdUsuarioAccion(idUsuarioAccion);

        historialRepository.save(historial);
    }
}