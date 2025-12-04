// Archivo: backend/src/main/java/com/rrhh/vacaciones/pattern/command/impl/RechazarSolicitud.java
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
public class RechazarSolicitud implements ComandoGestionarSolicitud {

    private final ISolicitudRepository solicitudRepository;
    private final IHistorialSolicitudRepository historialRepository;

    @Setter
    private Solicitud solicitud;
    @Setter
    private String motivo;

    @Setter
    private Integer idUsuarioAccion;

    @Override
    @Transactional
    public void ejecutar() {
        if (solicitud == null) {
            throw new IllegalStateException("La solicitud no ha sido inicializada en el comando");
        }

        solicitud.setEstado(Estado.RECHAZADA);
        solicitud.setMotivoRechazo(motivo);
        solicitudRepository.save(solicitud);

        HistorialSolicitud historial = new HistorialSolicitud();
        historial.setSolicitud(solicitud);
        historial.setEstado(Estado.RECHAZADA);
        historial.setFechaAccion(LocalDateTime.now());
        historial.setComentarios("Rechazado: " + motivo);

        historial.setIdUsuarioAccion(idUsuarioAccion);

        historialRepository.save(historial);
    }
}