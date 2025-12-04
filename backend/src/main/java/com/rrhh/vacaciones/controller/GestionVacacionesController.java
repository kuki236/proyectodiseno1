package com.rrhh.vacaciones.controller;

import com.rrhh.vacaciones.dto.AsignarSaldoDTO;
import com.rrhh.vacaciones.dto.ReporteSaldoDTO;
import com.rrhh.vacaciones.dto.SolicitudDTO; // <--- Importar el DTO
import com.rrhh.vacaciones.model.*; // Importar modelos incluyendo Empleado y TipoSolicitud
import com.rrhh.vacaciones.pattern.facade.AdministradorPermisosFacade;
import com.rrhh.vacaciones.pattern.facade.EmpleadoPermisosFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.rrhh.auth.service.IServicioAutenticacion;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/vacaciones")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GestionVacacionesController {

    private final EmpleadoPermisosFacade empleadoFacade;
    private final AdministradorPermisosFacade adminFacade;
    private final IServicioAutenticacion authService;

    // ==========================================
    // ENDPOINTS DE EMPLEADO
    // ==========================================

    @PostMapping("/solicitar")
    public ResponseEntity<?> enviarSolicitud(@RequestBody SolicitudDTO dto) {
        // Mapeo manual de DTO a Entidad
        Solicitud solicitud = new Solicitud();
        solicitud.setFechaInicio(dto.getFechaInicio());
        solicitud.setFechaFin(dto.getFechaFin());
        solicitud.setMotivo(dto.getMotivo());

        // CORRECCIÓN: Usamos Trabajador directamente
        Trabajador trabajador = new Trabajador();
        trabajador.setIdEmpleado(dto.getIdEmpleado());
        solicitud.setEmpleado(trabajador);

        TipoSolicitud tipoRef = new TipoSolicitud();
        tipoRef.setIdTipoSolicitud(dto.getIdTipoSolicitud());
        solicitud.setTipoSolicitud(tipoRef);

        empleadoFacade.enviarSolicitud(solicitud);

        return ResponseEntity.ok(Map.of("message", "Solicitud enviada exitosamente", "estado", "PENDIENTE"));
    }

    // ... (El resto de los endpoints se mantienen igual) ...

    @GetMapping("/mis-solicitudes/{idEmpleado}")
    public ResponseEntity<List<Solicitud>> buscarMisSolicitudes(@PathVariable Integer idEmpleado) {
        List<Solicitud> solicitudes = empleadoFacade.buscarMisSolicitudes(idEmpleado);
        if (solicitudes.isEmpty()) {
            return ResponseEntity.ok(List.of()); // Devuelve lista vacía, no error 204
        }
        return ResponseEntity.ok(solicitudes);
    }

    @GetMapping("/solicitud/{idSolicitud}/historial")
    public ResponseEntity<List<HistorialSolicitud>> verHistorial(@PathVariable Integer idSolicitud) {
        List<HistorialSolicitud> historial = empleadoFacade.verHistorial(idSolicitud);
        return ResponseEntity.ok(historial);
    }

    @GetMapping("/admin/todas")
    public ResponseEntity<List<Solicitud>> buscarTodasSolicitudes() {
        return ResponseEntity.ok(adminFacade.buscarTodasSolicitudes());
    }

    @GetMapping("/admin/estado/{estado}")
    public ResponseEntity<List<Solicitud>> buscarPorEstado(@PathVariable String estado) {
        try {
            Estado estadoEnum = Estado.valueOf(estado.toUpperCase());
            return ResponseEntity.ok(adminFacade.buscarSolicitudesPorEstado(estadoEnum));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/admin/solicitud/{id}/aprobar")
    public ResponseEntity<?> aprobarSolicitud(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "Authorization", required = false) String token) { // Capturar token

        // Obtener ID del usuario desde el token
        Integer idUsuario = null;
        if (token != null && token.startsWith("Bearer ")) {
            idUsuario = authService.obtenerIdUsuarioDesdeToken(token.substring(7));
        }

        String comentarios = body.get("comentarios");
        adminFacade.aprobarSolicitud(id, comentarios, idUsuario); // Pasar ID
        return ResponseEntity.ok(Map.of("message", "Solicitud aprobada correctamente"));
    }

    @PatchMapping("/admin/solicitud/{id}/rechazar")
    public ResponseEntity<?> rechazarSolicitud(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "Authorization", required = false) String token) {

        Integer idUsuario = null;
        if (token != null && token.startsWith("Bearer ")) {
            idUsuario = authService.obtenerIdUsuarioDesdeToken(token.substring(7));
        }

        String motivo = body.get("motivo");
        if (motivo == null || motivo.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El motivo es obligatorio para rechazar"));
        }
        adminFacade.rechazarSolicitud(id, motivo, idUsuario);
        return ResponseEntity.ok(Map.of("message", "Solicitud rechazada correctamente"));
    }

    @PatchMapping("/admin/solicitud/{id}/pendiente")
    public ResponseEntity<?> volverAlPendiente(
            @PathVariable Integer id,
            @RequestHeader(value = "Authorization", required = false) String token) { // 1. Agregamos el parámetro del token

        // 2. Lógica para extraer el ID del usuario
        Integer idUsuario = null;
        if (token != null && token.startsWith("Bearer ")) {
            // authService debe estar inyectado en la clase (private final IServicioAutenticacion authService;)
            idUsuario = authService.obtenerIdUsuarioDesdeToken(token.substring(7));
        }

        // 3. Ahora sí existe la variable idUsuario para pasarla
        adminFacade.volverAlPendiente(id, idUsuario);

        return ResponseEntity.ok(Map.of("message", "La solicitud ha retornado a estado Pendiente"));
    }

    @GetMapping("/solicitud/{id}")
    public ResponseEntity<Solicitud> obtenerSolicitudPorId(@PathVariable Integer id) {
        // Usamos la fachada que acabamos de actualizar
        return ResponseEntity.ok(adminFacade.buscarSolicitudPorId(id));
    }

    @GetMapping("/admin/reportes/saldos")
    public ResponseEntity<List<ReporteSaldoDTO>> obtenerReporteSaldos() {
        return ResponseEntity.ok(adminFacade.generarReporteSaldos());
    }

    @PostMapping("/admin/saldos/asignar")
    public ResponseEntity<?> asignarSaldo(@RequestBody AsignarSaldoDTO dto) {
        adminFacade.asignarSaldo(dto.getIdEmpleado(), dto.getAnio(), dto.getDiasAsignados());
        return ResponseEntity.ok(Map.of("message", "Saldo asignado correctamente"));
    }

}