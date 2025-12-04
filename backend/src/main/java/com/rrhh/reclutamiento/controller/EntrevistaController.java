package com.rrhh.reclutamiento.controller;

import com.rrhh.shared.domain.model.Entrevista;
import com.rrhh.reclutamiento.dto.ProgramarEntrevistaDTO;
import com.rrhh.reclutamiento.service.IServicioEntrevista;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/entrevistas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EntrevistaController {
    
    private final IServicioEntrevista servicioEntrevista;
    
    @PostMapping
    public ResponseEntity<Entrevista> programarEntrevista(@Valid @RequestBody ProgramarEntrevistaDTO dto) {
        try {
            Entrevista entrevista = servicioEntrevista.programarEntrevista(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(entrevista);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PatchMapping("/{id}/reprogramar")
    public ResponseEntity<Entrevista> reprogramarEntrevista(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request) {
        try {
            LocalDate nuevaFecha = LocalDate.parse(request.get("fecha"));
            LocalTime nuevaHora = LocalTime.parse(request.get("hora"));
            Entrevista entrevista = servicioEntrevista.reprogramarEntrevista(id, nuevaFecha, nuevaHora);
            return ResponseEntity.ok(entrevista);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PatchMapping("/{id}/resultados")
    public ResponseEntity<Entrevista> registrarResultados(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> request) {
        try {
            BigDecimal calificacion = request.get("calificacion") != null ? 
                new BigDecimal(request.get("calificacion").toString()) : null;
            String observaciones = (String) request.get("observaciones");
            Entrevista entrevista = servicioEntrevista.registrarResultados(id, calificacion, observaciones);
            return ResponseEntity.ok(entrevista);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/disponibilidad")
    public ResponseEntity<Map<String, Boolean>> verificarDisponibilidad(
            @RequestBody Map<String, String> request) {
        try {
            LocalDate fecha = LocalDate.parse(request.get("fecha"));
            LocalTime hora = LocalTime.parse(request.get("hora"));
            String entrevistador = request.get("entrevistador");
            
            boolean disponible = servicioEntrevista.verificarDisponibilidad(fecha, hora, entrevistador);
            return ResponseEntity.ok(Map.of("disponible", disponible));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping
    public ResponseEntity<List<Entrevista>> obtenerEntrevistas(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) Integer idCandidato,
            @RequestParam(required = false) Integer idProceso) {
        
        if ("PENDIENTE".equals(estado)) {
            return ResponseEntity.ok(servicioEntrevista.obtenerEntrevistasPendientes());
        }
        
        if (idCandidato != null) {
            return ResponseEntity.ok(servicioEntrevista.obtenerEntrevistasPorCandidato(idCandidato));
        }
        
        return ResponseEntity.ok(servicioEntrevista.obtenerEntrevistasPendientes());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Entrevista> obtenerEntrevistaPorId(@PathVariable Integer id) {
        try {
            Entrevista entrevista = servicioEntrevista.obtenerEntrevistaPorId(id);
            return ResponseEntity.ok(entrevista);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<Entrevista> cancelarEntrevista(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request) {
        try {
            String motivo = request.get("motivo");
            Entrevista entrevista = servicioEntrevista.cancelarEntrevista(id, motivo);
            return ResponseEntity.ok(entrevista);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

