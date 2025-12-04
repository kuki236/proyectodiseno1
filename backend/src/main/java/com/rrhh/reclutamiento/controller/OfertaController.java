package com.rrhh.reclutamiento.controller;

import com.rrhh.shared.domain.model.Oferta;
import com.rrhh.reclutamiento.dto.EmitirOfertaDTO;
import com.rrhh.reclutamiento.service.IServicioOferta;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ofertas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OfertaController {
    
    private final IServicioOferta servicioOferta;
    
    @PostMapping
    public ResponseEntity<Oferta> emitirOferta(@Valid @RequestBody EmitirOfertaDTO dto) {
        try {
            Oferta oferta = servicioOferta.emitirOferta(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(oferta);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PatchMapping("/{id}/respuesta")
    public ResponseEntity<Oferta> registrarRespuestaOferta(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> request) {
        try {
            boolean aceptada = Boolean.parseBoolean(request.get("aceptada").toString());
            String motivo = (String) request.get("motivo");
            Oferta oferta = servicioOferta.registrarRespuestaOferta(id, aceptada, motivo);
            return ResponseEntity.ok(oferta);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping
    public ResponseEntity<List<Oferta>> obtenerOfertas(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) Integer idCandidato,
            @RequestParam(required = false) Integer idVacante) {
        
        if ("PENDIENTE".equals(estado)) {
            return ResponseEntity.ok(servicioOferta.obtenerOfertasPendientes());
        }
        
        if (idCandidato != null) {
            return ResponseEntity.ok(servicioOferta.obtenerOfertasPorCandidato(idCandidato));
        }
        
        return ResponseEntity.ok(servicioOferta.obtenerOfertasPendientes());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Oferta> obtenerOfertaPorId(@PathVariable Integer id) {
        try {
            Oferta oferta = servicioOferta.obtenerOfertaPorId(id);
            return ResponseEntity.ok(oferta);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<Oferta> cancelarOferta(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request) {
        try {
            String motivo = request.get("motivo");
            Oferta oferta = servicioOferta.cancelarOferta(id, motivo);
            return ResponseEntity.ok(oferta);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

