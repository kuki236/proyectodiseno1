// Archivo: backend/src/main/java/com/rrhh/vacaciones/pattern/facade/EmpleadoPermisosFacade.java
package com.rrhh.vacaciones.pattern.facade;

import com.rrhh.vacaciones.model.HistorialSolicitud;
import com.rrhh.vacaciones.model.Solicitud;
import com.rrhh.vacaciones.pattern.command.impl.BuscarMisSolicitudes;
import com.rrhh.vacaciones.pattern.command.impl.EnviarSolicitud;
import com.rrhh.vacaciones.pattern.command.impl.VerHistorial;
import com.rrhh.vacaciones.repository.IHistorialSolicitudRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmpleadoPermisosFacade {

    private final ApplicationContext context;
    private final IHistorialSolicitudRepository historialRepository;

    public void enviarSolicitud(Solicitud solicitud) {
        // CORRECCIÓN: Obtener nueva instancia, setear datos y ejecutar
        EnviarSolicitud comando = context.getBean(EnviarSolicitud.class);
        comando.setSolicitud(solicitud);
        comando.ejecutar();
    }

    public List<Solicitud> buscarMisSolicitudes(Integer idEmpleado) {
        BuscarMisSolicitudes comando = context.getBean(BuscarMisSolicitudes.class);
        comando.setIdEmpleado(idEmpleado);
        return comando.ejecutar();
    }

    public List<HistorialSolicitud> verHistorial(Integer idSolicitud) {
        // Simulación de objeto para el comando
        Solicitud s = new Solicitud();
        s.setIdSolicitud(idSolicitud);

        VerHistorial comando = context.getBean(VerHistorial.class);
        comando.setSolicitud(s);
        return comando.ejecutar();
    }
}