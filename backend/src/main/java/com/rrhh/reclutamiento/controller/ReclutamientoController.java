package com.rrhh.reclutamiento.controller;

import com.rrhh.shared.domain.model.PostulanteProceso;
import com.rrhh.shared.domain.model.ProcesoSeleccion;
import com.rrhh.shared.domain.enums.EtapaProceso;
import com.rrhh.reclutamiento.service.IServicioReclutamiento;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reclutamiento")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReclutamientoController {
    
    private final IServicioReclutamiento servicioReclutamiento;
    
    @PostMapping("/vincular")
    public ResponseEntity<PostulanteProceso> vincularCandidatoVacante(
            @RequestBody Map<String, Integer> request) {
        try {
            PostulanteProceso resultado = servicioReclutamiento.vincularCandidatoVacante(
                request.get("idCandidato"),
                request.get("idVacante")
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(resultado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/filtrar")
    public ResponseEntity<List<PostulanteProceso>> filtrarCandidatos(
            @RequestBody Map<String, Object> criterios) {
        try {
            List<PostulanteProceso> candidatos = servicioReclutamiento.filtrarCandidatos(criterios);
            return ResponseEntity.ok(candidatos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/evaluar")
    public ResponseEntity<Void> evaluarCandidato(@RequestBody Map<String, Object> request) {
        try {
            servicioReclutamiento.evaluarCandidato(
                (Integer) request.get("idCandidato"),
                (Integer) request.get("idProceso"),
                request
            );
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PatchMapping("/{id}/etapa")
    public ResponseEntity<PostulanteProceso> moverCandidatoEtapa(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request) {
        try {
            EtapaProceso nuevaEtapa = EtapaProceso.valueOf(request.get("etapa"));
            PostulanteProceso resultado = servicioReclutamiento.moverCandidatoEtapa(id, nuevaEtapa);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/proceso/{idProceso}/etapa/{etapa}")
    public ResponseEntity<List<PostulanteProceso>> obtenerCandidatosPorEtapa(
            @PathVariable Integer idProceso,
            @PathVariable String etapa) {
        try {
            EtapaProceso etapaEnum = EtapaProceso.valueOf(etapa);
            List<PostulanteProceso> candidatos = servicioReclutamiento.obtenerCandidatosPorEtapa(idProceso, etapaEnum);
            return ResponseEntity.ok(candidatos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/vacante/{idVacante}/candidatos")
    public ResponseEntity<List<PostulanteProceso>> obtenerCandidatosPorVacante(
            @PathVariable Integer idVacante) {
        try {
            Map<String, Object> criterios = Map.of("idVacante", idVacante);
            List<PostulanteProceso> candidatos = servicioReclutamiento.filtrarCandidatos(criterios);
            return ResponseEntity.ok(candidatos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PatchMapping("/{id}/rechazar")
    public ResponseEntity<PostulanteProceso> rechazarCandidato(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request) {
        try {
            String motivo = request.get("motivo");
            PostulanteProceso resultado = servicioReclutamiento.rechazarCandidato(id, motivo);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/compatibilidad")
    public ResponseEntity<Map<String, Object>> calcularCompatibilidad(
            @RequestParam Integer idCandidato,
            @RequestParam Integer idVacante) {
        try {
            Map<String, Object> resultado = servicioReclutamiento.calcularCompatibilidad(idCandidato, idVacante);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/proceso/vacante/{idVacante}")
    public ResponseEntity<ProcesoSeleccion> obtenerProcesoPorVacante(
            @PathVariable Integer idVacante) {
        try {
            ProcesoSeleccion proceso = servicioReclutamiento.obtenerProcesoPorVacante(idVacante);
            return ResponseEntity.ok(proceso);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}

