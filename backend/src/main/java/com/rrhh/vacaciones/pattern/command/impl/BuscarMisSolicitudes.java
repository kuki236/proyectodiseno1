// Archivo: backend/src/main/java/com/rrhh/vacaciones/pattern/command/impl/BuscarMisSolicitudes.java
package com.rrhh.vacaciones.pattern.command.impl;

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
public class BuscarMisSolicitudes implements ComandoConsultarSolicitudes {

    private final ISolicitudRepository solicitudRepository;

    @Setter
    private Integer idEmpleado;

    @Override
    public List<Solicitud> ejecutar() {
        // CORRECCIÓN: Usar el nombre exacto definido en la interfaz del repositorio
        return solicitudRepository.findByEmpleadoIdEmpleado(idEmpleado);
    }
}