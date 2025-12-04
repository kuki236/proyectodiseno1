package com.rrhh.incentivos.controller;

import com.rrhh.incentivos.dto.*;
import com.rrhh.incentivos.service.IIncentivoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/incentivos")
@RequiredArgsConstructor
public class IncentivoController {

    private final IIncentivoService incentivoService;

    @GetMapping("/empleado/{idEmpleado}/bonos")
    public ResponseEntity<List<BonoResumenDTO>> obtenerBonosEmpleado(@PathVariable Integer idEmpleado) {
        return ResponseEntity.ok(incentivoService.obtenerBonosPorEmpleado(idEmpleado));
    }

    @GetMapping("/bono/{idBono}/detalle")
    public ResponseEntity<DetalleEvidenciaDTO> obtenerDetalleBono(@PathVariable Integer idBono) {
        return ResponseEntity.ok(incentivoService.obtenerDetalleBono(idBono));
    }

    @GetMapping("/empleado/{idEmpleado}/dashboard")
    public ResponseEntity<DashboardEmpleadoDTO> obtenerDashboardEmpleado(
            @PathVariable Integer idEmpleado,
            @RequestParam(defaultValue = "2025-12") String periodo) {
        return ResponseEntity.ok(incentivoService.obtenerDashboardEmpleado(idEmpleado, periodo));
    }

    @GetMapping("/admin/dashboard")
    public ResponseEntity<DashboardAdminDTO> obtenerDashboardAdmin(
            @RequestParam(defaultValue = "2025-12") String periodo) {
        return ResponseEntity.ok(incentivoService.obtenerDatosDashboard(periodo));
    }

    @GetMapping("/admin/reglas/{categoria}")
    public ResponseEntity<List<ReglaAdminDTO>> listarReglas(@PathVariable String categoria) {
        return ResponseEntity.ok(incentivoService.listarReglasPorCategoria(categoria));
    }

    @PostMapping("/admin/reglas")
    public ResponseEntity<Void> crearRegla(@RequestBody ReglaCreateDTO dto) {
        incentivoService.crearNuevaRegla(dto);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/admin/reglas/{idRegla}/estado")
    public ResponseEntity<Void> cambiarEstadoRegla(
            @PathVariable Integer idRegla,
            @RequestBody Boolean activo) {
        incentivoService.cambiarEstadoRegla(idRegla, activo);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/admin/reglas/{idRegla}")
    public ResponseEntity<Void> eliminarRegla(@PathVariable Integer idRegla) {
        incentivoService.eliminarRegla(idRegla);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/admin/metas/resumen")
    public ResponseEntity<ResumenMetasDTO> obtenerResumenMetas(
            @RequestParam String departamento,
            @RequestParam(defaultValue = "2025-12") String periodo) {
        return ResponseEntity.ok(incentivoService.obtenerResumenMetas(departamento, periodo));
    }

    @PostMapping("/admin/metas/asignar")
    public ResponseEntity<Void> asignarMeta(@RequestBody MetaAsignacionDTO dto) {
        incentivoService.asignarMetaEmpleado(dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/admin/aprobaciones")
    public ResponseEntity<PantallaAprobacionDTO> obtenerAprobaciones(
            @RequestParam(defaultValue = "2025-12") String periodo) {
        return ResponseEntity.ok(incentivoService.obtenerDataAprobaciones(periodo));
    }

    @PostMapping("/admin/bonos/{idBono}/aprobar")
    public ResponseEntity<Void> aprobarBono(@PathVariable Integer idBono) {
        incentivoService.aprobarBono(idBono);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/admin/bonos/{idBono}/rechazar")
    public ResponseEntity<Void> rechazarBono(@PathVariable Integer idBono) {
        incentivoService.rechazarBono(idBono);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/admin/bonos/aprobar-masivo")
    public ResponseEntity<Void> aprobarMasivo(@RequestBody List<Integer> idsBonos) {
        incentivoService.aprobarMasivo(idsBonos);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/admin/reportes/anual")
    public ResponseEntity<ReporteIncentivosDTO> generarReporteAnual(
            @RequestParam(defaultValue = "2025") String anio) {
        return ResponseEntity.ok(incentivoService.generarReporteAnual(anio));
    }

    @GetMapping("/admin/reportes/nomina-detalle")
    public ResponseEntity<List<BonoDetalleNominaDTO>> obtenerDetalleNomina(
            @RequestParam String periodo) {
        return ResponseEntity.ok(incentivoService.obtenerDetalleNominaPorPeriodo(periodo));
    }
}