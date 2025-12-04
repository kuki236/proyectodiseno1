// Archivo: backend/src/main/java/com/rrhh/vacaciones/pattern/facade/AdministradorPermisosFacade.java
package com.rrhh.vacaciones.pattern.facade;

import com.rrhh.vacaciones.dto.ReporteSaldoDTO;
import com.rrhh.vacaciones.model.Estado;
import com.rrhh.vacaciones.model.Solicitud;
import com.rrhh.vacaciones.pattern.command.impl.*;
import com.rrhh.vacaciones.repository.ISolicitudRepository;
import com.rrhh.vacaciones.model.EmpleadoResumen; // Importar
import com.rrhh.vacaciones.repository.IEmpleadoResumenRepository; // Importar
import com.rrhh.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdministradorPermisosFacade {

    private final ApplicationContext context;
    private final ISolicitudRepository solicitudRepository;
    private final CalcularSaldos calcularSaldosCommand; // Inyectar el comando

    // Solo inyectamos los comandos que NO tienen estado (Singleton)
    private final BuscarTodasSolicitudes buscarTodasSolicitudesCommand;

    private final IEmpleadoResumenRepository empleadoResumenRepository;

    public void aprobarSolicitud(Integer idSolicitud, String comentarios, Integer idUsuario) {
        Solicitud solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud", idSolicitud));
        AprobarSolicitud comando = context.getBean(AprobarSolicitud.class);
        comando.setSolicitud(solicitud);
        comando.setComentarios(comentarios);
        comando.setIdUsuarioAccion(idUsuario);
        comando.ejecutar();
    }

    public void rechazarSolicitud(Integer idSolicitud, String motivo, Integer idUsuario) {
        Solicitud solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud", idSolicitud));

        // CORRECCIÓN: Pedir nueva instancia, setear datos y ejecutar
        RechazarSolicitud comando = context.getBean(RechazarSolicitud.class);
        comando.setSolicitud(solicitud);
        comando.setMotivo(motivo);
        comando.setIdUsuarioAccion(idUsuario);
        comando.ejecutar();
    }

    public List<Solicitud> buscarTodasSolicitudes() {
        return buscarTodasSolicitudesCommand.ejecutar();
    }

    public void volverAlPendiente(Integer idSolicitud, Integer idUsuario) {
        Solicitud solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        VolverAPendiente comando = context.getBean(VolverAPendiente.class);
        comando.setSolicitud(solicitud);
        comando.setIdUsuarioAccion(idUsuario);
        comando.ejecutar();
    }

    public List<Solicitud> buscarSolicitudesPorEstado(Estado estado) {
        BuscarSolicitudesPorEstado comando = context.getBean(BuscarSolicitudesPorEstado.class);
        comando.setEstado(estado);
        return comando.ejecutar();
    }

    public Solicitud buscarSolicitudPorId(Integer id) {
        Solicitud solicitud = solicitudRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud", id));

        // LOGICA PARA RELLENAR AREA Y PUESTO
        if (solicitud.getEmpleado() != null) {
            Integer idEmpleado = solicitud.getEmpleado().getIdEmpleado();

            // Buscamos los detalles en la vista v_empleados_activos
            empleadoResumenRepository.findById(idEmpleado).ifPresent(resumen -> {
                // Inyectamos los datos en el objeto transitorio
                solicitud.getEmpleado().setArea(resumen.getArea());
                solicitud.getEmpleado().setPuesto(resumen.getPuesto()); // 'Puesto' viene de nombre_puesto en la vista
            });
        }

        return solicitud;
    }

    public List<ReporteSaldoDTO> generarReporteSaldos() {
        return calcularSaldosCommand.ejecutar();
    }

    public void asignarSaldo(Integer idEmpleado, Integer anio, Integer dias) {
        AsignarSaldo comando = context.getBean(AsignarSaldo.class);
        comando.setIdEmpleado(idEmpleado);
        comando.setAnio(anio);
        comando.setDiasAsignados(dias);
        comando.ejecutar();
    }
}