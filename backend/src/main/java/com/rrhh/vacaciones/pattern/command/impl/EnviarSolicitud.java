// Archivo: backend/src/main/java/com/rrhh/vacaciones/pattern/command/impl/EnviarSolicitud.java
package com.rrhh.vacaciones.pattern.command.impl;

import com.rrhh.vacaciones.model.Estado;
import com.rrhh.vacaciones.model.Solicitud;
import com.rrhh.vacaciones.pattern.command.ComandoSolicitar;
import com.rrhh.vacaciones.repository.ISolicitudRepository;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

@Component
@Scope("prototype") // IMPORTANTE: Para crear una instancia nueva por cada solicitud
@RequiredArgsConstructor
public class EnviarSolicitud implements ComandoSolicitar {

    private final ISolicitudRepository solicitudRepository;

    // Inyectamos el estado (la solicitud) aquí
    @Setter
    private Solicitud solicitud;

    @Override
    public void ejecutar() {
        if (solicitud == null) {
            throw new IllegalStateException("La solicitud no ha sido inicializada");
        }

        // Ahora usamos 'this.solicitud'
        solicitud.setFechaSolicitud(LocalDate.now());
        solicitud.setEstado(Estado.PENDIENTE);

        // Calculamos los días antes de guardar
        solicitud.calcularDias();

        solicitudRepository.save(solicitud);
    }
}