// Archivo: backend/src/main/java/com/rrhh/vacaciones/pattern/command/impl/AprobarSolicitud.java
package com.rrhh.vacaciones.pattern.command.impl;

import com.rrhh.shared.exception.BusinessException;
import com.rrhh.vacaciones.model.Estado;
import com.rrhh.vacaciones.model.HistorialSolicitud;
import com.rrhh.vacaciones.model.SaldoVacaciones;
import com.rrhh.vacaciones.model.Solicitud;
import com.rrhh.vacaciones.pattern.command.ComandoGestionarSolicitud;
import com.rrhh.vacaciones.repository.IHistorialSolicitudRepository;
import com.rrhh.vacaciones.repository.ISaldoVacacionesRepository;
import com.rrhh.vacaciones.repository.ISolicitudRepository;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Component
@Scope("prototype") // Importante: Crea una nueva instancia cada vez
@RequiredArgsConstructor
public class AprobarSolicitud implements ComandoGestionarSolicitud {

    private final ISolicitudRepository solicitudRepository;
    private final IHistorialSolicitudRepository historialRepository;
    private final ISaldoVacacionesRepository saldoRepository;

    // Atributos para el estado del comando
    @Setter
    private Solicitud solicitud;
    @Setter
    private String comentarios;

    @Setter
    private Integer idUsuarioAccion;

    @Override
    @Transactional
    public void ejecutar() {
        if (solicitud == null) {
            throw new IllegalStateException("La solicitud no ha sido inicializada en el comando");
        }

        // --- VALIDACIÓN DE SALDO ---
        // Asumimos ID 1 es Vacaciones. Ajusta si en tu BD es diferente.
        if (solicitud.getTipoSolicitud().getIdTipoSolicitud() == 1) {
            Integer anio = solicitud.getFechaInicio().getYear();

            // Buscamos el saldo del empleado para ese año
            SaldoVacaciones saldo = saldoRepository.findByEmpleadoIdEmpleadoAndAnio(
                            solicitud.getEmpleado().getIdEmpleado(), anio)
                    .orElseThrow(() -> new BusinessException("No existe registro de saldo vacacional para este empleado en el año " + anio));

            // Si los días pendientes son menores a los solicitados, lanzamos error
            if (saldo.getDiasPendientes() < solicitud.getDiasSolicitados()) {
                throw new BusinessException(
                        String.format("Saldo insuficiente. El empleado tiene %d días disponibles y solicita %d.",
                                saldo.getDiasPendientes(), solicitud.getDiasSolicitados())
                );
            }
        }
        // ---------------------------

        solicitud.setEstado(Estado.APROBADA);
        solicitudRepository.save(solicitud);

        HistorialSolicitud historial = new HistorialSolicitud();
        historial.setSolicitud(solicitud);
        historial.setEstado(Estado.APROBADA);
        historial.setFechaAccion(LocalDateTime.now());
        historial.setComentarios(comentarios != null ? comentarios : "Solicitud Aprobada");

        historial.setIdUsuarioAccion(idUsuarioAccion);

        historialRepository.save(historial);
    }
}